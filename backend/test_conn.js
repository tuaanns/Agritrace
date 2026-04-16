const mongoose = require('mongoose');
require('dotenv').config();

console.log('Connecting to:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('SUCCESS: MongoDB Connected');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: MongoDB Connection Error:', err);
    process.exit(1);
  });
