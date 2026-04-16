import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Box, 
  Check, X, Loader2, AlertCircle, Fingerprint, Calendar, History, ShieldCheck, Database, MapPin, User, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBatches, addBatch, updateBatch, deleteBatch, getProducts, addBatchProcess, deleteBatchProcess, syncBatchBlockchain } from '../services/api';
import { connectWallet } from '../services/blockchain';
import { getContract } from '../services/contracts';
import { QRCodeCanvas } from 'qrcode.react';

const AdminBatches = () => {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  
  const [formData, setFormData] = useState({
    batchCode: '',
    traceCode: '',
    product: '',
    productionLocation: '',
    plantingDate: '',
    harvestDate: '',
    quantity: '',
    unit: 'kg',
    status: 'Đang trồng'
  });

  const [processForm, setProcessForm] = useState({
    stage: 'gieo_trong',
    title: '',
    description: '',
    location: '',
    performer: ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [syncLoading, setSyncLoading] = useState(false);
  const [serverIp, setServerIp] = useState(() => {
    return localStorage.getItem('agritrace_server_ip') || 'http://172.16.1.248:5173/';
  });

  useEffect(() => {
    localStorage.setItem('agritrace_server_ip', serverIp);
  }, [serverIp]);

  useEffect(() => {
    fetchData();
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log("Mẹo: Nhập IP máy tính (vd: 192.168.1.x) để điện thoại quét được QR!");
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchesRes, productsRes] = await Promise.all([
        getBatches(),
        getProducts()
      ]);
      if (batchesRes.data.success) {
        setBatches(batchesRes.data.data);
      }
      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (batch = null) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        batchCode: batch.batchCode,
        traceCode: batch.traceCode,
        product: batch.product?._id || '',
        productionLocation: batch.productionLocation || '',
        plantingDate: batch.plantingDate ? batch.plantingDate.split('T')[0] : '',
        harvestDate: batch.harvestDate ? batch.harvestDate.split('T')[0] : '',
        quantity: batch.quantity || '',
        unit: batch.unit || 'kg',
        status: batch.status || 'Đang trồng'
      });
    } else {
      setEditingBatch(null);
      setFormData({ 
        batchCode: `LO-${new Date().getTime().toString().slice(-6)}`, 
        traceCode: `TX-${new Date().getTime().toString().slice(-6)}`, 
        product: products.length > 0 ? products[0]._id : '', 
        productionLocation: '',
        plantingDate: '',
        harvestDate: '',
        quantity: '',
        unit: 'kg',
        status: 'Đang trồng'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenTimeline = (batch) => {
    setCurrentBatch(batch);
    setIsTimelineOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (editingBatch) {
        response = await updateBatch(editingBatch._id, formData);
      } else {
        response = await addBatch(formData);
      }

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setIsModalOpen(false);
        fetchData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProcess = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await addBatchProcess(currentBatch._id, processForm);
      if (res.data.success) {
        const updatedBatch = { ...currentBatch, processes: res.data.data };
        setCurrentBatch(updatedBatch);
        setBatches(batches.map(b => b._id === currentBatch._id ? updatedBatch : b));
        setProcessForm({ stage: 'gieo_trong', title: '', description: '', location: '', performer: '' });
      }
    } catch (err) {
      alert('Lỗi thêm nhật ký: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProcess = async (processId) => {
    if (!window.confirm('Xóa nhật ký này?')) return;
    try {
      const res = await deleteBatchProcess(currentBatch._id, processId);
      if (res.data.success) {
        const updatedBatch = { ...currentBatch, processes: res.data.data };
        setCurrentBatch(updatedBatch);
        setBatches(batches.map(b => b._id === currentBatch._id ? updatedBatch : b));
      }
    } catch (err) {
      alert('Lỗi xóa nhật ký');
    }
  };

  const handleSyncBlockchain = async (batch) => {
    if (!batch.processes || batch.processes.length === 0) {
      alert('Vui lòng thêm ít nhất một nhật ký sản xuất trước khi đồng bộ Blockchain.');
      return;
    }
    
    setSyncLoading(true);
    try {
      const wallet = await connectWallet();
      const contract = await getContract(wallet.signer);
      
      const lastProcess = batch.processes[batch.processes.length - 1];
      if (!lastProcess) {
        alert("Lô hàng chưa có nhật ký sản xuất để đồng bộ.");
        return;
      }

      // Ghi dữ liệu lên Blockchain với nhãn tiếng Việt sạch
      const stageMapping = {
        'gieo_trong': 'Gieo trồng / Khai thác',
        'cham_soc': 'Chăm sóc',
        'thu_hoach': 'Thu hoạch',
        'dong_goi': 'Đóng gói',
        'van_chuyen': 'Vận chuyển',
        'phan_phoi': 'Phân phối'
      };
      
      const readableStage = stageMapping[lastProcess.stage] || lastProcess.stage;

      const tx = await contract.addTraceRecord(
        batch.traceCode,
        readableStage + ": " + lastProcess.title,
        lastProcess.location || batch.productionLocation
      );
      
      await tx.wait(); // Chờ giao dịch hoàn tất
      
      // Lưu thông tin hash vào DB
      await syncBatchBlockchain(batch._id, {
        hash: tx.hash,
        previousHash: "0x..." // Trong thực tế sẽ lấy từ block trước
      });
      
      alert('Đồng bộ Blockchain thành công cho mã ' + batch.traceCode);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Lỗi đồng bộ: ' + err.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hệ thống theo dõi của lô này? Thao tác không thể phục hồi!')) {
      try {
        const response = await deleteBatch(id);
        if (response.data.success) {
          fetchData();
        }
      } catch (err) {
        alert('Lỗi xóa lô hàng');
      }
    }
  };

  const downloadQRCode = (traceCode) => {
    const canvas = document.getElementById(`qr-${traceCode}`);
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${traceCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="admin-batches-page py-5 mt-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1 d-flex align-items-center gap-2"><Box className="text-primary"/> Quản lý Lô dự án</h2>
            <p className="text-muted small mb-0">Thiết lập vòng đời, ghi nhật ký & xác thực Blockchain.</p>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 bg-light p-2 rounded-3 border">
               <div className="small fw-bold text-muted px-1"><Database size={14}/> IP Server:</div>
               <input 
                 type="text" 
                 className="form-control form-control-sm border-0 bg-transparent" 
                 style={{ width: '180px', fontSize: '13px' }}
                 value={serverIp}
                 onChange={(e) => setServerIp(e.target.value)}
                 placeholder="http://192.168.1.5:5173"
               />
            </div>
            <button onClick={() => handleOpenModal()} className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
              <Plus size={20} /> Tạo lô hàng mới
            </button>
          </div>
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
                  <th className="px-4 py-3 text-muted small">QR CODE</th>
                  <th className="py-3 text-muted small">MÃ LÔ / TRUY XUẤT</th>
                  <th className="py-3 text-muted small">SẢN PHẨM & NGÀY</th>
                  <th className="py-3 text-muted small">TRẠNG THÁI</th>
                  <th className="py-3 text-muted small">BLOCKCHAIN</th>
                  <th className="px-4 py-3 text-muted small text-end">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">Chưa có dữ liệu lô hàng.</td>
                  </tr>
                ) : batches.map((b) => (
                  <tr key={b._id}>
                    <td className="px-4 py-3">
                      <div className="d-flex flex-column align-items-center gap-2">
                        <QRCodeCanvas 
                          id={`qr-${b.traceCode}`}
                          value={`${serverIp.endsWith('/') ? serverIp.slice(0, -1) : serverIp}/trace?code=${b.traceCode}`} 
                          size={64}
                          level={"H"}
                          includeMargin={true}
                        />
                        <button 
                          onClick={() => downloadQRCode(b.traceCode)}
                          className="btn btn-link p-0 text-decoration-none" 
                          style={{ fontSize: '10px' }}
                        >
                          Tải QR
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{b.batchCode}</div>
                      <div className="text-info small mt-1 d-flex align-items-center gap-1">
                        <Fingerprint size={12}/> {b.traceCode}
                      </div>
                    </td>
                    <td>
                      <div className="fw-medium text-dark">{b.product?.name || '---'}</div>
                      <div className="text-muted small d-flex align-items-center gap-1">
                        <Calendar size={12}/> {b.plantingDate ? new Date(b.plantingDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge px-3 py-2 rounded-pill ${
                        b.status === 'Đã phân phối' ? 'bg-success-subtle text-success border border-success border-opacity-25' : 
                        b.status === 'Đang trồng' ? 'bg-warning-subtle text-warning border border-warning border-opacity-25' : 
                        'bg-info-subtle text-info border border-info border-opacity-25'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.blockchain?.hash ? (
                        <div className="d-flex align-items-center gap-1 text-success small fw-bold">
                          <ShieldCheck size={14} /> Đã lên chuỗi
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleSyncBlockchain(b)}
                          className="btn btn-outline-info btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                          disabled={syncLoading}
                        >
                          {syncLoading ? <Loader2 size={12} className="animate-spin"/> : <Database size={12} />}
                          Đồng bộ
                        </button>
                      )}
                    </td>
                    <td className="px-4 text-end">
                      <button onClick={() => handleOpenTimeline(b)} className="btn btn-light btn-sm rounded-circle p-2 mx-1 border shadow-sm" title="Nhật ký sản xuất">
                        <History size={16} className="text-success" />
                      </button>
                      <button onClick={() => handleOpenModal(b)} className="btn btn-light btn-sm rounded-circle p-2 mx-1 border shadow-sm">
                        <Edit2 size={16} className="text-primary" />
                      </button>
                      <button onClick={() => handleDelete(b._id)} className="btn btn-light btn-sm rounded-circle p-2 mx-1 border shadow-sm">
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

      {/* Main Modal - Info */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-backdrop d-flex align-items-center justify-content-center p-3" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-4 shadow-lg w-100 p-4"
              style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">{editingBatch ? 'Sửa thông tin Lô hàng' : 'Cấp mã Lô hàng & Truy xuất mới'}</h4>
                <button onClick={() => setIsModalOpen(false)} className="btn btn-light rounded-circle p-2 border">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-primary">Mã lô hàng (Nội bộ)</label>
                  <input 
                    type="text" className="form-control rounded-3 bg-light" 
                    value={formData.batchCode} onChange={(e) => setFormData({...formData, batchCode: e.target.value})} 
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-info">Mã truy xuất (Public ra Blockchain)</label>
                  <input 
                    type="text" className="form-control rounded-3 bg-light" 
                    value={formData.traceCode} onChange={(e) => setFormData({...formData, traceCode: e.target.value})} 
                    required
                  />
                </div>
                
                <div className="col-12 mt-4 pt-3 border-top">
                  <label className="form-label small fw-bold">Chọn Sản phẩm giống</label>
                  <select 
                    className="form-select rounded-3" 
                    value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})}
                    required
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.category})</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">Địa điểm / Vùng khai thác</label>
                  <input 
                    type="text" className="form-control rounded-3" 
                    value={formData.productionLocation} onChange={(e) => setFormData({...formData, productionLocation: e.target.value})}
                    placeholder="VD: Rừng Lai Châu, Vườn nhãn Hưng Yên..." required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Ngày bắt đầu (Gieo/Đặt tổ)</label>
                  <input 
                    type="date" className="form-control rounded-3" 
                    value={formData.plantingDate} onChange={(e) => setFormData({...formData, plantingDate: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Ngày dự kiến thu hoạch</label>
                  <input 
                    type="date" className="form-control rounded-3" 
                    value={formData.harvestDate} onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold">Sản lượng dự kiến</label>
                  <input 
                    type="number" className="form-control rounded-3" 
                    value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Đơn vị</label>
                  <select 
                    className="form-select rounded-3" 
                    value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="kg">kg</option>
                    <option value="tấn">Tấn</option>
                    <option value="hộp">Hộp</option>
                    <option value="lít">Lít</option>
                    <option value="chai">Chai</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Trạng thái hiện tại</label>
                  <select 
                    className="form-select rounded-3" 
                    value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Đang trồng">Đang sản xuất / Khai thác</option>
                    <option value="Đang vận chuyển">Đang vận chuyển</option>
                    <option value="Đã phân phối">Đã phân phối</option>
                  </select>
                </div>

                <div className="col-12 mt-4 pt-3 text-end">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-light rounded-pill px-4 py-2 me-2">Hủy bỏ</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm" disabled={loading}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : (editingBatch ? 'Cập nhật' : 'Tạo lô hàng')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Timeline Modal */}
      <AnimatePresence>
        {isTimelineOpen && currentBatch && (
          <div className="modal-backdrop d-flex align-items-center justify-content-center p-3" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="bg-white rounded-4 shadow-lg w-100 p-4"
              style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold mb-0">Nhật ký sản xuất: {currentBatch.batchCode}</h4>
                  <p className="text-muted small mb-0">Mã truy xuất: {currentBatch.traceCode}</p>
                </div>
                <button onClick={() => setIsTimelineOpen(false)} className="btn btn-light rounded-circle p-2 border">
                  <X size={20} />
                </button>
              </div>

              <div className="row">
                <div className="col-md-5 border-end">
                  <h6 className="fw-bold mb-3">Thêm hoạt động mới</h6>
                  <form onSubmit={handleAddProcess} className="row g-2">
                    <div className="col-12">
                      <select className="form-select form-select-sm" value={processForm.stage} onChange={(e) => setProcessForm({...processForm, stage: e.target.value})}>
                        <option value="gieo_trong">Gieo trồng</option>
                        <option value="cham_soc">Chăm sóc</option>
                        <option value="thu_hoach">Thu hoạch</option>
                        <option value="dong_goi">Đóng gói</option>
                        <option value="van_chuyen">Vận chuyển</option>
                        <option value="phan_phoi">Phân phối</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <input type="text" className="form-control form-control-sm" placeholder="Tiêu đề công việc" value={processForm.title} onChange={(e) => setProcessForm({...processForm, title: e.target.value})} required/>
                    </div>
                    <div className="col-12">
                      <textarea className="form-control form-control-sm" rows="3" placeholder="Mô tả chi tiết..." value={processForm.description} onChange={(e) => setProcessForm({...processForm, description: e.target.value})}></textarea>
                    </div>
                    <div className="col-12">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light"><MapPin size={14}/></span>
                        <input type="text" className="form-control" placeholder="Địa điểm" value={processForm.location} onChange={(e) => setProcessForm({...processForm, location: e.target.value})}/>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light"><User size={14}/></span>
                        <input type="text" className="form-control" placeholder="Người thực hiện" value={processForm.performer} onChange={(e) => setProcessForm({...processForm, performer: e.target.value})}/>
                      </div>
                    </div>
                    <div className="col-12 mt-3">
                      <button type="submit" className="btn btn-success btn-sm w-100 rounded-pill py-2 fw-bold" disabled={loading}>
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Ghi nhật ký'}
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="col-md-7 ps-4">
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <Activity size={18} className="text-primary"/> Tiến độ hiện tại
                  </h6>
                  <div className="timeline-admin" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {currentBatch.processes && currentBatch.processes.length > 0 ? (
                      [...currentBatch.processes].reverse().map((p) => (
                        <div key={p._id} className="timeline-item-sm border-start ps-3 pb-3 position-relative">
                          <div className="position-absolute start-0 translate-middle-x bg-primary rounded-circle" style={{ width: 10, height: 10, top: 5 }}></div>
                          <div className="d-flex justify-content-between">
                            <div>
                              <div className="fw-bold small">{p.title}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {new Date(p.date).toLocaleString('vi-VN')} | {p.stage}
                              </div>
                              <p className="small text-secondary mb-1">{p.description}</p>
                            </div>
                            <button onClick={() => handleDeleteProcess(p._id)} className="btn btn-link text-danger p-0 h-auto">
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-light rounded-3 text-muted small">
                        Chưa có hoạt động nào được ghi nhận.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBatches;
