const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Batch = require('../models/Batch');

router.get('/', async (req, res) => {
  try {
    const nong_san = await Product.countDocuments();
    const lo_san_pham = await Batch.countDocuments();
    // Simulate other stats
    const qua_trinh = await Batch.aggregate([
      { $project: { processCount: { $size: "$processes" } } },
      { $group: { _id: null, total: { $sum: "$processCount" } } }
    ]);
    const blockchain = await Batch.countDocuments({ "blockchain.verified": true });

    res.json({
      success: true,
      data: {
        nong_san,
        lo_san_pham,
        qua_trinh: qua_trinh[0]?.total || 0,
        blockchain
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/stats/dashboard - Real-time dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // --- Counts ---
    const [nong_san, lo_san_pham, blockchain] = await Promise.all([
      Product.countDocuments(),
      Batch.countDocuments(),
      Batch.countDocuments({ "blockchain.verified": true })
    ]);

    const qua_trinh = await Batch.aggregate([
      { $project: { processCount: { $size: "$processes" } } },
      { $group: { _id: null, total: { $sum: "$processCount" } } }
    ]);

    // --- Recent Activities (latest 10 batches with their latest process) ---
    const recentBatches = await Batch.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('product', 'name image category');

    const activities = [];

    for (const batch of recentBatches) {
      // Add batch creation event
      activities.push({
        id: batch._id.toString() + '_create',
        type: 'batch_created',
        title: `Tạo lô hàng #${batch.batchCode}`,
        product: batch.product?.name || 'Không rõ',
        location: batch.productionLocation || 'Đang cập nhật',
        date: batch.createdAt,
        status: batch.status,
        isBlockchainVerified: batch.blockchain?.verified || false,
        traceCode: batch.traceCode,
        batchCode: batch.batchCode
      });

      // Add latest processes from this batch
      if (batch.processes && batch.processes.length > 0) {
        const sortedProcesses = [...batch.processes].sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const process of sortedProcesses.slice(0, 2)) {
          activities.push({
            id: process._id?.toString() || batch._id.toString() + '_proc',
            type: 'process_added',
            title: process.title || `Ghi nhận ${process.stage}`,
            product: batch.product?.name || 'Không rõ',
            location: process.location || batch.productionLocation || 'Đang cập nhật',
            performer: process.performer || 'Hệ thống',
            date: process.date,
            stage: process.stage,
            batchCode: batch.batchCode,
            isBlockchainVerified: batch.blockchain?.verified || false
          });
        }
      }
    }

    // Sort all activities by date descending, take top 8
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivities = activities.slice(0, 8);

    // --- Batch status breakdown ---
    const statusBreakdown = await Batch.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        stats: {
          nong_san,
          lo_san_pham,
          qua_trinh: qua_trinh[0]?.total || 0,
          blockchain
        },
        recentActivities,
        statusBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
