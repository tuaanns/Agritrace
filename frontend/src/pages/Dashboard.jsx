import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutDashboard, Box, Users, GitBranch, ShieldCheck, ArrowUpRight, Clock, MapPin, Plus, Leaf, RefreshCw, Activity, Zap, TrendingUp, Package, Truck, Sprout, Scissors, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboard } from '../services/api';

const POLL_INTERVAL = 15000; // 15 seconds

// Stage label & color mapping
const stageMap = {
  gieo_trong: { label: 'Gieo trồng', icon: <Sprout size={14} />, color: '#10b981' },
  cham_soc: { label: 'Chăm sóc', icon: <Leaf size={14} />, color: '#3b82f6' },
  thu_hoach: { label: 'Thu hoạch', icon: <Scissors size={14} />, color: '#f59e0b' },
  dong_goi: { label: 'Đóng gói', icon: <Package size={14} />, color: '#8b5cf6' },
  van_chuyen: { label: 'Vận chuyển', icon: <Truck size={14} />, color: '#ec4899' },
  phan_phoi: { label: 'Phân phối', icon: <CheckCircle2 size={14} />, color: '#06b6d4' },
};

// Animated counter component
const AnimatedCounter = ({ value, duration = 800 }) => {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    if (start === end) return;

    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prev.current = end;
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{display}</>;
};

