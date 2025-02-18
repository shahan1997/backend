const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { createResponse } = require("../utils/responseHelper");
const auth = require("../middleware/auth");

//! Place Order API
router.post("/place-order", async (req, res) => {
  const { pizzas, totalAmount } = req.body;

  if (!pizzas || pizzas.length === 0) {
    return res
      .status(400)
      .json(createResponse(400, false, "No pizzas in order"));
  }

  try {
    const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
    const newOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

    const orderPizzas = pizzas.map((pizza) => ({
      pizzaId: pizza.pizzaId,
      name: pizza.name,
      images: pizza.images,
      basePrice: pizza.basePrice,
      description: pizza.description,
      ingredients: pizza.ingredients,
      quantity: pizza.quantity,
      totalPrice: pizza.totalPrice,
      customText: pizza.customText,
    }));

    const newOrder = new Order({
      orderNumber: newOrderNumber, // Unique order number
      pizzas: orderPizzas,
      totalAmount, // Taken directly from request
    });

    await newOrder.save();

    res
      .status(200)
      .json(createResponse(200, true, "Order placed successfully", newOrder));
  } catch (error) {
    console.error(error);
    res.status(500).json(createResponse(500, false, "Failed to place order"));
  }
});

//! Get All Orders API
router.get("/get/orders", auth, async (req, res) => {
  try {
    const orders = await Order.find();
    res
      .status(200)
      .json(createResponse(200, true, "Orders fetched successfully", orders));
  } catch (error) {
    console.error(error);
    res.status(500).json(createResponse(500, false, "Failed to fetch orders"));
  }
});

//! Update Order Status API
router.put("/order/:id", auth, async (req, res) => {
  const { status } = req.body;

  // Validate that the provided status is valid
  const allowedStatuses = [
    "cancelledByAdmin",
    "cancelledByCustomer",
    "delivered",
    "cancelled",
  ];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json(createResponse(400, false, "Invalid status"));
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // Return the updated order
    );

    if (!order) {
      return res
        .status(404)
        .json(createResponse(404, false, "Order not found"));
    }

    res
      .status(200)
      .json(
        createResponse(200, true, "Order status updated successfully", order)
      );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(createResponse(500, false, "Failed to update order status"));
  }
});

//! Cancel Order by Customer API
router.put("/order/cancel/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json(createResponse(404, false, "Order not found"));
    }

    order.status = "cancelledByCustomer";
    await order.save();

    res
      .status(200)
      .json(
        createResponse(
          200,
          true,
          "Order cancelled by customer successfully",
          order
        )
      );
  } catch (error) {
    console.error(error);
    res.status(500).json(createResponse(500, false, "Failed to cancel order"));
  }
});

module.exports = router;
