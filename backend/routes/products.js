const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().limit(20);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    
    // Find the latest active batch for this product to provide real-time trace code
    const Batch = require('../models/Batch');
    const latestBatch = await Batch.findOne({ product: req.params.id }).sort({ createdAt: -1 });

    const responseData = {
      ...product.toObject(),
      latestBatch: latestBatch ? {
        traceCode: latestBatch.traceCode,
        productionLocation: latestBatch.productionLocation,
        harvestDate: latestBatch.harvestDate,
        status: latestBatch.status
      } : null
    };

    res.json({ success: true, data: responseData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST api/products
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ success: true, message: 'Thêm sản phẩm thành công', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Cập nhật thành công', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
