const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route POST api/auth/register (DISABLED)
router.post('/register', async (req, res) => {
  return res.status(403).json({ success: false, message: 'Chức năng đăng ký người dùng đã bị đóng.' });
});

// @route POST api/auth/web3-login
router.post('/web3-login', async (req, res) => {
  try {
    const { address, signature } = req.body;
    if (!address) return res.status(400).json({ success: false, message: 'Địa chỉ ví không hợp lệ' });

    // Check if user exists by wallet address
    let user = await User.findOne({ walletAddress: { $regex: new RegExp(`^${address}$`, 'i') } });

    // For demonstration: The first time any wallet connects, we check if it should be admin
    // In production, we would have a predefined list of admin wallets.
    if (!user) {
      // Create user if they are intended to be admin (or just allow the first one for test)
      // Here we assume ANY wallet that connects to login page is an admin for this project context
      user = new User({
        username: `admin_${address.substring(2, 8).toLowerCase()}`,
        password: 'web3_authenticated', // Not used for login
        fullName: 'Administrator',
        walletAddress: address,
        role: 'admin',
        email: `admin_${address.substring(2, 8)}@agritrace.io`
      });
      await user.save();
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn không có quyền truy cập quản trị.' });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        ho_ten: user.fullName,
        vai_tro: user.role,
        wallet: user.walletAddress,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Web3 Login Error:', err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
  }
});

// @route POST api/auth/login
router.post('/login', async (req, res) => {
  return res.status(403).json({ success: false, message: 'Vui lòng sử dụng tính năng Đăng nhập bằng Ví.' });
});

// @route GET api/auth/check
router.get('/check', async (req, res) => {
  // Simple check for now, ideally use middleware
  const token = req.header('x-auth-token');
  if (!token) return res.json({ success: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('-password');
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        ho_ten: user.fullName, 
        vai_tro: user.role, 
        email: user.email, 
        avatar: user.avatar 
      } 
    });
  } catch (err) {
    res.json({ success: false });
  }
});

// @route PUT api/auth/profile
router.put('/profile', async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { fullName, email, phone, address, avatar } = req.body;
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;

    try {
      await user.save();
      res.json({ 
        success: true, 
        message: 'Cập nhật thông tin thành công', 
        user: { id: user.id, username: user.username, ho_ten: user.fullName, email: user.email, vai_tro: user.role, avatar: user.avatar } 
      });
    } catch (saveErr) {
      if (saveErr.code === 11000) {
        return res.status(400).json({ success: false, message: 'Email này đã được sử dụng bởi một tài khoản khác.' });
      }
      throw saveErr;
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT api/auth/password
router.put('/password', async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ success: false, message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET api/auth/users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
