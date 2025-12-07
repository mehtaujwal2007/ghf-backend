const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product'); // adjust path as needed

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// POST: Add Product with Image Upload
router.post('/admin/products', upload.single('image'), async (req, res) => {
  try {
    const { name, category } = req.body;
    const image = `/uploads/${req.file.filename}`;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category required' });
    }

    const newProduct = new Product({ name, category, image });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: List Products
router.get('/admin/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// DELETE: Remove Product
router.delete('/admin/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;
