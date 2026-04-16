import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Tag, 
  DollarSign, Package, Image as ImageIcon,
  MoreVertical, Check, X, Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Trái cây',
    price: '',
    description: '',
    image: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        image: product.image
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'Trái cây', price: '', description: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (editingProduct) {
        response = await updateProduct(editingProduct._id, formData);
      } else {
        response = await addProduct(formData);
      }

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        const response = await deleteProduct(id);
        if (response.data.success) {
          fetchProducts();
        }
      } catch (err) {
        alert('Lỗi xóa sản phẩm');
      }
    }
  };

  return (
    <div className="admin-products-page py-5 mt-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Quản lý Nông sản</h2>
            <p className="text-muted small mb-0">Thêm mới và cập nhật danh mục nông sản hệ thống.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
            <Plus size={20} /> Thêm sản phẩm
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} rounded-4 border-0 shadow-sm d-flex align-items-center gap-2 mb-4`}>
            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-muted small">SẢN PHẨM</th>
                  <th className="py-3 text-muted small">DANH MỤC</th>
                  <th className="py-3 text-muted small">GIÁ</th>
                  <th className="py-3 text-muted small">NGÀY TẠO</th>
                  <th className="px-4 py-3 text-muted small text-end">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Đang tải...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">Chưa có sản phẩm nào.</td>
                  </tr>
                ) : products.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center gap-3">
                        <img src={p.image} className="rounded-3 shadow-sm" style={{ width: 48, height: 48, objectFit: 'cover' }} alt="" />
                        <div>
                          <div className="fw-bold text-dark">{p.name}</div>
                          <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 shadow-sm ${
                        p.category === 'Rau củ quả' ? 'bg-success text-white' :
                        p.category === 'Trái cây' ? 'bg-warning text-dark' :
                        p.category === 'Mật ong' ? 'bg-warning text-dark' :
                        p.category === 'Dược liệu' ? 'bg-info text-white' :
                        p.category === 'Cà phê' ? 'bg-primary text-white' :
                        p.category === 'Gia vị' ? 'bg-secondary text-white' :
                        'bg-dark text-white'
                      }`} style={{ fontWeight: '600', minWidth: '100px', textAlign: 'center' }}>
                        {p.category}
                      </span>
                    </td>
                    <td className="fw-bold text-primary">{p.price}</td>
                    <td className="text-muted small">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 text-end">
                      <button onClick={() => handleOpenModal(p)} className="btn btn-light btn-sm rounded-circle p-2 mx-1 border shadow-sm">
                        <Edit2 size={16} className="text-primary" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="btn btn-light btn-sm rounded-circle p-2 mx-1 border shadow-sm">
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-backdrop d-flex align-items-center justify-content-center p-3" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-4 shadow-lg w-100 p-4"
              style={{ maxWidth: '600px' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">{editingProduct ? 'Sửa sản phẩm' : 'Thêm nông sản mới'}</h4>
                <button onClick={() => setIsModalOpen(false)} className="btn btn-light rounded-circle p-2 border">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-7">
                  <label className="form-label small fw-bold">Tên nông sản</label>
                  <input 
                    type="text" className="form-control rounded-3" 
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="Ví dụ: Cà phê Robusta..." required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label small fw-bold">Danh mục</label>
                  <select 
                    className="form-select rounded-3" 
                    value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Trái cây">Trái cây</option>
                    <option value="Rau củ quả">Rau củ quả</option>
                    <option value="Cà phê">Cà phê</option>
                    <option value="Hạt dinh dưỡng">Hạt dinh dưỡng</option>
                    <option value="Mật ong">Mật ong</option>
                    <option value="Lương thực">Lương thực (Lúa, Ngô...)</option>
                    <option value="Dược liệu">Dược liệu</option>
                    <option value="Gia vị">Gia vị</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Giá hiển thị (VNĐ)</label>
                  <input 
                    type="text" className="form-control rounded-3" 
                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="Ví dụ: 150,000đ" required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Link hình ảnh (URL)</label>
                  <input 
                    type="text" className="form-control rounded-3" 
                    value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://..." required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Mô tả ngắn</label>
                  <textarea 
                    className="form-control rounded-3" rows="3"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
                <div className="col-12 mt-4 pt-2">
                  <button type="submit" className="btn btn-primary w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow" disabled={loading}>
                    {loading && <Loader2 size={20} className="animate-spin" />}
                    {editingProduct ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm ngay'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
