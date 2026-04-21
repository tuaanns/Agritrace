import React, { useState } from 'react';
import { User, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { updateProfile } from '../services/api';

const Profile = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: user?.ho_ten || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await updateProfile(profileData);
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        if (setUser) setUser(response.data.user);
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Lỗi cập nhật' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page py-5 mt-5">
      <div className="container">
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="bg-primary py-5 text-center position-relative">
                <div className="position-absolute top-100 start-50 translate-middle">
                  <div className="position-relative">
                    <div className="rounded-circle bg-white p-1 shadow">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          className="rounded-circle object-fit-cover shadow" 
                          style={{ width: 100, height: 100 }} 
                          alt="Avatar" 
                        />
                      ) : (
                        <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold fs-1" style={{ width: 100, height: 100 }}>
                          {user?.ho_ten?.charAt(0) || user?.username?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body pt-5 mt-4 text-center">
                <h4 className="fw-bold mb-1">{user?.ho_ten}</h4>
                <p className="text-muted small mb-3">@{user?.username}</p>
                <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill mb-4">
                  {user?.vai_tro === 'admin' ? 'Quản trị viên hệ thống' : user?.vai_tro === 'nha_san_xuat' ? 'Nhà sản xuất nông sản' : 'Thành viên cộng đồng'}
                </span>
                
                <div className="d-grid gap-2 text-start mt-2">
                  <div className="btn btn-primary d-flex align-items-center gap-3 px-3 py-2 rounded-3 shadow-sm">
                    <User size={18} /> Thông tin cá nhân
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100"
            >
              {message.text && (
                <div className={`alert alert-${message.type} alert-dismissible fade show rounded-3 mb-4`} role="alert">
                  {message.text}
                  <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Hồ sơ của tôi</h5>
              </div>

              <form onSubmit={handleProfileSubmit} className="row g-4">
                <div className="col-md-6">
                  <label className="small text-muted mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0 p-3 rounded-3 fw-bold" 
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="small text-muted mb-1">Email</label>
                  <input 
                    type="email" 
                    className="form-control bg-light border-0 p-3 rounded-3 fw-bold" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="small text-muted mb-1">Link ảnh đại diện (URL)</label>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0 p-3 rounded-3 fw-bold" 
                    value={profileData.avatar}
                    onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                    placeholder="Dán link ảnh tại đây (ví dụ: https://...)"
                  />
                </div>
                <div className="col-md-6">
                  <label className="small text-muted mb-1">Tên đăng nhập</label>
                  <div className="p-3 bg-light rounded-3 fw-bold text-muted">@{user?.username} (Không thể đổi)</div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted mb-1">Ngày tham gia</label>
                  <div className="p-3 bg-light rounded-3 fw-bold text-muted">14/04/2026</div>
                </div>
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2" disabled={loading}>
                    {loading && <Loader2 size={16} className="animate-spin" />} Cập nhật hồ sơ
                  </button>
                </div>
              </form>

              <div className="mt-5 pt-4 border-top">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <CheckCircle size={18} className="text-success" /> Trạng thái xác thực
                </h6>
                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge bg-success border border-success rounded-pill px-3 py-2">Email đã xác minh</span>
                  <span className="badge bg-info border border-info rounded-pill px-3 py-2">Blockchain Wallet Linked</span>
                  {user?.vai_tro === 'admin' && <span className="badge bg-danger border border-danger rounded-pill px-3 py-2">Admin Authorized</span>}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
