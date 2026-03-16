const categoryHelper = require("../../helpers/category.helper")

const Tour = require("../../models/tour.model")
const moment = require("moment")

module.exports.home = async (req, res) => {
  // Section 2
  const tourListSection2 = await Tour
    .find({
      deleted: false
    })
    .sort({
      position: "desc"
    })
    .limit(6)

  for (const item of tourListSection2) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  // End section 2

  // Section 4: Tour trong nước
  const categoryIdSection4 = "67ff2b2d818e0f155b2af8fe"
  const listCategoryId = await categoryHelper.getAllSubcategoryIds(categoryIdSection4)

  const tourListSection4 = await Tour
    .find({
      category: { $in: listCategoryId },
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(8)

  for (const item of tourListSection4) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  // Hết Section 4: Tour trong nước

  // Section 6: Tour Nước ngoài
  const categoryIdSection6 = "67ff5daca324aa37d2627e74"
  const listCategory6Id = await categoryHelper.getAllSubcategoryIds(categoryIdSection6)

  const tourListSection6 = await Tour
    .find({
      category: { $in: listCategory6Id },
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(8)

  for (const item of tourListSection6) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  // Hết Section 6: Tour Nước ngoài

  res.render("client/pages/home", {
    pageTitle: "Trang chủ",
    tourListSection2: tourListSection2,
    tourListSection4: tourListSection4,
    tourListSection6: tourListSection6
  })
}