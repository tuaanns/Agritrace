const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quanlynongsan')
  .then(async () => {
    console.log('Connected to MongoDB for seeding products...');
    
    const sampleProducts = [
      {
        _id: new mongoose.Types.ObjectId('661bc1234567890abcde0001'),
        name: 'Cà phê Robusta Đắk Lắk',
        category: 'Cà phê',
        price: '150,000đ',
        description: 'Cà phê nguyên chất từ vùng cao nguyên Đắk Lắk, hương vị đậm đà.',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80'
      },
      {
        _id: new mongoose.Types.ObjectId('661bc1234567890abcde0002'),
        name: 'Sầu riêng Ri6',
        category: 'Trái cây',
        price: '120,000đ',
        description: 'Sầu riêng Ri6 cơm vàng hạt lép, thơm ngon nức tiếng.',
        image: 'https://images.unsplash.com/photo-1596541221558-54cc4918e7e3?w=800&q=80'
      },
      {
        _id: new mongoose.Types.ObjectId('661bc1234567890abcde0003'),
        name: 'Hạt điều rang muối',
        category: 'Hạt dinh dưỡng',
        price: '250,000đ',
        description: 'Hạt điều Bình Phước rang muối thủ công, giữ trọn vị bùi.',
        image: 'https://images.unsplash.com/photo-1496115965489-3d7f93029abc?w=800&q=80'
      }
    ];

    try {
      await Product.deleteMany({}); // Clear all
      await Product.insertMany(sampleProducts);
      console.log('Successfully seeded sample products!');
    } catch (err) {
      console.error('Error seeding products:', err);
    } finally {
      mongoose.connection.close();
    }
  });
