const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }, // Cost of the ingredient
});

const PizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    images: [{ type: String, required: true }],
    basePrice: {
      type: Number,
      required: true, // Default price, e.g., $15
    },
    description: {
      type: String,
    },
    ingredients: [IngredientSchema], // Ingredients available for pizza
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pizza", PizzaSchema);
