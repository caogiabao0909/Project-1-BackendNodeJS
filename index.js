const express = require('express')
const app = express()
const port = 3000
const path = require('path');
require('dotenv').config()
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

const Tour = mongoose.model('Tour', {
  name: String,
  vehicle: String
});


// Thiết lập views
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'pug');

// Thiết lập thư mục chứa file tĩnh của frontend
app.use(express.static(path.join(__dirname, "public")))

app.get('/', (req, res) => {
  res.render("client/pages/home", {
    pageTitle: "Trang chủ"
  })
})

app.get('/tours', async (req, res) => {
  const tourList = await Tour.find({});

  console.log(tourList);

  res.render("client/pages/tour-list", {
    pageTitle: "Danh sách tour",
    tourList: tourList
  })
})

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})


// caogiabao0909 / tL6km1BIxEIsLMiE

// mongodb+srv://caogiabao0909:tL6km1BIxEIsLMiE@cluster0.kljg2.mongodb.net/tour-management