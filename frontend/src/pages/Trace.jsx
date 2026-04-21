import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getTrace } from '../services/api';
import { Search, MapPin, Calendar, Box, Package, ArrowRight, ShieldCheck, TreePine, Droplets, Wheat, Truck, Store, Database, Loader2, CheckCircle2, AlertCircle, Camera, X, Smartphone, Globe, QrCode, Activity, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getContract } from '../services/contracts';
import { ethers } from 'ethers';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Trace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchCode = searchParams.get('code') || '';
  const [code, setCode] = useState(searchCode);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [blockchainData, setBlockchainData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let scanner = null;
    
    const startScanner = async () => {
      try {
        const element = document.getElementById('reader');
        if (!element) return;
        
        scanner = new Html5QrcodeScanner('reader', {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1
        }, false);

        scanner.render((decodedText) => {
          let finalCode = decodedText;
          if (decodedText.includes('code=')) {
            const parts = decodedText.split('code=');
            if (parts.length > 1) {
              finalCode = parts[1].split('&')[0];
            }
          }
          
          setCode(finalCode);
          setIsScanning(false);
          setSearchParams({ code: finalCode });
          handleSearch(finalCode);
          
          if (scanner) {
            scanner.clear().catch(e => console.warn("Scanner clear error", e));
          }
        }, (errorMessage) => {
          // Silent failure for frame errors
        });
      } catch (err) {
        console.error("Scanner init error", err);
        setIsScanning(false);
      }
    };

    if (isScanning) {
      const timer = setTimeout(startScanner, 100);
      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch(e => console.warn("Cleanup clear error", e));
        }
      };
    }
  }, [isScanning]);

  useEffect(() => {
    if (searchCode) {
      handleSearch(searchCode);
    }
  }, [searchCode]);

  const handleSearch = async (queryCode) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await getTrace(queryCode);
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Search error:', err);
      if (err.response?.status === 404 || err.response?.data?.success === false) {
        setError('Không tìm thấy thông tin trong cơ sở dữ liệu. Bạn có muốn kiểm tra trực tiếp trên Blockchain?');
        setResult({ batch: { ma_truy_xuat: queryCode, ten_nong_san: "Sản phẩm chưa đăng ký" }, processes: [] });
      } else {
        setError('Có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBlockchain = async () => {
    setVerifyLoading(true);
    setBlockchainData(null);
    try {
      const provider = new ethers.JsonRpcProvider('https://evm-t3.cronos.org');
      const contract = await getContract(provider);
      const count = await contract.getTraceCount(result.batch.ma_truy_xuat);
      const total = Number(count);
      const records = [];
      for (let i = 0; i < total; i++) {
        const record = await contract.getRecord(result.batch.ma_truy_xuat, i);
        records.push({
          action: record[0],
          location: record[1],
          timestamp: new Date(Number(record[2]) * 1000).toLocaleString()
        });
      }
      setBlockchainData(records);
    } catch (err) {
      console.error(err);
      alert("Xác minh Blockchain thất bại: " + err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const formatAction = (action) => {
    if (!action) return '---';
    const mapping = {
      'gieo_trong': 'Gieo trồng / Khai thác',
      'cham_soc': 'Chăm sóc',
      'thu_hoach': 'Thu hoạch',
      'dong_goi': 'Đóng gói',
      'van_chuyen': 'Vận chuyển',
      'phan_phoi': 'Phân phối'
    };
    
    let formatted = action;
    Object.keys(mapping).forEach(key => {
      formatted = formatted.replace(key, mapping[key]);
    });
    return formatted;
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'gieo_trong': return <TreePine size={24} />;
      case 'cham_soc': return <Droplets size={24} />;
      case 'thu_hoach': return <Wheat size={24} />;
      case 'dong_goi': return <Package size={24} />;
      case 'van_chuyen': return <Truck size={24} />;
      case 'phan_phoi': return <Store size={24} />;
      default: return <Box size={24} />;
    }
  };

  return (
    <div className="trace-page py-5 mt-5">
      {/* Nền trang trí */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden pointer-events-none opacity-25" style={{ zIndex: -1 }}>
         <div className="position-absolute" style={{ top: '10%', left: '5%' }}><Wheat size={120} className="text-success opacity-10" /></div>
         <div className="position-absolute" style={{ bottom: '20%', right: '10%' }}><ShieldCheck size={180} className="text-success opacity-10" /></div>
         <div className="position-absolute" style={{ top: '40%', right: '5%' }}><Globe size={100} className="text-success opacity-10" /></div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fw-bold fs-1 mb-2"
                style={{ background: 'linear-gradient(to right, #198754, #20c997)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Tra cứu nguồn gốc
              </motion.h2>
              <p className="text-muted fs-5">Minh bạch hành trình thực phẩm từ bàn ăn đến trang trại.</p>
            </div>

            {/* Premium Search Box */}
            <div className="search-box-wrapper mb-5 p-2 bg-white rounded-5 shadow-lg border border-white">
              <form 
                className="d-flex gap-2 p-2" 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!code) return;
                  setSearchParams({ code });
                  handleSearch(code);
                }}
              >
                <div className="position-relative flex-grow-1">
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                     <QrCode size={24} />
                  </div>
                  <input 
                    type="text" 
                    className="form-control form-control-lg border-0 ps-5 py-3 fs-5"
                    placeholder="Nhập mã truy xuất (VD: TX-DE0001)..." 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ background: 'transparent', boxShadow: 'none' }}
                  />
                </div>
                <button className="btn btn-success px-4 py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center gap-2" type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)', border: 'none', transition: 'transform 0.2s' }}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={22} />}
                  <span className="d-none d-md-inline">Tra cứu ngay</span>
                </button>
                <button 
                  type="button" 
                  className={`btn ${isScanning ? 'btn-danger' : 'btn-outline-success'} px-4 py-3 rounded-4 shadow-sm fw-bold border-2 d-flex align-items-center gap-2`}
                  onClick={() => setIsScanning(!isScanning)}
                >
                  {isScanning ? <X size={22} /> : <Camera size={22} />}
                  <span className="d-none d-md-inline">{isScanning ? 'Đóng' : 'Quét Camera'}</span>
                </button>
              </form>
            </div>

            {/* Scanner Container */}
            <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-5 overflow-hidden rounded-4 shadow-xl bg-white border border-success border-2"
                  >
                    <div className="p-3 bg-success text-white d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2 small fw-bold uppercase">
                         <Activity className="animate-pulse" size={16}/> Sẵn sàng nhận diện mã QR
                      </div>
                      <button className="btn btn-sm btn-link text-white p-0" onClick={() => setIsScanning(false)}><X size={20}/></button>
                    </div>
                    <div id="reader" style={{ width: '100%', background: '#000' }}></div>
                  </motion.div>
                )}
              </AnimatePresence>

            {/* How it works SECTION - Only show when no result yet */}
            {/* How it works SECTION - Only show when no result yet */}
            {!result && !error && !loading && (
               <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
               >
                  <div className="row g-4 mt-2">
                    <div className="col-md-4">
                       <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-up transition bg-white bg-opacity-75">
                          <div className="mb-3 d-inline-block p-3 rounded-4 bg-success bg-opacity-10 text-success">
                             <Camera size={28} />
                          </div>
                          <h6 className="fw-bold mb-2">1. Quét mã</h6>
                          <p className="small text-muted mb-0 lh-base text-start">Sử dụng Camera điện thoại hoặc webcam để nhận diện mã QR trên bao bì.</p>
                       </div>
                    </div>
                    <div className="col-md-4">
                       <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-up transition bg-white bg-opacity-75">
                          <div className="mb-3 d-inline-block p-3 rounded-4 bg-warning bg-opacity-10 text-warning">
                             <Box size={28} />
                          </div>
                          <h6 className="fw-bold mb-2">2. Xem hành trình</h6>
                          <p className="small text-muted mb-0 lh-base text-start">Theo dõi toàn bộ quá trình từ lúc gieo hạt đến khi tới tay người tiêu dùng.</p>
                       </div>
                    </div>
                    <div className="col-md-4">
                       <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center hover-up transition bg-white bg-opacity-75">
                          <div className="mb-3 d-inline-block p-3 rounded-4 bg-primary bg-opacity-10 text-primary">
                             <ShieldCheck size={28} />
                          </div>
                          <h6 className="fw-bold mb-2">3. Xác thực Web3</h6>
                          <p className="small text-muted mb-0 lh-base text-start">Dữ liệu lưu trữ trên Blockchain Cronos, minh bạch và không thể giả mạo.</p>
                       </div>
                    </div>
                  </div>
               </motion.div>
            )}

            {error && (
              <div className="alert alert-warning text-center shadow-sm border-0 rounded-4 p-4 mt-4">
                <AlertCircle className="text-warning mb-3" size={48} />
                <h5 className="fw-bold">Thông báo</h5>
                <p className="text-muted mb-3">{error}</p>
                {error.includes('Blockchain') && (
                   <button className="btn btn-success rounded-pill px-4" onClick={handleVerifyBlockchain}>
                     Tra cứu Blockchain ngay
                   </button>
                )}
              </div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="trace-results mt-5"
              >
                {/* Result Cards... (omitted repetitive parts, keep the same as previous functional code) */}
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
                  <div className="row g-0">
                    <div className="col-md-4">
                      <img 
                        src={result.batch?.hinh_anh ? (result.batch.hinh_anh.startsWith('http') ? result.batch.hinh_anh : `/QuanLyNongSan/assets/images/${result.batch.hinh_anh}`) : 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=500&auto=format&fit=crop&q=60'} 
                        className="img-fluid h-100 object-fit-cover w-100" 
                        alt={result.batch.ten_nong_san} 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=500&auto=format&fit=crop&q=60'; }}
                      />
                    </div>
                    <div className="col-md-8">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          {result.verification?.hash ? (
                            <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
                              <ShieldCheck size={14} className="me-1" /> Đã xác thực Blockchain
                            </span>
                          ) : (
                            <span className="badge bg-warning-subtle text-warning border border-warning px-3 py-2 rounded-pill">
                              <AlertCircle size={14} className="me-1" /> Chưa xác thực Blockchain
                            </span>
                          )}
                          <span className="text-muted small">#{result.batch.ma_truy_xuat}</span>
                        </div>
                        <h3 className="card-title fw-bold mb-1">{result.batch.ten_nong_san}</h3>
                        <p className="text-muted mb-4">{result.batch.mo_ta_nong_san}</p>
                        <div className="row g-3">
                          <div className="col-sm-6"><div className="d-flex align-items-center gap-2"><Calendar className="text-success" size={18} /><div><small className="text-muted d-block">Ngày sản xuất</small><strong>{result.batch.ngay_san_xuat}</strong></div></div></div>
                          <div className="col-sm-6"><div className="d-flex align-items-center gap-2"><MapPin className="text-success" size={18} /><div><small className="text-muted d-block">Địa điểm</small><strong>{result.batch.dia_diem || 'Hợp tác xã AgriTrace'}</strong></div></div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Info */}
                <div className="card border-0 shadow-sm rounded-4 bg-white mb-4 p-3 border-start border-5 border-success">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <h6 className="fw-bold mb-0 text-success d-flex align-items-center gap-2">
                        <Database size={18} /> Kết nối Blockchain Cronos
                      </h6>
                      <p className="small text-muted mb-0">Mã băm dữ liệu phi tập trung đảm bảo tính minh bạch.</p>
                    </div>
                    <div className="d-flex gap-2">
                       {result.verification?.hash && (
                        <a 
                          href={`https://explorer.cronos.org/testnet/tx/${result.verification.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-2 shadow-sm"
                        >
                          <ExternalLink size={16} /> <span className="d-none d-sm-inline">Xem giao dịch</span>
                        </a>
                      )}
                      <button className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" onClick={handleVerifyBlockchain} disabled={verifyLoading}>
                        {verifyLoading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                        {verifyLoading ? 'Đang truy vấn...' : 'Đối soát ngay'}
                      </button>
                    </div>
                  </div>
                  {blockchainData && (
                    <div className="mt-4 pt-3 border-top">
                      <h6 className="small fw-bold mb-3 d-flex align-items-center gap-2"><CheckCircle2 size={16} className="text-success" /> Dữ liệu gốc ghi nhận trên Chuỗi khối:</h6>
                      <div className="table-responsive bg-light rounded-4 p-3">
                        <table className="table table-sm table-borderless mb-0 small">
                          <thead className="text-muted"><tr><th>Hoạt động</th><th>Địa điểm</th><th>Thời gian</th></tr></thead>
                          <tbody>
                            {blockchainData.map((b, i) => (
                              <tr key={i}><td className="fw-bold text-success">{formatAction(b.action)}</td><td>{b.location}</td><td className="text-muted">{b.timestamp}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <h4 className="fw-bold mb-4 px-3">Hành trình nông sản</h4>
                <div className="timeline px-4">
                  {result.processes.map((p, idx) => (
                    <div key={p.id} className="timeline-item mb-4 d-flex gap-4">
                      <div className="timeline-icon-wrapper">
                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-lg" style={{ width: 48, height: 48, zIndex: 1 }}>{getStageIcon(p.loai_cong_viec)}</div>
                        {idx !== result.processes.length - 1 && <div className="bg-light mx-auto" style={{ width: 3, height: 'calc(100% + 1.5rem)', marginTop: '-1rem' }}></div>}
                      </div>
                      <div className="timeline-content pb-4">
                        <div className="d-flex align-items-center gap-2 mb-1"><h5 className="fw-bold mb-0">{p.ten_cong_viec}</h5><span className="badge bg-success-subtle text-success border border-success border-opacity-10 px-2 rounded-pill small">{p.ngay_thuc_hien}</span></div>
                        <p className="text-muted mb-0 small lh-base">{p.mo_ta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer Branding Fix if needed */}
      <style>{`
        .hover-up:hover { transform: translateY(-5px); transition: 0.3s; }
        .trace-results .timeline-item:last-child .bg-light { display: none; }
        
        .connector-flow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 123, 255, 0.6), transparent);
          animation: flow-move 1.5s linear infinite;
        }

        @keyframes flow-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .icon-node {
          transition: 0.3s;
          cursor: pointer;
        }
        .icon-node:hover {
          transform: scale(1.15) rotate(5deg);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }

        @keyframes pulse-soft {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }

        @media (max-width: 767.98px) {
          .trace-page { padding-top: 2rem !important; }
          .search-box-wrapper .form-control-lg { font-size: 1rem !important; padding-left: 3rem !important; }
          .trace-results .card-img-top, .trace-results .object-fit-cover { height: 250px !important; }
          .timeline { px: 2 !important; }
          .timeline-item { gap: 3 !important; }
          .timeline-icon-wrapper div { width: 40px !important; height: 40px !important; }
          .timeline-content h5 { font-size: 1rem; }
          .timeline-content .badge { font-size: 0.7rem; }
        }
      `}</style>
    </div>
  );
};

export default Trace;
