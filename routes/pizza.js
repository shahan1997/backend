const express = require("express");
const path = require("path");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Pizza = require("../models/Pizza");

const { createResponse } = require("../utils/responseHelper");

//! Add pizza (product) API
router.post("/add", authMiddleware, async (req, res) => {
  const { name, basePrice, description, ingredients, images } = req.body;

  if (!images || images.length === 0 || images.some((img) => img === "")) {
    return res
      .status(400)
      .json(createResponse(400, false, "At least one image is required"));
  }

  const existingProduct = await Pizza.findOne({ name });
  if (existingProduct) {
    return res
      .status(400)
      .json(
        createResponse(
          400,
          false,
          "Product name must be unique, this name already exists"
        )
      );
  }

  if (!name || !basePrice || !description) {
    return res
      .status(400)
      .json(createResponse(400, false, "Fields are required."));
  }

  //   // Check if the ingredients array is not empty
  //   if (!ingredients || ingredients.length === 0) {
  //     return res
  //       .status(400)
  //       .json(createResponse(400, false, "At least one ingredient is required."));
  //   }

  try {
    // Create a new pizza document
    const newPizza = new Pizza({
      name,
      basePrice,
      description,
      ingredients, // Assuming ingredients is an array of ingredient objects
      images,
    });

    // Save the pizza to the database
    await newPizza.save();

    // Send response after successful addition
    res.status(200).json(
      createResponse(200, true, "Product added successfully", {
        pizza: newPizza,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json(createResponse(500, false, "Failed to add pizza"));
  }
});

//! Get all pizzas
router.get("/", async (req, res) => {
  try {
    const pizzas = await Pizza.find(); // Get all pizzas from the database
    res
      .status(200)
      .json(
        createResponse(200, true, "Product fetched successfully", { pizzas })
      );
  } catch (err) {
    console.error(err);
    res.status(500).json(createResponse(500, false, "Failed to fetch product"));
  }
});

//! Get pizza by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json(createResponse(400, false, "Product ID is required"));
  }

  try {
    const pizza = await Pizza.findById(id);

    if (!pizza) {
      return res
        .status(404)
        .json(createResponse(404, false, "Product not found"));
    }

    res
      .status(200)
      .json(
        createResponse(200, true, "Product fetched successfully", { pizza })
      );
  } catch (err) {
    console.error(err);
    res.status(500).json(createResponse(500, false, "Failed to fetch product"));
  }
});

//! Update pizza by ID
// Update pizza by ID
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, basePrice, description, ingredients, images } = req.body;

  if (!id) {
    return res
      .status(400)
      .json(createResponse(400, false, "Product ID is required"));
  }

  if (!name || !basePrice || !description) {
    return res
      .status(400)
      .json(createResponse(400, false, "Fields are required"));
  }

  // Optional: Validate image input (checking for empty image)
  if (!images || images.length === 0 || images.some((img) => img === "")) {
    return res
      .status(400)
      .json(createResponse(400, false, "At least one image is required"));
  }

  try {
    const pizza = await Pizza.findById(id);

    if (!pizza) {
      return res
        .status(404)
        .json(createResponse(404, false, "Product not found"));
    }

    // Ensure ingredients are passed as an array of objects
    const updatedIngredients =
      ingredients?.map((ingredient) =>
        typeof ingredient === "string"
          ? { name: ingredient, price: 0 } // Default price if only name is passed
          : ingredient
      ) || pizza.ingredients;

    // The images field is already an array of strings, so we don't need to modify it.
    // Ensure images are strings and not objects.
    const updatedImages =
      images?.filter((image) => typeof image === "string") || pizza.images;

    // Update the pizza fields
    pizza.name = name;
    pizza.basePrice = basePrice;
    pizza.description = description;
    pizza.ingredients = updatedIngredients;
    pizza.images = updatedImages;

    await pizza.save(); // Save the updated pizza

    res
      .status(200)
      .json(
        createResponse(200, true, "Product updated successfully", { pizza })
      );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(createResponse(500, false, "Failed to update product"));
  }
});

//! Delete pizza by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json(createResponse(400, false, "Product ID is required"));
  }

  try {
    const pizza = await Pizza.findById(id);

    if (!pizza) {
      return res
        .status(404)
        .json(createResponse(404, false, "Product not found"));
    }

    // Use deleteOne instead of remove
    await Pizza.deleteOne({ _id: id }); // Delete the pizza from the database by its ID

    res
      .status(200)
      .json(createResponse(200, true, "Product deleted successfully"));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(createResponse(500, false, "Failed to delete product"));
  }
});

module.exports = router;
