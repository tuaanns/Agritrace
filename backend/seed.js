const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Batch = require('./models/Batch');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quanlynongsan';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected for seeding...');

    // Clear existing
    await User.deleteMany({});
    await Product.deleteMany({});
    await Batch.deleteMany({});

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const admin = await User.create({
      username: 'admin',
      password,
      fullName: 'Quản trị viên',
      email: 'admin@nongsan.vn',
      role: 'admin'
    });

    const nsxMinh = await User.create({
      username: 'nsx_minh',
      password,
      fullName: 'Nguyễn Văn Minh',
      email: 'minh@nongsan.vn',
      role: 'nha_san_xuat'
    });

    console.log('Users created.');

    // 2. Create Products
    const caphe = await Product.create({
      name: 'Cà phê Robusta',
      category: 'Ngũ cốc',
      description: 'Cà phê Robusta hữu cơ từ Đắk Lắk, trồng trên độ cao 600m',
      createdBy: nsxMinh._id
    });

    const rau = await Product.create({
      name: 'Rau cải xanh',
      category: 'Rau củ',
      description: 'Rau cải xanh hữu cơ, không thuốc trừ sâu',
      createdBy: nsxMinh._id
    });

    console.log('Products created.');

    // 3. Create Batches
    await Batch.create({
      batchCode: 'LO-20260101-001',
      traceCode: 'TX-CAPHE-20260101-001',
      product: caphe._id,
      productionLocation: 'Buôn Ma Thuột, Đắk Lắk',
      plantingDate: new Date('2025-06-15'),
      harvestDate: new Date('2026-01-10'),
      quantity: 500,
      unit: 'kg',
      createdBy: nsxMinh._id,
      status: 'Đã phân phối',
      processes: [
        { stage: 'gieo_trong', title: 'Gieo trồng', description: 'Gieo trồng cà phê Robusta giống mới', location: 'Buôn Ma Thuột, Đắk Lắk', performer: 'Nguyễn Văn Minh', date: new Date('2025-06-15') },
        { stage: 'cham_soc', title: 'Chăm sóc', description: 'Bón phân hữu cơ, tưới nước nhỏ giọt', location: 'Buôn Ma Thuột, Đắk Lắk', performer: 'Nguyễn Văn Minh', date: new Date('2025-09-20') },
        { stage: 'thu_hoach', title: 'Thu hoạch', description: 'Thu hoạch quả chín đỏ, phơi sấy tự nhiên', location: 'Buôn Ma Thuột, Đắk Lắk', performer: 'Nguyễn Văn Minh', date: new Date('2026-01-10') }
      ],
      blockchain: { verified: true, hash: '0000abc123...', previousHash: '0' }
    });

    await Batch.create({
      batchCode: 'LO-20260115-002',
      traceCode: 'TX-RAU-20260115-002',
      product: rau._id,
      productionLocation: 'Củ Chi, TP.HCM',
      plantingDate: new Date('2025-12-01'),
      harvestDate: new Date('2026-01-15'),
      quantity: 200,
      unit: 'kg',
      createdBy: nsxMinh._id,
      status: 'Đang vận chuyển',
      processes: [
        { stage: 'gieo_trong', title: 'Gieo hạt', description: 'Gieo hạt giống cải xanh hữu cơ', location: 'Củ Chi, TP.HCM', performer: 'Nguyễn Văn Minh', date: new Date('2025-12-01') },
        { stage: 'thu_hoach', title: 'Thu hoạch rau', description: 'Thu hoạch rau đạt tiêu chuẩn', location: 'Củ Chi, TP.HCM', performer: 'Nguyễn Văn Minh', date: new Date('2026-01-15') }
      ],
      blockchain: { verified: true, hash: '0000xyz456...', previousHash: '0000abc123...' }
    });

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
