const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

// GET /api/products (all users)
router.get('/', async (request, response) => {
    try {
        const {page=1, limit=10} = request.query;
        
        const products = await Product.find()
            .skip((page - 1) * limit)
            .limit(Number(limit));

        response.json(products);
    } catch (err) {
        response.status(500).json({message: 'Failed to fetch products', error: err.message})
    }
})

// POST /api/products (admin only)
router.post('/', auth, requireRole('admin'), async (request, response) => {
  try {
    const { name, category, price } = request.body;
    const product = new Product({ name, category, price });
    await product.save();
    response.status(201).json(product);
  } catch (err) {
    response.status(500).json({ message: 'Product creation failed', error: err.message });
  }
});

// PUT /api/products/:id (admin only)
router.put('/:id', auth, requireRole('admin'), async (request, response) => {
  try {
    const updated = await Product.findByIdAndUpdate(request.params.id, request.body, { new: true });
    if (!updated) {
        return response.status(404).json({ message: 'Product not found' });
    }
    response.json(updated);
  } catch (err) {
    response.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// DELETE /api/products/:id (admin only)
router.delete('/:id', auth, requireRole('admin'), async (request, response) => {
  try {
    const deleted = await Product.findByIdAndDelete(request.params.id);
    if (!deleted) {
        return response.status(404).json({ message: 'Product not found' });
    }
    response.json({ message: 'Product deleted' });
  } catch (err) {
    response.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;