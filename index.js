const express = require('express')
const path = require('path');
require('dotenv').config()
const database = require("./config/database");

const clientRoutes = require("./routes/client/index.route");

const app = express()
const port = 3000

// Kết nối database
database.connect();

// Thiết lập views
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'pug');

// Thiết lập thư mục chứa file tĩnh của frontend
app.use(express.static(path.join(__dirname, "public")))

// Thiết lập đường dẫn
app.use("/", clientRoutes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})


// caogiabao0909 / tL6km1BIxEIsLMiE

// mongodb+srv://caogiabao0909:tL6km1BIxEIsLMiE@cluster0.kljg2.mongodb.net/tour-management