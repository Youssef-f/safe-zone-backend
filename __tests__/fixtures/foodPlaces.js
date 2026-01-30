export const validFoodPlace = {
  name: "Pizza Palace",
  address: "123 Main St",
  cuisine_type: "Italian",
  rating: 4.5,
  price_range: "$$",
};

export const invalidFoodPlace = {
  name: "",
  address: "123 Main St",
  cuisine_type: "Italian",
  rating: 6.0,
  price_range: "$$",
};

export const multipleFoodPlaces = [
  {
    name: "Pizza Palace",
    address: "123 Main St",
    cuisine_type: "Italian",
    rating: 4.5,
    price_range: "$$",
  },
  {
    name: "Burger King",
    address: "456 Oak Ave",
    cuisine_type: "American",
    rating: 4.0,
    price_range: "$",
  },
  {
    name: "Sushi Bar",
    address: "789 Pine Rd",
    cuisine_type: "Japanese",
    rating: 4.8,
    price_range: "$$$",
  },
];

export const updateFoodPlace = {
  name: "Pizza Palace Updated",
  address: "123 Main St Updated",
  cuisine_type: "Italian",
  rating: 4.7,
  price_range: "$$$",
};
