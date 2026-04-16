const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Batch = require('./models/Batch'); // Giả sử model này đã tồn tại

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quanlynongsan')
  .then(async () => {
    console.log('Connected to MongoDB for seeding batches...');
    
    const sampleBatches = [
      {
        batchCode: 'L-CAPHE-001',
        traceCode: 'TX-DE0001',
        product: new mongoose.Types.ObjectId('661bc1234567890abcde0001'),
        productionLocation: 'Hợp tác xã Nam Ban, Đắk Lắk',
        plantingDate: new Date('2023-11-01'),
        harvestDate: new Date('2024-03-20'),
        status: 'Đã đóng gói',
        processes: [
          { stage: 'gieo_trong', title: 'Gieo hạt Robusta', description: 'Gieo hạt giống cafe Robusta chất lượng cao.', location: 'Vườn thực nghiệm Đắk Lắk' },
          { stage: 'thu_hoach', title: 'Thu hoạch chín', description: 'Thu hoạch bằng tay những quả cafe chín đỏ.', location: 'Hợp tác xã Nam Ban' }
        ]
      },
      {
        batchCode: 'L-SAURIENG-002',
        traceCode: 'TX-DE0002',
        product: new mongoose.Types.ObjectId('661bc1234567890abcde0002'),
        productionLocation: 'Cai Lậy, Tiền Giang',
        plantingDate: new Date('2023-12-10'),
        harvestDate: new Date('2024-03-15'),
        status: 'Phân phối',
        processes: [
          { stage: 'thu_hoach', title: 'Thu hoạch sầu riêng', description: 'Thu hoạch trái chín cây tự nhiên.', location: 'Vườn Cai Lậy' },
          { stage: 'dong_goi', title: 'Đóng gói chuẩn VietGAP', description: 'Làm sạch và dán tem truy xuất nguồn gốc.', location: 'Xưởng đóng gói Tiền Giang' }
        ]
      },
      {
        batchCode: 'L-HATDIEU-003',
        traceCode: 'TX-DE0003',
        product: new mongoose.Types.ObjectId('661bc1234567890abcde0003'),
        productionLocation: 'Bù Đăng, Bình Phước',
        plantingDate: new Date('2023-05-15'),
        harvestDate: new Date('2024-02-28'),
        status: 'Phân phối',
        processes: [
          { stage: 'thu_hoach', title: 'Thu hoạch hạt điều', description: 'Thu hoạch quả điều thủ công.', location: 'Nông trại Bình Phước' },
          { stage: 'dong_goi', title: 'Rang muối và Đóng gói', description: 'Rang củi truyền thống và hút chân không.', location: 'Xưởng rang hạt điều' }
        ]
      }
    ];

    try {
      // Clean old and insert new
      await Batch.deleteMany({ traceCode: { $in: ['TX-CAPHE-001', 'TX-SAURIENG-002', 'TX-DE0001', 'TX-DE0002', 'TX-DE0003'] } });
      await Batch.insertMany(sampleBatches);
      console.log('Successfully seeded sample batches!');
    } catch (err) {
      console.error('Error seeding batches:', err);
    } finally {
      mongoose.connection.close();
    }
  });
