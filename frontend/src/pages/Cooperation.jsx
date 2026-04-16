import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Handshake, ShieldCheck, TreePine, MapPin, 
  Send, Phone, Mail, CheckCircle2, Globe, Users, Loader2
} from 'lucide-react';
import { sendContact } from '../services/api';

const Cooperation = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Hợp tác vùng trồng',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await sendContact(formData);
      if (response.data.success) {
        setSubmitted(true);
        setFormData({
            name: '',
            phone: '',
            email: '',
            subject: 'Hợp tác vùng trồng',
            message: ''
        });
      } else {
        alert("Lỗi: " + response.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="cooperation-page" style={{ paddingTop: '80px' }}>
      {/* Hero Section */}
      <section className="py-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants} className="badge bg-success-subtle text-success px-3 py-2 rounded-pill mb-3 fw-bold">
                   <Handshake size={16} className="me-2" /> Chương trình liên kết 2026
                </motion.div>
                <motion.h1 variants={itemVariants} className="display-4 fw-bold mb-4" style={{ color: '#064e3b' }}>
                  Hợp tác phát triển <br />
                  <span className="text-success">Vùng trồng bền vững</span>
                </motion.h1>
                <motion.p variants={itemVariants} className="text-muted fs-5 mb-5" style={{ maxWidth: '540px' }}>
                  Hãy gia nhập mạng lưới AgriTrace để số hóa quy trình sản xuất, nâng cao giá trị nông sản và kết nối trực tiếp với thị trường tiêu thụ nông sản sạch.
                </motion.p>
                <motion.div variants={itemVariants} className="d-flex gap-3">
                   <a href="#contact-form" className="btn btn-success btn-lg px-4 py-3 rounded-4 fw-bold shadow-sm">
                      Liên hệ hợp tác ngay
                   </a>
                   <div className="d-flex align-items-center gap-2 text-muted px-4">
                      <Users className="text-success" />
                      <span>+120 Hợp tác xã đã tham gia</span>
                   </div>
                </motion.div>
              </motion.div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0">
               <motion.div 
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="position-relative"
               >
                  <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60" 
                       alt="Farming" 
                       className="img-fluid rounded-5 shadow-2xl" 
                       style={{ transform: 'rotate(2deg)' }} />
                  <div className="position-absolute top-10 start-0 translate-middle bg-white p-4 rounded-4 shadow-lg text-center d-none d-md-block" style={{ transform: 'rotate(-5deg)' }}>
                     <CheckCircle2 size={40} className="text-success mb-2" />
                     <h5 className="fw-bold mb-0">Chuẩn VietGAP</h5>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-5 bg-white">
         <div className="container py-5">
            <div className="text-center mb-5">
               <h2 className="fw-bold display-6" style={{ color: '#064e3b' }}>Lợi ích khi trở thành đối tác</h2>
               <p className="text-muted">Chúng tôi cam kết mang lại giá trị thực cho người sản xuất</p>
            </div>
            <div className="row g-4 mt-2">
               {[
                 { 
                   icon: <TreePine size={32} />, 
                   title: "Tiêu chuẩn hóa", 
                   desc: "Hỗ trợ số hóa nhật ký sản xuất theo các tiêu chuẩn quốc tế như Global GAP, VietGAP." 
                 },
                 { 
                   icon: <ShieldCheck size={32} />, 
                   title: "Bảo chứng Web3", 
                   desc: "Ghi nhận dữ liệu vùng trồng lên Blockchain, tạo độ tin cậy tuyệt đối với khách hàng." 
                 },
                 { 
                   icon: <Globe size={32} />, 
                   title: "Tiếp cận thị trường", 
                   desc: "Sản phẩm được đẩy lên sàn thương mại AgriTrace, kết nối trực tiếp với người mua lớn." 
                 }
               ].map((benefit, i) => (
                 <div key={i} className="col-md-4">
                    <div className="p-5 rounded-5 h-100 border hover-shadow transition-all text-center">
                       <div className="bg-success bg-opacity-10 text-success p-4 rounded-4 d-inline-block mb-4">
                          {benefit.icon}
                       </div>
                       <h4 className="fw-bold mb-3">{benefit.title}</h4>
                       <p className="text-muted mb-0">{benefit.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Contact Section */}
      <section className="py-5 bg-light" id="contact-form">
         <div className="container py-5">
            <div className="row justify-content-center">
               <div className="col-lg-10">
                  <div className="card border-0 shadow-lg rounded-5 overflow-hidden">
                     <div className="row g-0">
                        <div className="col-lg-5 p-5 bg-success text-white">
                           <h3 className="fw-bold mb-4">Thông tin liên hệ</h3>
                           <p className="opacity-75 mb-5">Hãy để lại thông tin, đội ngũ AgriTrace sẽ liên hệ tư vấn trong vòng 24h.</p>
                           
                           <div className="d-flex gap-4 mb-4">
                              <div className="p-3 bg-white rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
                                 <MapPin size={24} className="text-success" />
                              </div>
                              <div><h6 className="fw-bold mb-1">Văn phòng đại diện</h6><p className="small mb-0 opacity-75">aaaaaaaa TP.Cần Thơ</p></div>
                           </div>
                           <div className="d-flex gap-4 mb-4">
                              <div className="p-3 bg-white rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
                                 <Phone size={24} className="text-success" />
                              </div>
                              <div><h6 className="fw-bold mb-1">Điện thoại</h6><p className="small mb-0 opacity-75">0123456</p></div>
                           </div>
                           <div className="d-flex gap-4 mb-5">
                              <div className="p-3 bg-white rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
                                 <Mail size={24} className="text-success" />
                              </div>
                              <div><h6 className="fw-bold mb-1">Email</h6><p className="small mb-0 opacity-75">support@agritrace.vn</p></div>
                           </div>

                           <div className="d-flex gap-3 mt-auto">
                              <a href="#" className="text-white opacity-75 hover-opacity-100"><Globe /></a>
                              <a href="#" className="text-white opacity-75 hover-opacity-100"><Users /></a>
                           </div>
                        </div>
                        <div className="col-lg-7 p-5 bg-white">
                           {submitted ? (
                             <div className="text-center py-5">
                                <CheckCircle2 size={80} className="text-success mb-3 animate-bounce" />
                                <h3 className="fw-bold mb-3">Gửi yêu cầu thành công!</h3>
                                <p className="text-muted">Cảm ơn bạn đã quan tâm. Chúng tôi sẽ sớm liên hệ lại với bạn.</p>
                                <button className="btn btn-outline-success rounded-pill px-4 mt-3" onClick={() => setSubmitted(false)}>Gửi lại yêu cầu khác</button>
                             </div>
                           ) : (
                             <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                   <div className="col-md-6">
                                      <label className="form-label small fw-bold text-muted">Họ và tên</label>
                                      <input type="text" className="form-control form-control-lg bg-light border-0 rounded-4" 
                                             placeholder="Vũ Văn A" required 
                                             value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                                   </div>
                                   <div className="col-md-6">
                                      <label className="form-label small fw-bold text-muted">Số điện thoại</label>
                                      <input type="tel" className="form-control form-control-lg bg-light border-0 rounded-4" 
                                             placeholder="09xx xxx xxx" required 
                                             value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
                                   </div>
                                   <div className="col-12">
                                      <label className="form-label small fw-bold text-muted">Email</label>
                                      <input type="email" className="form-control form-control-lg bg-light border-0 rounded-4" 
                                             placeholder="example@mail.com" required 
                                             value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                                   </div>
                                   <div className="col-12">
                                      <label className="form-label small fw-bold text-muted">Nội dung hợp tác</label>
                                      <textarea className="form-control form-control-lg bg-light border-0 rounded-4" 
                                             rows="4" placeholder="Mô tả sơ qua về vùng trồng của bạn..." 
                                             value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                                   </div>
                                   <div className="col-12">
                                      <button className="btn btn-success btn-lg w-100 py-3 rounded-4 fw-bold shadow-md d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                                         {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                         {loading ? 'Đang gửi...' : 'Gửi yêu cầu ngay'}
                                      </button>
                                   </div>
                                </div>
                             </form>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <style>{`
        .transition-all { transition: all 0.3s ease; }
        .shadow-2xl { shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .hover-shadow:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.08); transform: translateY(-5px); }
        .max-w-540 { max-width: 540px; }
      `}</style>
    </div>
  );
};

export default Cooperation;
