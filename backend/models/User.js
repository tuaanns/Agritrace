const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, unique: true },
  avatar: { type: String, default: '' },
  phone: String,
  address: String,
  walletAddress: { type: String, unique: true, sparse: true },
  role: { 
    type: String, 
    enum: ['admin', 'nha_san_xuat', 'nguoi_tieu_dung'], 
    default: 'nguoi_tieu_dung' 
  },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
