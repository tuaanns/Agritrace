import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Search, LayoutDashboard, Box, Leaf, GitBranch, Users, LogOut, LogIn, UserPlus, Wallet, Database, Unlink, User, Settings, Shield, Package, Handshake } from 'lucide-react';
import { connectWallet, getWalletAddress } from '../../services/blockchain';

const Header = ({ user, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const currentPage = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const isActive = (path) => currentPage === path ? 'active' : '';

  return (
    <nav className={`navbar navbar-expand-lg navbar-light fixed-top ${scrolled ? 'scrolled bg-white shadow-sm' : ''}`} style={{ transition: 'all 0.3s ease' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/" style={{ transition: 'transform 0.2s ease' }}>
          <img 
            src="/logo.png" 
            alt="AgriTrace Logo" 
            style={{ height: '48px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} 
          />
          <span className="ms-2 fw-bold text-gradient d-none d-md-inline-block" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>AgriTrace</span>
        </Link>
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                <Home size={18} className="me-1" /> Trang chủ
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/products')}`} to="/products">
                <ShoppingBag size={18} className="me-1" /> Sản phẩm
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/trace')}`} to="/trace">
                <Search size={18} className="me-1" /> Tra cứu
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/cooperation')}`} to="/cooperation">
                <Handshake size={18} className="me-1" /> Liên hệ
              </Link>
            </li>
            {user?.vai_tro === 'admin' && (
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/blockchain-test')}`} to="/blockchain-test">
                  <Database size={18} className="me-1" /> Blockchain Lab
                </Link>
              </li>
            )}
            

            {user ? (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                    <LayoutDashboard size={18} className="me-1" /> Dashboard
                  </Link>
                </li>
                <li className="nav-item dropdown ms-lg-2">
                  <a className="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown">
                    <div style={{ background: 'var(--primary)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', border: '2px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                      {user?.avatar ? (
                        <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User" />
                      ) : (
                        user?.ho_ten?.charAt(0) || user?.username?.charAt(0) || 'U'
                      )}
                    </div>
                    <span className="d-none d-lg-inline">{user?.ho_ten || user?.username || 'Người dùng'}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 mt-2 p-3" style={{ minWidth: '260px' }}>
                    <div className="px-3 py-2 mb-2 bg-light rounded-3">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <h6 className="mb-0 fw-bold text-dark">{user?.ho_ten || user?.username}</h6>
                        <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-10 small" style={{ fontSize: '0.6rem' }}>
                          Quản trị viên
                        </span>
                      </div>
                      <p className="small text-muted mb-0 font-monospace" style={{ fontSize: '0.7rem' }}>{user?.email}</p>
                    </div>
                    
                    <li><Link className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2 mb-1" to="/admin/products"><Box size={16} className="text-muted" /> Quản trị nông sản</Link></li>
                    <li><Link className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2 mb-1" to="/admin/batches"><Package size={16} className="text-muted" /> Quản lý lô hàng</Link></li>
                    <li><Link className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2 mb-1" to="/profile"><Settings size={16} className="text-muted" /> Hồ sơ cá nhân</Link></li>

                    <div className="border-top my-2"></div>
                    
                    <li>
                      <button className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2 text-danger fw-bold" onClick={onLogout}>
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item ms-lg-3">
                <Link className="btn btn-primary btn-sm px-4 py-2" to="/login" style={{ borderRadius: '10px' }}>
                  <LogIn size={16} className="me-1" /> Quản trị viên
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
