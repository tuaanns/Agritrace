import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Mail, Shield, MoreVertical, Trash2, Edit, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', ho_ten: 'Quản trị viên', email: 'admin@agritrace.vn', vai_tro: 'admin', status: 'active', joined: '12/01/2024' },
    { id: 2, username: 'nongsan_daklak', ho_ten: 'HTX Đắk Lắk', email: 'daklak@farm.vn', vai_tro: 'nha_san_xuat', status: 'active', joined: '15/02/2024' },
    { id: 3, username: 'customer01', ho_ten: 'Nguyễn Văn A', email: 'vana@gmail.com', vai_tro: 'khach_hang', status: 'active', joined: '20/02/2024' },
    { id: 4, username: 'ronaldo', ho_ten: 'Cristiano Ronaldo', email: 'cr7@goat.com', vai_tro: 'khach_hang', status: 'inactive', joined: '01/03/2024' },
  ]);

  const [search, setSearch] = useState('');

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill">Quản trị viên</span>;
      case 'nha_san_xuat': return <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">Nhà sản xuất</span>;
      default: return <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">Khách hàng</span>;
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.ho_ten.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-users-page py-5 mt-5">
      <div className="container">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold mb-1">Quản lý người dùng</h2>
            <p className="text-muted mb-0">Quản lý tài khoản và phân quyền hệ thống.</p>
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4">
            <UserPlus size={18} /> Thêm người dùng
          </button>
        </div>

        {/* Toolbar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group border rounded-pill overflow-hidden bg-light px-3 py-1">
                <span className="input-group-text bg-transparent border-0"><Search size={18} className="text-muted" /></span>
                <input 
                  type="text" 
                  className="form-control bg-transparent border-0 shadow-none ps-0" 
                  placeholder="Tìm theo tên, email, username..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-8 text-md-end">
              <div className="btn-group rounded-pill overflow-hidden border">
                <button className="btn btn-light active small">Tất cả</button>
                <button className="btn btn-light small">Hoạt động</button>
                <button className="btn btn-light small">Đã khóa</button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-muted small text-uppercase fw-bold">Người dùng</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold">Vai trò</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold">Ngày tham gia</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold">Trạng thái</th>
                  <th className="px-4 py-3 text-end text-muted small text-uppercase fw-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((u) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                            {u.ho_ten.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold">{u.ho_ten}</div>
                            <div className="small text-muted d-flex align-items-center gap-1">
                              <Mail size={12} /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{getRoleBadge(u.vai_tro)}</td>
                      <td className="py-3 text-muted small">{u.joined}</td>
                      <td className="py-3">
                        {u.status === 'active' ? (
                          <span className="text-success d-flex align-items-center gap-1 small fw-bold">
                            <CheckCircle2 size={16} /> Đang hoạt động
                          </span>
                        ) : (
                          <span className="text-danger d-flex align-items-center gap-1 small fw-bold">
                            <XCircle size={16} /> Đã tạm khóa
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <button className="btn btn-icon btn-light rounded-circle me-2"><Edit size={16} className="text-muted" /></button>
                        <button className="btn btn-icon btn-light rounded-circle"><Trash2 size={16} className="text-danger" /></button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted mb-0">Không tìm thấy người dùng nào phù hợp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
