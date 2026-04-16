const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const seedData = [
  {
    name: "Cà chua bi organic",
    category: "Rau củ quả",
    price: "45,000đ/kg",
    description: "Cà chua bi được trồng theo phương pháp hữu cơ tại Đà Lạt, giòn ngọt và giàu vitamin.",
    image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Súp lơ xanh",
    category: "Rau củ quả",
    price: "35,000đ/cây",
    description: "Súp lơ xanh tươi sạch, không thuốc trừ sâu, hỗ trợ tăng cường sức đề kháng.",
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500&auto=format&fit=crop&q=60"
  },
  {
    name: "Cà rốt Đà Lạt",
    category: "Rau củ quả",
    price: "25,000đ/kg",
    description: "Cà rốt tươi tuyển chọn, màu sắc tự nhiên, giòn ngọt phù hợp cho mọi bữa ăn.",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60"
  }
];

async function seed() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    await Product.insertMany(seedData);
    console.log('✅ Đã thêm 3 sản phẩm Rau củ quả mẫu thành công!');
    
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

seed();
