const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Number, enum: [0, 1], default: 0 }, // 0 = User, 1 = Admin
});

module.exports = mongoose.model("User", UserSchema);
