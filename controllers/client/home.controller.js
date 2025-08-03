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

  console.log(tourListSection2)
  for (const item of tourListSection2) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  // End section 2

  res.render("client/pages/home", {
    pageTitle: "Trang chủ",
    tourListSection2: tourListSection2
  })
}