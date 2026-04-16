import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, UserCheck, AlertCircle } from 'lucide-react';
import { registerUser } from '../services/api';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'nguoi_tieu_dung'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp.');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(formData);
      if (response.data.success) {
        navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Tên đăng nhập hoặc email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page py-5 mt-5">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-header">
          <div className="auth-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <UserPlus />
          </div>
          <h3>Tham gia AgriTrace</h3>
          <p className="text-muted">Đăng ký để cùng xây dựng cộng đồng nông sản sạch</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Tên đăng nhập</label>
              <div className="input-group">
                <span className="input-group-text"><User size={18} /></span>
                <input 
                  type="text" 
                  name="username" 
                  className="form-control" 
                  placeholder="john_doe" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Họ tên</label>
              <div className="input-group">
                <span className="input-group-text"><UserCheck size={18} /></span>
                <input 
                  type="text" 
                  name="fullName" 
                  className="form-control" 
                  placeholder="Nguyễn Văn A" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Địa chỉ email</label>
            <div className="input-group">
              <span className="input-group-text"><Mail size={18} /></span>
              <input 
                type="email" 
                name="email" 
                className="form-control" 
                placeholder="name@example.com" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Vai trò</label>
            <select name="role" className="form-select" onChange={handleChange} value={formData.role}>
              <option value="nguoi_tieu_dung">Người tiêu dùng</option>
              <option value="nha_san_xuat">Nhà sản xuất</option>
            </select>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Mật khẩu</label>
              <div className="input-group">
                <span className="input-group-text"><Lock size={18} /></span>
                <input 
                  type="password" 
                  name="password" 
                  className="form-control" 
                  placeholder="••••••••" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <label className="form-label">Xác nhận</label>
              <div className="input-group">
                <span className="input-group-text"><Lock size={18} /></span>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  className="form-control" 
                  placeholder="••••••••" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-3 mb-3 border-0" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>

          <p className="text-center mb-0 text-muted">
            Đã có tài khoản? <Link to="/login" className="text-primary fw-bold">Đăng nhập</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
