import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import express from "express";
import { supabase } from "../../db/db.js";
import {
  validFoodPlace,
  multipleFoodPlaces,
  updateFoodPlace,
} from "../fixtures/foodPlaces.js";

// Import your routes
const app = express();
app.use(express.json());

const validateFoodPlace = (req, res, next) => {
  const { name, rating } = req.body;

  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ error: "Name is required and cannot be empty" });
  }

  if (rating !== undefined && (rating < 0 || rating > 5)) {
    return res.status(400).json({ error: "Rating must be between 0 and 5" });
  }

  next();
};

// Define routes for testing
app.get("/api/food-places", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("food_places")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/food-places", validateFoodPlace, async (req, res) => {
  try {
    const { name, address, cuisine_type, rating, price_range } = req.body;

    const { data, error } = await supabase
      .from("food_places")
      .insert([{ name, address, cuisine_type, rating, price_range }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/food-places/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("food_places")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Food place not found" });
      }
      throw error;
    }

    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/food-places/:id", validateFoodPlace, async (req, res) => {
  try {
    const { name, address, cuisine_type, rating, price_range } = req.body;

    const { data, error } = await supabase
      .from("food_places")
      .update({ name, address, cuisine_type, rating, price_range })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Food place not found" });
      }
      throw error;
    }

    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/food-places/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("food_places")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

describe("Food Places API - Integration Tests", () => {
  let createdIds = [];

  // Clean up test data after each test
  afterEach(async () => {
    if (createdIds.length > 0) {
      await supabase.from("food_places").delete().in("id", createdIds);
      createdIds = [];
    }
  });

  describe("POST /api/food-places", () => {
    it("should create a new food place", async () => {
      const response = await request(app)
        .post("/api/food-places")
        .send(validFoodPlace)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(validFoodPlace.name);
      expect(response.body.cuisine_type).toBe(validFoodPlace.cuisine_type);

      createdIds.push(response.body.id);
    });

    it("should return 400 for invalid data", async () => {
      const response = await request(app)
        .post("/api/food-places")
        .send({ name: "" }) // Invalid: empty name
        .expect(400); // Changed from 500 to 400

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/food-places", () => {
    beforeEach(async () => {
      // Insert test data
      const { data } = await supabase
        .from("food_places")
        .insert(multipleFoodPlaces)
        .select();

      if (data) {
        createdIds = data.map((item) => item.id);
      }
    });

    it("should return all food places", async () => {
      const response = await request(app).get("/api/food-places").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
    });

    it("should return food places in descending order by created_at", async () => {
      const response = await request(app).get("/api/food-places").expect(200);

      if (response.body.length > 1) {
        const dates = response.body.map((item) => new Date(item.created_at));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i].getTime()).toBeGreaterThanOrEqual(
            dates[i + 1].getTime(),
          );
        }
      }
    });
  });

  describe("GET /api/food-places/:id", () => {
    let testId;

    beforeEach(async () => {
      const { data } = await supabase
        .from("food_places")
        .insert([validFoodPlace])
        .select()
        .single();

      testId = data.id;
      createdIds.push(testId);
    });

    it("should return a single food place by id", async () => {
      const response = await request(app)
        .get(`/api/food-places/${testId}`)
        .expect(200);

      expect(response.body.id).toBe(testId);
      expect(response.body.name).toBe(validFoodPlace.name);
    });

    it("should return 404 for non-existent id", async () => {
      const response = await request(app)
        .get("/api/food-places/99999")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/food-places/:id", () => {
    let testId;

    beforeEach(async () => {
      const { data } = await supabase
        .from("food_places")
        .insert([validFoodPlace])
        .select()
        .single();

      testId = data.id;
      createdIds.push(testId);
    });

    it("should update a food place", async () => {
      const response = await request(app)
        .put(`/api/food-places/${testId}`)
        .send(updateFoodPlace)
        .expect(200);

      expect(response.body.id).toBe(testId);
      expect(response.body.name).toBe(updateFoodPlace.name);
      expect(response.body.rating).toBe(updateFoodPlace.rating);
    });

    it("should return 404 for non-existent id", async () => {
      const response = await request(app)
        .put("/api/food-places/99999")
        .send(updateFoodPlace)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/food-places/:id", () => {
    let testId;

    beforeEach(async () => {
      const { data } = await supabase
        .from("food_places")
        .insert([validFoodPlace])
        .select()
        .single();

      testId = data.id;
      createdIds.push(testId);
    });

    it("should delete a food place", async () => {
      await request(app).delete(`/api/food-places/${testId}`).expect(200);

      // Verify deletion
      const { data } = await supabase
        .from("food_places")
        .select("*")
        .eq("id", testId);

      expect(data.length).toBe(0);

      // Remove from cleanup array since already deleted
      createdIds = createdIds.filter((id) => id !== testId);
    });
  });
});
