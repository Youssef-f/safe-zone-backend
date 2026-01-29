import express from "express";
import dotenv from "dotenv";
import { supabase } from "./db/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// GET all food places
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

// GET single food place
app.get("/api/food-places/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("food_places")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new food place
app.post("/api/food-places", async (req, res) => {
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

// PUT update food place
app.put("/api/food-places/:id", async (req, res) => {
  try {
    const { name, address, cuisine_type, rating, price_range } = req.body;

    const { data, error } = await supabase
      .from("food_places")
      .update({ name, address, cuisine_type, rating, price_range })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE food place
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
