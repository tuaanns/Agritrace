const mongoose = require('mongoose');

const ProcessSchema = new mongoose.Schema({
  stage: { 
    type: String, 
    enum: ['gieo_trong', 'cham_soc', 'thu_hoach', 'dong_goi', 'van_chuyen', 'phan_phoi'] 
  },
  title: String,
  description: String,
  location: String,
  performer: String,
  date: { type: Date, default: Date.now },
  image: String
});

const BatchSchema = new mongoose.Schema({
  batchCode: { type: String, required: true, unique: true },
  traceCode: { type: String, required: true, unique: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productionLocation: { type: String, required: true },
  plantingDate: Date,
  harvestDate: Date,
  quantity: Number,
  unit: { type: String, default: 'kg' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Đang sản xuất' },
  processes: [ProcessSchema],
  blockchain: {
    hash: String,
    previousHash: String,
    timestamp: Date,
    verified: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', BatchSchema);
