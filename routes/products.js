const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const router = express.Router();
const { createResponse } = require("../utils/responseHelper");

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Folder to store images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set a unique filename
  },
});

const upload = multer({ storage: storage }).array("images", 5); // Accept up to 5 images

// POST route to upload multiple images
router.post("/upload-images", upload, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json(createResponse(400, false, "No images uploaded"));
    }

    const images = req.files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      isFeatured: index === 0,
    }));

    res.status(200).json(
      createResponse(200, true, "Images uploaded successfully", {
        images: images,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json(createResponse(500, false, "Image upload failed"));
  }
});

//!Add product
// Add product
router.post("/add", async (req, res) => {
  const { name, sku, quantity, description, images, price } = req.body;

  if (!images || images.length === 0) {
    return res
      .status(400)
      .json(createResponse(400, false, "At least one image is required"));
  }

  const existingProduct = await Product.findOne({ sku });
  if (existingProduct) {
    return res
      .status(400)
      .json(
        createResponse(
          400,
          false,
          "SKU must be unique, this SKU already exists"
        )
      );
  }

  const existingProductName = await Product.findOne({ name });
  if (existingProductName) {
    return res
      .status(400)
      .json(
        createResponse(
          400,
          false,
          "Product Name must be unique, this name already exists"
        )
      );
  }

  try {
    const newProduct = new Product({
      name,
      sku,
      quantity,
      description,
      images,
      price,
    });

    await newProduct.save();
    res.status(200).json(
      createResponse(200, true, "Product added successfully", {
        product: newProduct,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json(createResponse(500, false, "Failed to add product"));
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();

    // Adjusted response to have products directly within the data field
    res
      .status(200)
      .json(
        createResponse(200, true, "Products fetched successfully", products)
      );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(createResponse(500, false, "Failed to fetch products"));
  }
});

// GET route to fetch a product by its ID
router.get("/product/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json(createResponse(404, false, "Product not found"));
    }

    // Return the found product with a consistent response format
    res.status(200).json(
      createResponse(200, true, "Product fetched successfully", {
        product: product,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json(createResponse(500, false, "Failed to fetch product"));
  }
});

// PUT route to edit a product
router.put("/product/:id", async (req, res) => {
  const { id } = req.params;
  const { name, sku, quantity, description, images, price } = req.body;

  try {
    // Find the current product
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res
        .status(404)
        .json(createResponse(404, false, "Product not found"));
    }

    // Validate if the SKU or Product Name already exists
    const existingProduct = await Product.findOne({ sku, _id: { $ne: id } });
    if (existingProduct) {
      return res
        .status(400)
        .json(
          createResponse(
            400,
            false,
            "SKU must be unique, this SKU already exists"
          )
        );
    }

    const existingProductName = await Product.findOne({
      name,
      _id: { $ne: id },
    });
    if (existingProductName) {
      return res
        .status(400)
        .json(
          createResponse(
            400,
            false,
            "Product Name must be unique, this name already exists"
          )
        );
    }

    // Check if the new values (excluding images) are the same as the current product
    if (currentProduct.name === name || currentProduct.sku === sku) {
      // If all values are the same, return a message indicating no changes
      return res
        .status(400)
        .json(
          createResponse(400, false, "No changes detected in product data")
        );
    }

    // Update product data
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        sku,
        quantity,
        description,
        images,
        price,
      },
      { new: true }
    );

    // Return the updated product with a consistent response format
    res.status(200).json(
      createResponse(200, true, "Product updated successfully", {
        product: updatedProduct,
      })
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(createResponse(500, false, "Failed to update product"));
  }
});

// DELETE route to remove a product
router.delete("/product/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json(createResponse(404, false, "Product not found"));
    }

    // Return a success message with a consistent response format
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

// Search route to find products by SKU or product name
router.get("/search", async (req, res) => {
  const { query } = req.query; // Retrieve the search query from the query string

  if (!query) {
    return res
      .status(400)
      .json(createResponse(400, false, "Search query is required"));
  }

  try {
    // Find products where SKU or Name matches the query (case-insensitive)
    const products = await Product.find({
      $or: [
        { sku: { $regex: query, $options: "i" } }, // Search SKU (case-insensitive)
        { name: { $regex: query, $options: "i" } }, // Search Name (case-insensitive)
      ],
    });

    // If no products are found, return a not found message
    if (products.length === 0) {
      return res
        .status(404)
        .json(
          createResponse(
            404,
            false,
            "No products found matching the search query"
          )
        );
    }

    // Return the found products with a consistent response format
    res.status(200).json(
      createResponse(200, true, "Products found successfully", {
        products: products,
      })
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(createResponse(500, false, "Failed to search for products"));
  }
});

module.exports = router;
