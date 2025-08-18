const Tour = require("../../models/tour.model")
const slugify = require('slugify')
const moment = require("moment")


module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
    status: "active"
  }

  // Lọc theo điểm đi
  if (req.query.locationFrom) {
    find.locations = req.query.locationFrom
  }
  // Hết Lọc theo điểm đi


  // Lọc theo điểm đến
  if (req.query.locationTo) {
    const keyword = slugify(req.query.locationTo, {
      lower: true
    })
    const keywordRegex = new RegExp(keyword)
    find.slug = keywordRegex;
  }
  // Hết Lọc theo điểm đến

  // Lọc theo ngày khởi hành
  if (req.query.departureDate) {
    find.departureDate = new Date(req.query.departureDate);
  }
  // Hết Lọc theo ngày khởi hành

  // Lọc theo số lượng hành khách
  // Người lớn
  if (req.query.stockAdult) {
    find.stockAdult = {
      $gte: parseInt(req.query.stockAdult)
    }
  }

  // Trẻ em
  if (req.query.stockChildren) {
    find.stockChildren = {
      $gte: parseInt(req.query.stockChildren)
    }
  }

  // Em bé
  if (req.query.stockBaby) {
    find.stockBaby = {
      $gte: parseInt(req.query.stockBaby)
    }
  }
  // Hết Lọc theo số lượng hành khách

  // Lọc theo mức giá
  if (req.query.price) {
    const [minPrice, maxPrice] = req.query.price.split("-").map(item => parseInt(item))
    find.priceNewAdult = {
      $gte: minPrice,
      $lte: maxPrice
    }
  }
  // Hết Lọc theo mức giá

  const tourList = await Tour
    .find(find)
    .sort({
      position: "desc"
    })

  for (const item of tourList) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }

  res.render("client/pages/search", {
    pageTitle: "Kết quả tìm kiếm",
    tourList
  })
}