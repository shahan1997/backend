const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const productsRoutes = require("./routes/products");

dotenv.config(); // Use environment variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Middleware to parse JSON requests and serve static files for image access
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images
//http://localhost:5000/uploads/1732169267708.jpeg

// Routes
app.use("/api/products", productsRoutes);

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGO_URI
    //    {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