// Time ago formatter
const timeAgo = (dateStr) => {
  if (!dateStr) return 'Không rõ';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    nong_san: 0,
    lo_san_pham: 0,
    nguoi_dung: 0,
    qua_trinh: 0,
    blockchain: 0
  });
  const [activities, setActivities] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());
  const pollRef = useRef(null);

  const isAdmin = user?.vai_tro === 'admin';
  const isProducer = user?.vai_tro === 'nha_san_xuat';

  // Fetch dashboard data
  const fetchDashboard = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const response = await getDashboard();
      if (response.data.success) {
        const { stats: s, recentActivities, statusBreakdown: sb } = response.data.data;
        setStats(s);
        setActivities(recentActivities || []);
        setStatusBreakdown(sb || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchDashboard();
    pollRef.current = setInterval(() => fetchDashboard(), POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchDashboard]);

  // Live clock
  useEffect(() => {
    const clockInterval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  const statCards = [
    { key: 'lo_san_pham', label: 'Lô sản phẩm', icon: <Box size={22} />, color: '#10b981', bgColor: '#ecfdf5', borderColor: '#10b981' },
    { key: 'nong_san', label: 'Loại nông sản', icon: <ShieldCheck size={22} />, color: '#22c55e', bgColor: '#f0fdf4', borderColor: '#22c55e' },
    { key: 'blockchain', label: 'Lượt truy xuất', icon: <GitBranch size={22} />, color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#f59e0b' },
    { key: 'qua_trinh', label: 'Quá trình sản xuất', icon: <Activity size={22} />, color: '#8b5cf6', bgColor: '#f5f3ff', borderColor: '#8b5cf6' }
  ];

  const getActivityIcon = (activity) => {
    if (activity.type === 'batch_created') {
      return <Package size={18} />;
    }
    const stage = stageMap[activity.stage];
    return stage?.icon || <Clock size={18} />;
  };

  const getActivityColor = (activity) => {
    if (activity.type === 'batch_created') return '#10b981';
    return stageMap[activity.stage]?.color || '#64748b';
  };

  if (loading) {
    return (
      <div className="dashboard-page py-5 mt-5">
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
              <p className="text-muted">Đang tải dữ liệu thời gian thực...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page py-5 mt-5">
      <div className="container">
        {/* Header Section */}
        <motion.div
          className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill mb-2 d-inline-flex align-items-center gap-2">
              <LayoutDashboard size={14} /> Hệ thống quản trị
            </span>
            <h2 className="fw-bold mb-1">Xin chào, {user?.ho_ten || user?.username}!</h2>
            <p className="text-muted mb-0">Bảng điều khiển thời gian thực AgriTrace.</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            {/* Nút Ghi nhận lô mới đã được gỡ bỏ */}
          </div>
        </motion.div>

        {/* Live Status Bar */}
        <motion.div
          className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-4 border"
          style={{ background: '#f8fafc' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="position-relative d-inline-block" style={{ width: 10, height: 10 }}>
                <span className="position-absolute w-100 h-100 rounded-circle" style={{ background: '#22c55e', animation: 'pulse-dot 2s infinite' }}></span>
                <span className="position-absolute w-100 h-100 rounded-circle" style={{ background: '#22c55e', opacity: 0.4, animation: 'pulse-ring 2s infinite' }}></span>
              </span>
              <span className="fw-bold small text-success">LIVE</span>
            </div>
            <span className="text-muted small">
              <Clock size={13} className="me-1" />
              {liveTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            {lastUpdated && (
              <span className="text-muted small d-none d-md-inline">
                Cập nhật: {timeAgo(lastUpdated)}
              </span>
            )}
          </div>
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-2 px-3"
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-animation' : ''} />
            <span className="d-none d-sm-inline">{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="row g-3 mb-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {statCards.map((card) => (
            <div key={card.key} className={statCards.length === 5 ? 'col-6 col-lg' : 'col-6 col-lg-3'}>
              <motion.div
                variants={itemVariants}
                className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 position-relative overflow-hidden"
                style={{ borderLeft: `4px solid ${card.borderColor}` }}
                whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="p-2 rounded-3" style={{ background: card.bgColor, color: card.color }}>
                    {card.icon}
                  </div>
                  <Zap size={14} className="text-warning opacity-50" />
                </div>
                <h3 className="fw-bold mb-0">
                  <AnimatedCounter value={stats[card.key] || 0} />
                </h3>
                <p className="text-muted small mb-0">{card.label}</p>
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Main Content Area */}
        <div className="row g-4">
          {/* Recent Activities - REAL DATA */}
          <div className="col-lg-8">
            <motion.div
              className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                  <Activity size={20} className="text-primary" />
                  <h5 className="fw-bold mb-0">Hoạt động gần đây</h5>
                </div>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1">
                  {activities.length} hoạt động
                </span>
              </div>

              <div className="timeline-simple" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                <AnimatePresence mode="popLayout">
                  {activities.length === 0 ? (
                    <motion.div
                      className="text-center py-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Box size={48} className="text-muted opacity-25 mb-3" />
                      <p className="text-muted">Chưa có hoạt động nào được ghi nhận.</p>
                      <Link to="/admin/batches" className="btn btn-sm btn-primary rounded-pill px-4">
                        <Plus size={14} className="me-1" /> Tạo lô hàng đầu tiên
                      </Link>
                    </motion.div>
                  ) : (
                    activities.map((activity, idx) => (
                      <motion.div
                        key={activity.id}
                        className={`d-flex gap-3 mb-3 pb-3 ${idx < activities.length - 1 ? 'border-bottom' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        layout
                      >
                        <div
                          className="rounded-3 p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: 44, height: 44,
                            background: `${getActivityColor(activity)}15`,
                            color: getActivityColor(activity)
                          }}
                        >
                          {getActivityIcon(activity)}
                        </div>
                        <div className="flex-grow-1 min-width-0">
                          <div className="d-flex justify-content-between align-items-start gap-2">
                            <div className="fw-bold small text-truncate">{activity.title}</div>
                            <span className="text-muted small flex-shrink-0" style={{ fontSize: '0.7rem' }}>
                              {timeAgo(activity.date)}
                            </span>
                          </div>
                          <div className="small text-muted mb-1 d-flex align-items-center gap-1 flex-wrap">
                            <Leaf size={11} /> {activity.product}
                            <span className="mx-1">•</span>
                            <MapPin size={11} /> {activity.location}
                            {activity.performer && (
                              <>
                                <span className="mx-1">•</span>
                                <Users size={11} /> {activity.performer}
                              </>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            {activity.type === 'batch_created' ? (
                              <span className="badge rounded-pill px-2 py-1" style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.65rem' }}>
                                <Package size={10} className="me-1" /> Lô mới
                              </span>
                            ) : (
                              <span className="badge rounded-pill px-2 py-1" style={{ background: `${getActivityColor(activity)}15`, color: getActivityColor(activity), fontSize: '0.65rem' }}>
                                {stageMap[activity.stage]?.label || activity.stage}
                              </span>
                            )}
                            {activity.isBlockchainVerified && (
                              <span className="badge rounded-pill px-2 py-1" style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.65rem' }}>
                                <ShieldCheck size={10} className="me-1" /> Blockchain ✓
                              </span>
                            )}
                            {activity.batchCode && (
                              <span className="badge bg-light text-muted rounded-pill px-2 py-1" style={{ fontSize: '0.6rem' }}>
                                #{activity.batchCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Status + Quick Actions */}
          <div className="col-lg-4">
            {/* Status Breakdown */}
            {statusBreakdown.length > 0 && (
              <motion.div
                className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <TrendingUp size={18} className="text-primary" />
                  <h6 className="fw-bold mb-0">Trạng thái lô hàng</h6>
                </div>
                {statusBreakdown.map((item, idx) => {
                  const total = statusBreakdown.reduce((sum, i) => sum + i.count, 0);
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={idx} className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-medium">{item._id || 'Không rõ'}</span>
                        <span className="text-muted">{item.count} ({pct}%)</span>
                      </div>
                      <div className="progress" style={{ height: 6, borderRadius: 10 }}>
                        <motion.div
                          className="progress-bar"
                          style={{ background: idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : '#f59e0b', borderRadius: 10 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + idx * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              className="card border-0 shadow-sm rounded-4 p-4 bg-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <h6 className="fw-bold mb-3 text-dark">Lối tắt quản lý nhanh</h6>
              <div className="d-grid gap-2">
                {(isAdmin || isProducer) && (
                  <>
                    <Link to="/admin/products" className="btn btn-outline-light text-dark border d-flex align-items-center justify-content-between p-3 rounded-3 hover-shadow transition">
                      <div className="d-flex align-items-center gap-3">
                        <Leaf className="text-success" size={18} /> <span>Quản lý nông sản</span>
                      </div>
                      <ArrowUpRight size={16} />
                    </Link>
                    <Link to="/admin/batches" className="btn btn-outline-light text-dark border d-flex align-items-center justify-content-between p-3 rounded-3 hover-shadow transition">
                      <div className="d-flex align-items-center gap-3">
                        <Box className="text-warning" size={18} /> <span>Quản lý lô hàng</span>
                      </div>
                      <ArrowUpRight size={16} />
                    </Link>
                  </>
                )}
                <Link to="/blockchain-test" className="btn btn-outline-light text-dark border d-flex align-items-center justify-content-between p-3 rounded-3 hover-shadow transition">
                  <div className="d-flex align-items-center gap-3">
                    <ShieldCheck className="text-info" size={18} /> <span>Blockchain Lab</span>
                  </div>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Inline Styles for Animations */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .timeline-simple::-webkit-scrollbar {
          width: 4px;
        }
        .timeline-simple::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .timeline-simple::-webkit-scrollbar-thumb:hover {
          background: #10b981;
        }
        .min-width-0 {
          min-width: 0;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
