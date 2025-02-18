const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const { Validation } = require("../validations/validation");

const router = express.Router();
const { createResponse } = require("../utils/responseHelper");

// User Registration
router.post("/register", Validation.registerValidation, async (req, res) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(createResponse(400, false, errors.array()[0].msg));
  }

  if (!name || !email || !password) {
    return res
      .status(400)
      .json(createResponse(400, false, "All fields are required."));
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json(createResponse(400, false, "User already exists."));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res
      .status(200)
      .json(createResponse(200, true, "User registered successfully"));
  } catch (err) {
    res.status(500).json(createResponse(500, false, "Server error"));
  }
});

// User Login
router.post("/login", Validation.loginValidation, async (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(createResponse(400, false, errors.array()[0].msg));
  }

  if (!email || !password) {
    return res
      .status(400)
      .json(createResponse(400, false, "All fields are required."));
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json(createResponse(400, false, "Invalid credentials."));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json(createResponse(400, false, "Invalid credentials."));
    }

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET
      // { expiresIn: "1h" }
    );

    res.json(
      createResponse(200, true, "Login successful", {
        token,
        user: { id: user._id, name: user.name, email: user.email },
      })
    );
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json(createResponse(500, false, "Server error"));
  }
});

module.exports = router;
