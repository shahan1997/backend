const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: Number, unique: true, required: true }, // Ensure unique order number
    pizzas: [
      {
        pizzaId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Pizza",
          required: true,
        },
        name: { type: String, required: true },
        images: [{ type: String, required: true }],
        basePrice: { type: Number, required: true },
        description: { type: String },
        ingredients: [
          {
            name: { type: String, required: true },
            price: { type: Number, required: true },
          },
        ],
        quantity: { type: Number, required: true, default: 1 },
        totalPrice: { type: Number, required: true },
        customText: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "delivered", "cancelledByAdmin", "cancelledByCustomer"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
