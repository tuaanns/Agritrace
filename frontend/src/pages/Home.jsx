import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Search, Droplets, Wheat, Package, QrCode, Lock, 
  GitBranch, LayoutDashboard, Users, BadgeCheck, MapPin, 
  Database, Box, Store 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStats } from '../services/api';

const Home = ({ user }) => {
  const [stats, setStats] = useState({ nong_san: 0, lo_san_pham: 0, qua_trinh: 0, blockchain: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(response => {
      if (response.data.success) {
        setStats(response.data.data);
      }
      setLoading(false);
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="home-page overflow-hidden" style={{ background: '#ffffff' }}>
      {/* Subtle Background Elements */}
      <div className="position-absolute deco-circle" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, #f0fdf4 0%, transparent 70%)', top: '-200px', right: '-100px', zIndex: 0 }}></div>
      <div className="position-absolute deco-circle" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, #f0f9ff 0%, transparent 70%)', bottom: '10%', left: '-100px', zIndex: 0 }}></div>

      {/* Hero Section */}
      <section className="hero-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants} className="hero-badge" style={{ background: '#f0fdf4', border: '1px solid #bdfbd7', color: '#059669', padding: '8px 20px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
                  <ShieldCheck size={18} />
                  <span>Nền tảng Blockchain Nông nghiệp tin cậy</span>
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="hero-title" style={{ fontWeight: 800, marginBottom: '24px', color: '#064e3b', lineHeight: 1.1 }}>
                  Minh bạch hóa <br />
                  <span className="text-gradient">Nông sản Việt</span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="hero-description" style={{ fontSize: '1.2rem', color: '#4b5563', maxWidth: '600px', marginBottom: '40px' }}>
                  Sử dụng công nghệ Blockchain để xây dựng lòng tin, bảo vệ người tiêu dùng và khẳng định giá trị nông sản sạch trên thị trường quốc tế.
                </motion.p>
                
                <motion.div variants={itemVariants} className="d-flex gap-3 mb-5">
                  <Link to="/trace" className="btn btn-primary btn-lg d-flex align-items-center gap-2">
                    <Search size={22} /> Truy xuất ngay
                  </Link>
                  <Link to="/products" className="btn btn-outline-primary btn-lg">
                    Xem sản phẩm
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="row g-4">
                  {[
                    { label: 'Sản phẩm', value: stats.nong_san + '+', icon: <Package size={20} /> },
                    { label: 'Lô hàng sạch', value: stats.lo_san_pham + '+', icon: <Database size={20} /> },
                    { label: 'Giao dịch', value: stats.blockchain + '+', icon: <GitBranch size={20} /> }
                  ].map((stat, i) => (
                    <div key={i} className="col-12 col-sm-4">
                      <div className="p-3 border-start border-primary border-3 stat-card h-100" style={{ background: '#f8fafc', borderRadius: '0 8px 8px 0' }}>
                        <div className="text-primary mb-1">{stat.icon}</div>
                        <div className="h3 fw-bold mb-0" style={{ color: '#064e3b' }}>{stat.value}</div>
                        <div className="small text-uppercase tracking-wider text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
            
            <div className="col-lg-5 d-none d-lg-block">
              <motion.div 
                className="hero-card shadow-2xl p-2 position-relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                  {/* Premium Blockchain Visualization Card */}
                  <div className="card border-0 shadow-lg rounded-5 bg-white p-4 overflow-hidden position-relative">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="d-flex align-items-center gap-2">
                        <img src="/QuanLyNongSan/assets/images/logo.png" alt="Logo" style={{ width: 40 }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <h6 className="fw-bold mb-0 text-dark opacity-75">Smart Contract Verified</h6>
                      </div>
                      <span className="badge bg-success-subtle text-success px-4 py-2 rounded-3 border border-success border-opacity-10 fw-bold">Chính chủ</span>
                    </div>

                    <div className="d-flex align-items-center justify-content-between position-relative px-4 py-5 bg-light bg-opacity-50 rounded-4">
                      {/* Icons and Connectors */}
                      {[
                        { icon: <Wheat size={28} />, color: 'success' },
                        { icon: <Droplets size={28} />, color: 'info' },
                        { icon: <Box size={28} />, color: 'primary' },
                        { icon: <Store size={28} />, color: 'warning' }
                      ].map((item, i, arr) => (
                        <React.Fragment key={i}>
                          <div className={`icon-node bg-white shadow-sm rounded-4 d-flex align-items-center justify-content-center text-${item.color} border transition-all`} style={{ width: 70, height: 70, zIndex: 2 }}>
                            {item.icon}
                          </div>
                          {i < arr.length - 1 && (
                            <div className="flex-grow-1 mx-2 position-relative" style={{ height: 4, background: '#e9ecef', borderRadius: 2, overflow: 'hidden' }}>
                               <div className="connector-flow"></div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    
                    <div className="text-center mt-4">
                      <p className="text-muted small fw-bold mb-3">Quy trình được mã hóa & lưu trữ bất biến</p>
                      <div className="bg-light p-3 rounded-4 d-flex align-items-center gap-3">
                         <div className="bg-primary rounded-circle animate-pulse-soft" style={{ width: 10, height: 10 }}></div>
                         <code className="small text-muted text-truncate">TX: 0x71C765...65d11f_Verified_Safe</code>
                      </div>
                    </div>
                  </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Showroom */}
      <section className="py-5 bg-white">
         <div className="container">
            <div className="text-center mb-4">
               <span className="text-muted small text-uppercase fw-bold tracking-widest">Tiêu chuẩn quốc tế áp dụng</span>
            </div>
            <div className="d-flex justify-content-center align-items-center flex-wrap gap-4">
               {[
                  'VIETGAP', 'GLOBAL GAP', 'ISO 22000', 'HACCP', 'BRC FOOD'
               ].map((cert, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-3 border bg-light bg-opacity-50 d-flex align-items-center gap-2 shadow-sm"
                  >
                     <BadgeCheck size={18} className="text-success" />
                     <span className="fw-bold text-dark opacity-75" style={{ fontSize: '0.9rem' }}>{cert}</span>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-5" style={{ background: '#ffffff' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h6 className="text-primary text-uppercase fw-bold tracking-widest mb-3">Ưu điểm hệ thống</h6>
            <h2 className="display-5 fw-bold" style={{ color: '#064e3b' }}>An toàn từ <span className="text-gradient">Blockchain</span></h2>
          </div>
          
          <div className="row g-4 mt-4">
            {[
              { icon: <QrCode size={32} />, title: "Truy xuất nguồn gốc", desc: "Quét mã QR để xem ngay nhật ký sản xuất và thông tin kiểm định được lưu trên Blockchain.", color: "primary" },
              { icon: <Lock size={32} />, title: "Bảo mật tuyệt đối", desc: "Dữ liệu được mã hóa đa tầng, không thể bị xóa sửa sau khi đã đưa vào chuỗi.", color: "primary" },
              { icon: <GitBranch size={32} />, title: "Quản lý lô hàng", desc: "Theo dõi chính xác từng lô nông sản từ lúc gieo mầm đến khi tới tay người dùng.", color: "primary" },
              { icon: <LayoutDashboard size={32} />, title: " Dashboard thông minh", desc: "Công cụ quản lý tập trung cho doanh nghiệp với các biểu đồ báo cáo thời gian thực.", color: "primary" },
              { icon: <Users size={32} />, title: "Kết nối trực tiếp", desc: "Giảm thiểu trung gian, tăng giá trị lợi nhuận cho nông dân và tiết kiệm cho người mua.", color: "primary" },
              { icon: <ShieldCheck size={32} />, title: "Tiêu chuẩn xuất khẩu", desc: "Hỗ trợ các chứng chỉ quốc tế giúp nông sản dễ dàng tiếp cận thị trường lớn.", color: "primary" }
            ].map((feature, i) => (
              <div key={i} className="col-lg-4 col-md-6">
                <div className="feature-card-wrapper p-5 h-100">
                  <div className="p-3 rounded-4 d-inline-block mb-4" style={{ background: '#f0fdf4', color: '#059669' }}>
                    {feature.icon}
                  </div>
                  <h4 className="fw-bold mb-3" style={{ color: '#064e3b' }}>{feature.title}</h4>
                  <p className="text-muted leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 mb-5">
         <div className="container">
            <div className="p-5 rounded-5 text-center position-relative shadow-lg" style={{ background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' }}>
               <div className="position-relative z-1 py-4 text-white">
                  <h2 className="display-5 fw-bold mb-4">Bạn đã sẵn sàng để minh bạch hóa <br/> thực phẩm của mình?</h2>
                  <p className="opacity-75 mb-5 max-w-2xl mx-auto fs-5">Hãy để AgriTrace giúp bạn khẳng định giá trị nông sản sạch và xây dựng niềm tin nơi khách hàng.</p>
                  <div className="d-flex justify-content-center gap-3">
                     <Link to="/cooperation" className="btn btn-light btn-lg px-5 fw-bold shadow-sm" style={{ color: '#065f46', borderRadius: '50px' }}>Gia nhập mạng lưới</Link>
                     <Link to="/trace" className="btn btn-outline-light btn-lg px-5" style={{ borderRadius: '50px' }}>Tra cứu ngay</Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <style>{`
        .text-gradient {
          background: linear-gradient(to right, #059669, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

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

        .icon-node:hover {
          transform: scale(1.1) rotate(5deg);
          border-color: #0d6efd !important;
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
        }

        @keyframes pulse-soft {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
