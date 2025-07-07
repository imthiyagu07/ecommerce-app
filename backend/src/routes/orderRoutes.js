const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/orders - Place an order from cart
router.post('/', auth, async (request, response) => {
  try {
    const cart = await Cart.findOne({ userId: request.user.userId });
    if (!cart || cart.items.length === 0) {
      return response.status(400).json({ message: 'Cart is empty' });
    }

    const order = new Order({
      userId: request.user.userId,
      items: cart.items,
    });

    await order.save();
    cart.items = []; // Clear cart after ordering
    await cart.save();

    response.status(201).json(order);
  } catch (err) {
    response.status(500).json({ message: 'Order failed', error: err.message });
  }
});

// GET /api/orders - Get orders of current user
router.get('/', auth, async (request, response) => {
  try {
    const orders = await Order.find({ userId: request.user.userId }).populate('items.product');
    response.json(orders);
  } catch (err) {
    response.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

module.exports = router;