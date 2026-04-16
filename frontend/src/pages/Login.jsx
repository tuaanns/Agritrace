import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { connectWallet } from '../services/blockchain';
import { web3Login } from '../services/api';

const Login = ({ setUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleWalletLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const wallet = await connectWallet();
      const address = wallet.address;
      const signer = wallet.signer;

      // Request a signature to prove ownership (Triggers the MetaMask popup)
      const message = `Xác thực quyền Quản trị viên AgriTrace\n\nThời gian: ${new Date().toLocaleString()}\nĐịa chỉ ví: ${address}`;
      const signature = await signer.signMessage(message);

      // Send address and signature to backend
      const response = await web3Login(address, signature);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Ví này không có quyền truy cập quản trị.');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 4001 || err.message?.includes('rejected')) {
        setError('Bạn đã hủy yêu cầu đăng nhập bằng ví.');
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Không thể kết nối với máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page px-3" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card shadow-lg border-0 bg-white p-5 rounded-4"
        style={{ maxWidth: '450px', width: '100%' }}
      >
        <div className="text-center mb-5">
          <div className="mb-4">
            <img src="/logo.png" alt="Logo" style={{ height: '80px', objectFit: 'contain' }} />
          </div>
          <h2 className="fw-bold text-dark mb-2">Đăng nhập</h2>
          <p className="text-muted">Đăng nhập an toàn bằng chữ ký số Blockchain</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 rounded-4 p-3 d-flex align-items-center gap-3 mb-4 shadow-sm">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="small fw-medium">{error}</span>
          </div>
        )}

        <div className="bg-light p-4 rounded-4 mb-5 border">
          <h6 className="fw-bold small text-uppercase tracking-wider mb-3 text-secondary">Hướng dẫn truy cập:</h6>
          <ul className="small text-muted ps-3 mb-0">
            <li className="mb-2">Chỉ dành cho tài khoản Quản trị viên hệ thống.</li>
            <li className="mb-2">Yêu cầu ví MetaMask đã được cấp quyền.</li>
            <li>Dữ liệu được bảo mật bằng mã hóa.</li>
          </ul>
        </div>

        <button
          onClick={handleWalletLogin}
          className="btn btn-primary w-100 py-3 rounded-pill fw-bold fs-5 d-flex align-items-center justify-content-center gap-3 shadow transition-all hover:scale-105"
          disabled={loading}
          style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Wallet size={24} />}
          {loading ? 'Đang xác thực...' : 'Đăng nhập bằng Ví'}
        </button>

        <div className="text-center mt-5 pt-3 border-top">
          <p className="small text-muted mb-0">
            Bạn không phải quản trị viên? <a href="/" className="text-primary text-decoration-none fw-bold">Quay lại Trang chủ <ArrowRight size={14} /></a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
