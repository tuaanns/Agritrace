import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../services/api';
import { 
  ArrowLeft, ShieldCheck, MapPin, Calendar, 
  Download, Share2, Tag, Box, Info,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverIp, setServerIp] = useState(() => {
    return localStorage.getItem('agritrace_server_ip') || window.location.origin;
  });

  const downloadQRCode = () => {
    const canvas = document.getElementById("product-qr");
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${product.name}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Giả lập lấy dữ liệu từ API
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        setProduct({
          ...data,
          traceCode: data.latestBatch ? data.latestBatch.traceCode : `TX-${data._id?.substring(18).toUpperCase()}`,
          area: data.latestBatch ? data.latestBatch.productionLocation : (data.productionLocation || 'Hợp tác xã AgriTrace'),
          harvestDate: data.latestBatch?.harvestDate 
            ? new Date(data.latestBatch.harvestDate).toLocaleDateString('vi-VN') 
            : (data.harvestDate ? new Date(data.harvestDate).toLocaleDateString('vi-VN') : 'Đang sản xuất')
        });
      }
    } catch (err) {
      console.error('Fetch product detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5 mt-5">
      <div className="spinner-border text-primary me-2"></div>
      <p className="mt-2 text-muted">Đang tải chi tiết nông sản...</p>
    </div>
  );

  if (!product) return (
    <div className="container py-5 mt-5 text-center">
      <div className="alert alert-danger rounded-4 p-5">
        <AlertCircle size={48} className="mb-3" />
        <h4>Không tìm thấy sản phẩm</h4>
        <p>Sản phẩm này có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <Link to="/products" className="btn btn-primary rounded-pill px-4">Quay lại danh sách</Link>
      </div>
    </div>
  );

  const cleanServerIp = serverIp.endsWith('/') ? serverIp.slice(0, -1) : serverIp;
  const fullTraceUrl = `${cleanServerIp}/trace?code=${product.traceCode}`;

  return (
    <div className="product-detail-page py-5 mt-5">
      <div className="container">
        <Link to="/products" className="btn btn-link text-decoration-none text-muted mb-4 d-inline-flex align-items-center gap-2">
          <ArrowLeft size={18} /> Quay lại danh sách
        </Link>

        <div className="row g-5">
          {/* Left: Product Images & Info */}
          <div className="col-lg-7">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card border-0 shadow-lg rounded-4 overflow-hidden"
            >
              <img src={product.image} className="img-fluid w-100 object-fit-cover" style={{ height: '400px' }} alt={product.name} />
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className="badge bg-primary-subtle text-primary mb-2">{product.category}</span>
                    <h2 className="fw-bold">{product.name}</h2>
                  </div>
                  <h4 className="text-primary fw-bold bg-primary-subtle px-3 py-2 rounded-3">{product.price}</h4>
                </div>
                
                <p className="lead text-muted">{product.description}</p>
                
                <hr className="my-4 opacity-10" />
                
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-3 bg-light rounded-4">
                        <MapPin className="text-primary" />
                      </div>
                      <div>
                        <div className="small text-muted">Vùng trồng</div>
                        <div className="fw-bold">{product.area}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-3 bg-light rounded-4">
                        <Calendar className="text-primary" />
                      </div>
                      <div>
                        <div className="small text-muted">Ngày thu hoạch</div>
                        <div className="fw-bold">{product.harvestDate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-4 p-4 bg-success-subtle rounded-4 border border-success border-opacity-25 d-flex gap-3 align-items-center">
              <ShieldCheck size={32} className="text-success" />
              <div>
                <h5 className="fw-bold text-success mb-1">Đảm bảo minh bạch</h5>
                <p className="mb-0 small">Sản phẩm này được lưu trữ lịch sử trên Blockchain Cronos, không thể bị sửa đổi hoặc làm giả.</p>
              </div>
            </div>
          </div>

          {/* Right: QR Code & Trace Code */}
          <div className="col-lg-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card border-0 shadow-lg rounded-4 p-4 sticky-top"
              style={{ top: '100px', zIndex: 10 }}
            >
              <div className="text-center mb-4">
                <h5 className="fw-bold mb-3">Mã QR Truy xuất</h5>
                <div className="bg-white p-3 d-inline-block rounded-4 shadow-sm border">
                  <QRCodeCanvas id="product-qr" value={fullTraceUrl} size={200} level="H" includeMargin={true} />
                </div>
                <p className="small text-muted mt-3 px-4">Quét mã bằng camera điện thoại để xem hành trình từ nông trại đến bàn ăn.</p>
              </div>

              <div className="bg-light p-3 rounded-4 mb-4 text-center">
                <div className="small text-muted mb-1">Mã truy xuất (Unique ID)</div>
                <div className="h4 fw-bold text-primary mb-0 font-monospace">
                   {product.traceCode}
                </div>
              </div>

              <div className="d-grid gap-2">
                <Link to={`/trace?code=${product.traceCode}`} className="btn btn-primary rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2">
                  <ShieldCheck size={20} /> Xem hành trình nông sản
                </Link>
                <div className="row g-2 mt-2">
                  <div className="col-6">
                    <button onClick={downloadQRCode} className="btn btn-outline-light text-dark border w-100 rounded-pill py-2 small d-flex align-items-center justify-content-center gap-2 transition">
                      <Download size={16} /> Tải mã QR
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-outline-light text-dark border w-100 rounded-pill py-2 small d-flex align-items-center justify-content-center gap-2 transition" onClick={() => {
                        navigator.clipboard.writeText(fullTraceUrl);
                        alert('Đã sao chép liên kết tra cứu!');
                    }}>
                      <Share2 size={16} /> Chia sẻ
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
