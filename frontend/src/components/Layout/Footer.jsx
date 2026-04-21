import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Camera, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-light py-5 mt-auto">
      <div className="container">
        <div className="row g-4">
          {/* Brand Column */}
          <div className="col-lg-4">
            <Link to="/" className="d-flex align-items-center mb-4 text-decoration-none">
              <img src="/logo.png" alt="AgriTrace Logo" style={{ height: '45px', objectFit: 'contain' }} />
            </Link>
            <p className="text-muted mb-4" style={{ maxWidth: '320px' }}>
              Nền tảng tiên phong trong việc ứng dụng công nghệ Blockchain để minh bạch hóa toàn bộ quy trình sản xuất và phân phối nông sản Việt.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="p-2 rounded-circle border text-muted hover-glow-light transition-all">
                <Globe size={18} />
              </a>
              <a href="#" className="p-2 rounded-circle border text-muted hover-glow-light transition-all">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="p-2 rounded-circle border text-muted hover-glow-light transition-all">
                <Camera size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-4">
            <h6 className="fw-bold mb-4 text-dark text-uppercase small tracking-wider">Khám phá</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-decoration-none text-muted small hover-primary transition-all">Trang chủ</Link></li>
              <li className="mb-2"><Link to="/products" className="text-decoration-none text-muted small hover-primary transition-all">Sản phẩm</Link></li>
              <li className="mb-2"><Link to="/trace" className="text-decoration-none text-muted small hover-primary transition-all">Tra cứu nguồn gốc</Link></li>
              <li className="mb-2"><Link to="/blockchain-lab" className="text-decoration-none text-muted small hover-primary transition-all">Blockchain Lab</Link></li>
            </ul>
          </div>

          {/* Business Links */}
          <div className="col-lg-2 col-md-4">
            <h6 className="fw-bold mb-4 text-dark text-uppercase small tracking-wider">Hợp tác</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/login" className="text-decoration-none text-muted small hover-primary transition-all">Quản trị viên</Link></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted small hover-primary transition-all">Nhà sản xuất</a></li>
              <li className="mb-2"><Link to="/cooperation" className="text-decoration-none text-muted small hover-primary transition-all">Hợp tác vùng trồng</Link></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted small hover-primary transition-all">Điều khoản & Bảo mật</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-4 col-md-4">
            <h6 className="fw-bold mb-4 text-dark text-uppercase small tracking-wider">Liên hệ</h6>
            <div className="d-flex gap-3 mb-3">
              <MapPin size={20} className="text-primary flex-shrink-0" />
              <p className="text-muted small mb-0">TP.Cần Thơ</p>
            </div>
            <div className="d-flex gap-3 mb-3">
              <Phone size={20} className="text-primary flex-shrink-0" />
              <p className="text-muted small mb-0">Hotline: 0123456</p>
            </div>
            <div className="d-flex gap-3">
              <Mail size={20} className="text-primary flex-shrink-0" />
              <p className="text-muted small mb-0">Support: dongnguyenkh123@gmail.com</p>
            </div>
          </div>
        </div>

        <hr className="my-5 opacity-10" />

        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <p className="text-muted small mb-0">
              © 2026 <strong>AgriTrace Ecosystem</strong>. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="d-flex gap-4 justify-content-md-end text-muted small">
              <span className="d-flex align-items-center gap-1">
                <div className="rounded-circle bg-success" style={{ width: 8, height: 8 }}></div>
                Mạng lưới: Mainnet
              </span>
              <span>Phiên bản: 1.0.2</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-primary:hover { color: var(--primary) !important; padding-left: 5px; }
        .footer-light { padding-bottom: 2rem !important; }
        @media (max-width: 991.98px) {
          .footer-light { text-align: center; }
          .footer-light .d-flex { justify-content: center; }
          .footer-light p { margin-left: auto; margin-right: auto; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
