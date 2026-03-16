require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const database = require('./config/database');
const Tour = require('./models/tour.model');

// Kết nối database
database.connect();

const importData = async () => {
  try {
    // Đọc data từ file JSON
    const tours = JSON.parse(fs.readFileSync('./data_example/tour.json', 'utf8'));

    console.log("Đang tiến hành import dữ liệu, vui lòng chờ...");

    // Chạy loop và dùng Tour.create() 
    // Việc này sẽ chạy qua Model của Mongoose nên slug và timestamps (createdAt, updatedAt) sẽ được sinh ra tự động!
    for (const tour of tours) {
      await Tour.create(tour);
    }

    console.log("✅ Đã import toàn bộ dữ liệu thành công!");
    process.exit(); // Thoát chương trình
  } catch (error) {
    console.error("❌ Lỗi import:", error);
    process.exit(1);
  }
};

importData();
