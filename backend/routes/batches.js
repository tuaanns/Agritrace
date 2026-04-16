const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Product = require('../models/Product');

// @route GET api/batches/trace/:code
router.get('/trace/:code', async (req, res) => {
  try {
    const rawCode = req.params.code;
    
    // 1. Try finding in Batches
    let batch = await Batch.findOne({ 
      $or: [
        { traceCode: { $regex: new RegExp(`^${rawCode}$`, 'i') } }, 
        { batchCode: { $regex: new RegExp(`^${rawCode}$`, 'i') } }
      ] 
    }).populate('product');

    if (batch) {
      return res.json({
        success: true,
        data: {
          batch: {
            id: batch._id,
            ma_truy_xuat: batch.traceCode,
            ten_nong_san: batch.product?.name,
            hinh_anh: batch.product?.image,
            mo_ta_nong_san: batch.product?.description,
            ngay_san_xuat: batch.plantingDate?.toISOString().split('T')[0],
            dia_diem: batch.productionLocation
          },
          processes: batch.processes.map(p => ({
            id: p._id,
            ten_cong_viec: p.title,
            loai_cong_viec: p.stage,
            mo_ta: p.description,
            ngay_thuc_hien: p.date?.toISOString().split('T')[0],
            nguoi_thuc_hien: p.performer
          })),
          verification: batch.blockchain
        }
      });
    }

    // 2. Fallback: Check if it's a product auto-generated code (TX-Suffix)
    if (rawCode.toUpperCase().startsWith('TX-')) {
      const suffix = rawCode.substring(3).toLowerCase();
      // Find a product whose ID ends with this suffix
      const product = await Product.findOne({
        _id: { $regex: new RegExp(`${suffix}$`, 'i') }
      });

      if (product) {
        return res.json({
          success: true,
          data: {
            batch: {
              id: product._id,
              ma_truy_xuat: rawCode.toUpperCase(),
              ten_nong_san: product.name,
              hinh_anh: product.image,
              mo_ta_nong_san: product.description,
              ngay_san_xuat: product.createdAt?.toISOString().split('T')[0],
              dia_diem: 'Đang cập nhật (Lô hàng chưa khởi tạo)'
            },
            processes: [
              {
                id: 'init',
                ten_cong_viec: 'Khởi tạo thông tin hệ thống',
                loai_cong_viec: 'gieo_trong',
                mo_ta: `Sản phẩm '${product.name}' đã được đăng ký vào hệ thống AgriTrace.`,
                ngay_thuc_hien: product.createdAt?.toISOString().split('T')[0],
                nguoi_thuc_hien: 'Hệ thống'
              }
            ],
            verification: null
          }
        });
      }
    }

    return res.status(404).json({ success: false, message: 'Mã truy xuất không tồn tại.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// @route GET api/batches (Admin/Producer)
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().populate('product');
    res.json({ success: true, data: batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST api/batches
router.post('/', async (req, res) => {
  try {
    const newBatch = new Batch(req.body);
    await newBatch.save();
    res.json({ success: true, message: 'Thêm lô hàng thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT api/batches/:id
router.put('/:id', async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return res.status(404).json({ success: false, message: 'Lô hàng không tồn tại' });
    res.json({ success: true, message: 'Cập nhật lô hàng thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST api/batches/:id/process
router.post('/:id/process', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Lô hàng không tồn tại' });
    
    batch.processes.push(req.body);
    await batch.save();
    res.json({ success: true, message: 'Thêm nhật ký sản xuất thành công!', data: batch.processes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE api/batches/:id/process/:processId
router.delete('/:id/process/:processId', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Lô hàng không tồn tại' });
    
    batch.processes = batch.processes.filter(p => p._id.toString() !== req.params.processId);
    await batch.save();
    res.json({ success: true, message: 'Xóa nhật ký thành công!', data: batch.processes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT api/batches/:id/blockchain
router.put('/:id/blockchain', async (req, res) => {
  try {
    const { hash, previousHash } = req.body;
    const batch = await Batch.findByIdAndUpdate(req.params.id, {
      blockchain: {
        hash,
        previousHash,
        timestamp: new Date(),
        verified: true
      }
    }, { new: true });
    
    if (!batch) return res.status(404).json({ success: false, message: 'Lô hàng không tồn tại' });
    res.json({ success: true, message: 'Đồng bộ Blockchain thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
