import express from "express";
import dotenv from "dotenv";
import { supabase } from "./db/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

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

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/food-places", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("food_places")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
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

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
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
    console.error("Error:", error);
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

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
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
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
