import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trace from './pages/Trace';
import BlockchainTest from './pages/BlockchainTest';
import Products from './pages/Products';
import AdminUsers from './pages/AdminUsers';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import AdminProducts from './pages/AdminProducts';
import AdminBatches from './pages/AdminBatches';
import Cooperation from './pages/Cooperation';
import { checkAuth, logoutUser } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Tự động cuộn lên đầu trang khi chuyển Route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    checkAuth().then(response => {
      if (response.data.success) {
        setUser(response.data.user);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
          <Route path="/trace" element={<Trace />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          
          {/* Chỉ Admin mới được vào Blockchain Test/Lab */}
          <Route path="/blockchain-test" element={user?.vai_tro === 'admin' ? <BlockchainTest /> : <Navigate to="/" />} />
          
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/admin/products" element={(user?.vai_tro === 'admin' || user?.vai_tro === 'nha_san_xuat') ? <AdminProducts /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/batches" element={(user?.vai_tro === 'admin' || user?.vai_tro === 'nha_san_xuat') ? <AdminBatches /> : <Navigate to="/dashboard" />} />
          <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/cooperation" element={<Cooperation />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

export default App;
