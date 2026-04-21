import React, { useState, useEffect } from 'react';
import { connectWallet } from '../services/blockchain';
import { getContract } from '../services/contracts';
import { getBatches } from '../services/api';
import { Share2, Send, Database, ShieldCheck, AlertCircle, Loader2, Cpu, Activity, Fingerprint, MapPin, Tag, Camera, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';

const BlockchainTest = () => {
  const [loading, setLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [blockchainRecords, setBlockchainRecords] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Form data
  const [traceData, setTraceData] = useState({
    maTruyXuat: '',
    action: 'Xác nhận thu hoạch & đóng gói',
    location: 'Cơ sở sản xuất'
  });

  useEffect(() => {
    fetchAvailableBatches();
  }, []);

  useEffect(() => {
    let scanner = null;
    if (isScanning) {
        setTimeout(() => {
          scanner = new Html5QrcodeScanner('reader-lab', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          }, false);

          scanner.render((decodedText) => {
            let finalCode = decodedText;
            if (decodedText.includes('code=')) {
              finalCode = decodedText.split('code=')[1].split('&')[0];
            }
            
            setTraceData(prev => ({ ...prev, maTruyXuat: finalCode }));
            setIsScanning(false);
            scanner.clear();
          }, (errorMessage) => {
            // ignore error
          });
        }, 300);
      }
  
      return () => {
        if (scanner) {
          scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        }
      };
  }, [isScanning]);

  const fetchAvailableBatches = async () => {
    try {
      const res = await getBatches();
      if (res.data.success) {
        setAvailableBatches(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCallContract = async (e) => {
    e.preventDefault();
    if (!traceData.maTruyXuat) {
        alert("Vui lòng chọn hoặc nhập mã Truy xuất!");
        return;
    }
    setLoading(true);
    setStatus(null);
    setTxHash(null);

    try {
      const wallet = await connectWallet();
      const contract = await getContract(wallet.signer);

      setStatus("Đang chờ xác nhận phí Gas trên MetaMask...");

      const tx = await contract.addTraceRecord(
        traceData.maTruyXuat,
        traceData.action,
        traceData.location
      );

      setStatus(`Giao dịch đã được đẩy lên mạng Cronos... Đang chờ Block xác nhận.`);
      setTxHash(tx.hash);

      await tx.wait();

      setStatus("THÀNH CÔNG! Dữ liệu đã được ghi vĩnh viễn trên sổ cái phi tập trung.");
      handleQueryBlockchain();
    } catch (err) {
      console.error(err);
      setStatus("Lỗi: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleQueryBlockchain = async () => {
    if (!traceData.maTruyXuat) {
        alert("Vui lòng chọn mã truy xuất trước!");
        return;
    }
    setQueryLoading(true);
    setBlockchainRecords([]);
    try {
      const wallet = await connectWallet();
      const contract = await getContract(wallet.provider);

      const count = await contract.getTraceCount(traceData.maTruyXuat);
      const total = Number(count);

      const records = [];
      for (let i = 0; i < total; i++) {
        const record = await contract.getRecord(traceData.maTruyXuat, i);
        records.push({
          action: record[0],
          location: record[1],
          timestamp: new Date(Number(record[2]) * 1000).toLocaleString()
        });
      }
      setBlockchainRecords(records);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đọc Blockchain: " + err.message);
    } finally {
      setQueryLoading(false);
    }
  };

  const formatAction = (action) => {
    if (!action) return '---';
    return action.replace(/^[a-z_]+: /, '');
  };

  return (
    <div className="blockchain-test-page min-vh-100 py-5 mt-4 bg-light">
      <div className="container">
        
        {/* Header Section */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-4"
              style={{ background: 'rgba(25, 135, 84, 0.1)', border: '1px solid rgba(25, 135, 84, 0.2)' }}
            >
              <Cpu size={18} className="text-success" />
              <span className="text-success fw-medium tracking-wide">Web3 Operations Center</span>
            </motion.div>
            <h1 className="fw-bolder display-5 text-dark mb-3" style={{ letterSpacing: '-1px' }}>
              Trung Tâm <span className="text-transparent bg-clip-text bg-gradient-to-r from-success to-primary" style={{ backgroundImage: 'linear-gradient(to right, #198754, #20c997)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Điều Phối Blockchain</span>
            </h1>
            <p className="text-muted fs-5">Môi trường thao tác ghi và đối soát dữ liệu trên mạng lưới phi tập trung Cronos.</p>
          </div>
        </div>

        <div className="row g-5 justify-content-center">
          {/* Left Column: Input Form */}
          <div className="col-lg-5">
            <motion.div 
              className="card border-0 rounded-4 p-4 h-100 position-relative bg-white shadow-sm"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                <ShieldCheck className="text-success" /> Ghi Dữ Liệu Lên Chuỗi
              </h4>

              <form onSubmit={handleCallContract} className="position-relative z-1">

                <div className="mb-4">
                  <label className="form-label small text-success fw-semibold d-flex align-items-center justify-content-between">
                    <span className="d-flex align-items-center gap-2"><Fingerprint size={14}/> Mã Trace Code</span>
                    <button type="button" onClick={() => setIsScanning(!isScanning)} className="btn btn-sm btn-link text-success p-0 text-decoration-none d-flex align-items-center gap-1">
                      <Camera size={14}/> Quét nhanh
                    </button>
                  </label>
                  
                  <div className="position-relative">
                    <select 
                        className="form-select form-select-lg bg-light border-0 mb-2"
                        style={{ borderLeft: '4px solid #198754', borderRadius: '12px' }}
                        value={traceData.maTruyXuat}
                        onChange={(e) => setTraceData({ ...traceData, maTruyXuat: e.target.value })}
                        required
                    >
                        <option value="">-- Chọn lô hàng cần ghi --</option>
                        {availableBatches.map(b => (
                            <option key={b._id} value={b.traceCode}>{b.batchCode} - {b.product?.name} ({b.traceCode})</option>
                        ))}
                    </select>
                  </div>
                  <input 
                    type="text" 
                    className="form-control form-control-lg border-0 bg-light px-3 py-2 text-muted" 
                    style={{ fontSize: '0.9rem', borderLeft: '4px solid #198754', borderRadius: '12px' }}
                    placeholder="Hoặc nhập mã thủ công tại đây..."
                    value={traceData.maTruyXuat}
                    onChange={(e) => setTraceData({ ...traceData, maTruyXuat: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small text-success fw-semibold d-flex align-items-center gap-2"><Tag size={14}/> Hành động (Event)</label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg bg-light border-0" 
                    placeholder="VD: Cập bến kho lưu trữ, Kiểm định hữu cơ..."
                    value={traceData.action}
                    onChange={(e) => setTraceData({...traceData, action: e.target.value})}
                  />
                </div>
                
                <div className="mb-5">
                  <label className="form-label small text-success fw-semibold d-flex align-items-center gap-2"><MapPin size={14}/> Địa điểm thực hiện</label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg bg-light border-0" 
                    value={traceData.location}
                    onChange={(e) => setTraceData({ ...traceData, location: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 text-uppercase tracking-wider shadow-lg"
                  disabled={loading}
                  style={{ background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)', border: 'none' }}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  {loading ? "Đang xử lý Giao dịch..." : "Phát sóng lên Mạng"}
                </button>
              </form>

              {status && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mt-4 p-4 rounded-4 small border ${status.includes('Lỗi') ? 'bg-danger bg-opacity-10 border-danger text-danger' : 'bg-success bg-opacity-10 border-success text-success'}`}
                >
                  <div className="d-flex align-items-start gap-3">
                    {status.includes('Lỗi') ? <AlertCircle size={20} className="mt-1 flex-shrink-0" /> : <CheckCircle2 size={20} className="mt-1 flex-shrink-0" />}
                    <div className="overflow-hidden">
                      <p className="mb-1 fw-bold lh-base">{status.includes('THÀNH CÔNG') ? 'GIAO DỊCH THÀNH CÔNG' : 'TRẠNG THÁI'}</p>
                      <p className="mb-1 text-dark opacity-75">{status}</p>
                      {txHash && (
                        <div className="mt-2 pt-2 border-top border-opacity-25 text-truncate">
                          <span className="text-muted small">Txn Hash:</span><br />
                          <a href={`https://explorer.cronos.org/testnet/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-success text-decoration-none font-monospace small">
                            {txHash}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Data Visualization */}
          <div className="col-lg-6">
            <motion.div 
              className="card border-0 rounded-4 h-100 bg-white shadow-sm overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-4 bg-success text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)' }}>
                 <div>
                    <h5 className="fw-bold mb-0">Dữ Liệu Block Trực Tiếp</h5>
                    <p className="small mb-0 opacity-75 text-white">Mã: {traceData.maTruyXuat || 'Chưa chọn'}</p>
                 </div>
                 <button 
                  className="btn btn-light rounded-pill px-3 btn-sm fw-bold shadow-sm d-flex align-items-center gap-2 text-success"
                  onClick={handleQueryBlockchain}
                  disabled={queryLoading}
                >
                  {queryLoading ? <Loader2 className="animate-spin" size={16}/> : <Activity size={16}/>}
                  Đối soát ngay
                </button>
              </div>

              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="bg-dark overflow-hidden"
                  >
                    <div id="reader-lab" style={{ width: '100%', maxHeight: '400px' }}></div>
                    <div className="p-2 text-center text-white small bg-danger cursor-pointer" onClick={() => setIsScanning(false)}>
                       <X size={14}/> Đóng Camera
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="card-body p-4 flex-grow-1">
                {blockchainRecords.length > 0 ? (
                  <div className="position-relative h-100">
                    <div className="position-absolute top-0 bottom-0 start-0 border-start border-2 border-success ms-3" style={{ opacity: 0.2 }}></div>
                    
                    {blockchainRecords.map((r, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="position-relative ps-5 mb-4"
                      >
                        <div className="position-absolute top-0 start-0 translate-middle-x mt-1 ms-3 bg-success rounded-circle shadow-sm" style={{ width: '14px', height: '14px', border: '2px solid white' }}></div>
                        <div className="bg-light p-3 rounded-4 border-0 shadow-sm transition-all hover:shadow-md">
                          <h6 className="fw-bold text-dark mb-2 text-success">{formatAction(r.action)}</h6>
                          <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                            <MapPin size={14} className="text-success opacity-50" /> {r.location}
                          </div>
                          <div className="d-flex align-items-center gap-2 text-muted small font-monospace">
                            <Activity size={14} className="text-warning" /> {r.timestamp}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center m-auto py-5 opacity-75">
                    <Database size={64} className="text-secondary mb-3 opacity-25" />
                    <h6 className="text-muted fw-bold">Chưa tìm thấy dữ liệu trên chuỗi</h6>
                    <p className="text-secondary small">Vui lòng chọn hoặc quét mã QR sản phẩm để đối soát trực tiếp với Blockchain Cronos.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BlockchainTest;
