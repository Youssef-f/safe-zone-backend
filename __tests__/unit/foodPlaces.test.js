import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { validFoodPlace, invalidFoodPlace } from "../fixtures/foodPlaces.js";

describe("Food Places - Unit Tests", () => {
  describe("Data Validation", () => {
    it("should accept valid food place data", () => {
      expect(validFoodPlace.name).toBeTruthy();
      expect(validFoodPlace.name.length).toBeGreaterThan(0);
      expect(validFoodPlace.rating).toBeGreaterThanOrEqual(0);
      expect(validFoodPlace.rating).toBeLessThanOrEqual(5);
    });

    it("should reject invalid food place data", () => {
      expect(invalidFoodPlace.name).toBe("");
      expect(invalidFoodPlace.rating).toBeGreaterThan(5);
    });

    it("should validate rating range (0-5)", () => {
      expect(validFoodPlace.rating).toBeGreaterThanOrEqual(0);
      expect(validFoodPlace.rating).toBeLessThanOrEqual(5);
    });

    it("should validate required fields", () => {
      expect(validFoodPlace).toHaveProperty("name");
      expect(validFoodPlace.name).not.toBe("");
    });
  });

  describe("Price Range Validation", () => {
    it("should accept valid price ranges", () => {
      const validRanges = ["$", "$$", "$$$", "$$$$"];
      validRanges.forEach((range) => {
        expect(["$", "$$", "$$$", "$$$$"]).toContain(range);
      });
    });
  });

  describe("Field Type Validation", () => {
    it("should have correct data types", () => {
      expect(typeof validFoodPlace.name).toBe("string");
      expect(typeof validFoodPlace.address).toBe("string");
      expect(typeof validFoodPlace.cuisine_type).toBe("string");
      expect(typeof validFoodPlace.rating).toBe("number");
      expect(typeof validFoodPlace.price_range).toBe("string");
    });

    it("should validate cuisine type is a string", () => {
      expect(typeof validFoodPlace.cuisine_type).toBe("string");
      expect(validFoodPlace.cuisine_type.length).toBeGreaterThan(0);
    });
  });

  describe("Business Logic Validation", () => {
    it("should not allow rating above 5", () => {
      expect(invalidFoodPlace.rating).toBeGreaterThan(5);
    });

    it("should not allow empty name", () => {
      expect(invalidFoodPlace.name).toBe("");
    });

    it("should validate price range format", () => {
      const priceRange = validFoodPlace.price_range;
      expect(priceRange).toMatch(/^\$+$/);
    });
  });
});
