const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// @route POST api/contacts
router.post('/', async (req, res) => {
  const { name, phone, email, subject, message } = req.body;

  try {
    // 1. Tạo transporter (Cấu hình gửi mail)
    // Lưu ý: Nếu dùng Gmail, bạn cần tạo "App Password"
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dongnguyenkh123@gmail.com', // Mail admin nhận thông báo
        pass: 'xtws ltfd asvz oexb'   // Điền mật khẩu ứng dụng Gmail vào đây
      }
    });

    // 2. Nội dung Email
    const mailOptions = {
      from: 'dongnguyenkh123@gmail.com', // Phải trùng với mail đăng nhập
      to: 'dongnguyenkh123@gmail.com',
      subject: `[AgriTrace] Yêu cầu hợp tác mới: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #198754;">Yêu cầu hợp tác mới</h2>
          <p>Hệ thống vừa ghi nhận một yêu cầu liên hệ mới với nội dung như sau:</p>
          <hr />
          <p><strong>Họ tên:</strong> ${name}</p>
          <p><strong>Số điện thoại:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Chủ đề:</strong> ${subject}</p>
          <p><strong>Lời nhắn:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${message || 'Không có nội dung tin nhắn.'}
          </div>
          <hr />
          <p style="font-size: 12px; color: #888;">Đây là thông báo tự động từ AgriTrace Ecosystem.</p>
        </div>
      `
    };

    // 3. Gửi mail thực tế
    await transporter.sendMail(mailOptions);

    console.log(`[Email Sent] To: ${mailOptions.to} | Subject: ${subject}`);

    res.json({
      success: true,
      message: 'Yêu cầu của bạn đã được gửi đến Admin. Chúng tôi sẽ phản hồi sớm nhất!'
    });

  } catch (err) {
    console.error('Mail Error:', err);
    res.status(500).json({ success: false, message: 'Không thể gửi mail lúc này. Vui lòng thử lại sau.' });
  }
});

module.exports = router;
