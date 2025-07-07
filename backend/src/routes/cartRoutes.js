const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/cart - Get current user's cart
router.get('/', auth, async (request, response) => {
  try {
    let cart = await Cart.findOne({ userId: request.user.userId }).populate('items.product');
    if (!cart) {
        cart = { items: [] };
    }
    response.json(cart);
  } catch (err) {
    response.status(500).json({ message: 'Failed to get cart', error: err.message });
  }
});

// POST /api/cart - Add/update an item in the cart
router.post('/', auth, async (request, response) => {
  try {
    const { productId, quantity } = request.body;
    if (!productId || quantity <= 0) {
      return response.status(400).json({ message: 'Invalid product or quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) {
        return response.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: request.user.userId });
    if (!cart) {
      cart = new Cart({ userId: request.user.userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    response.json(cart);
  } catch (err) {
    response.status(500).json({ message: 'Failed to update cart', error: err.message });
  }
});

// DELETE /api/cart/:id - Remove an item from the cart
router.delete('/:id', auth, async (request, response) => {
  try {
    const cart = await Cart.findOne({ userId: request.user.userId });
    if (!cart) {
        return response.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => !item.product.equals(request.params.id));
    await cart.save();

    response.json({ message: 'Item removed from cart' });
  } catch (err) {
    response.status(500).json({ message: 'Failed to remove item', error: err.message });
  }
});

// PATCH /api/cart/:productId - Increment or decrement quantity
router.patch('/:productId', auth, async (req, res) => {
  try {
    const { change } = req.body;
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.product.equals(productId));
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    item.quantity += change;

    // Auto remove if quantity <= 0
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(i => !i.product.equals(productId));
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update quantity', error: err.message });
  }
});


module.exports = router;