import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Search, Filter, ArrowRight, ShieldCheck, MapPin, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { getProducts } = await import('../services/api');
      const response = await getProducts();
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    (filter === 'All' || p.category === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const categories = ['All', 'Rau củ quả', 'Trái cây', 'Cà phê', 'Hạt dinh dưỡng', 'Mật ong', 'Lương thực', 'Dược liệu', 'Gia vị'];

  return (
    <div className="products-page py-5 mt-5">
      <div className="container">
        {/* Hero Header */}
        <div className="text-center mb-5">
          <motion.h2 
            className="fw-bold display-5 mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Sản phẩm Nông sản
          </motion.h2>
          <motion.p 
            className="text-muted lead mx-auto" 
            style={{ maxWidth: '600px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Khám phá nguồn nông sản sạch, minh bạch nguồn gốc và chất lượng cao từ khắp các vùng miền Việt Nam.
          </motion.p>
        </div>

        {/* Filter & Search Bar */}
        <div className="row g-3 mb-5 align-items-center bg-white p-3 rounded-4 shadow-sm mx-0">
          <div className="col-lg-4">
            <div className="input-group input-group-lg border rounded-3 overflow-hidden">
              <span className="input-group-text bg-transparent border-0"><Search size={20} className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control border-0 shadow-none ps-0" 
                placeholder="Tìm sản phẩm..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-lg-8">
            <div className="d-flex gap-2 overflow-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`btn rounded-pill px-4 py-2 text-nowrap transition ${filter === cat ? 'btn-primary shadow-sm' : 'btn-outline-light text-dark border'}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-4">
          {loading ? (
             <div className="col-12 text-center py-5">
               <div className="spinner-border text-primary"></div>
               <p className="mt-2 text-muted">Đang tải nông sản...</p>
             </div>
          ) : (
            <AnimatePresence mode='popLayout'>
              {filteredProducts.map((p, idx) => (
                <motion.div 
                  key={p._id} 
                  className="col-md-6 col-lg-4"
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="card h-100 border-0 shadow-hover rounded-4 overflow-hidden product-card">
                    <Link to={`/products/${p._id}`} className="position-relative overflow-hidden" style={{ height: '240px' }}>
                      <img src={p.image} className="card-img-top h-100 w-100 object-fit-cover transition-transform" alt={p.name} />
                      <div className="position-absolute top-0 start-0 m-3">
                        <span className="badge bg-white text-dark shadow-sm px-3 py-2 rounded-pill small">
                          <Tag size={14} className="me-1 text-primary" /> {p.category}
                        </span>
                      </div>
                    </Link>
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Link to={`/products/${p._id}`} className="text-decoration-none text-dark">
                          <h5 className="card-title fw-bold mb-0">{p.name}</h5>
                        </Link>
                        <span className="text-primary fw-bold text-nowrap ms-2">{p.price}</span>
                      </div>
                      <p className="card-text text-muted small flex-grow-1">{p.description}</p>
                      <div className="mt-4 pt-4 border-top d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center text-secondary small fw-bold">
                          <ShieldCheck size={16} className="me-1" /> Hỗ trợ Truy xuất Web3
                        </div>
                        <Link to={`/products/${p._id}`} className="btn btn-link text-primary text-decoration-none p-0 fw-bold d-flex align-items-center gap-1">
                          Chi tiết <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {filteredProducts.length === 0 && (
            <div className="col-12 text-center py-5">
              <div className="bg-light d-inline-block p-4 rounded-circle mb-3">
                <ShoppingBasket size={48} className="text-muted" />
              </div>
              <h4>Không tìm thấy sản phẩm phù hợp</h4>
              <p className="text-muted">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
