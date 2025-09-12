const Tour = require("../../models/tour.model")
const City = require("../../models/city.model")
const moment = require("moment")

module.exports.cart = async (req, res) => {
  res.render("client/pages/cart", {
    pageTitle: "Giỏ hàng",
  })
}

module.exports.detail = async (req, res) => {
  try {
    const cart = req.body;

    for (const item of cart) {
      const tourInfo = await Tour.findOne({
        _id: item.tourId,
        status: "active",
        deleted: false,
      })

      if (tourInfo) {
        item.name = tourInfo.name
        item.avatar = tourInfo.avatar
        item.priceNewAdult = tourInfo.priceNewAdult
        item.priceNewChildren = tourInfo.priceChildren
        item.priceNewBaby = tourInfo.priceNewBaby
        item.departureDateFormat = moment(tourInfo.departureDate).format("DD/MM/YYYY")

        const city = await City.findOne({
          _id: item.locationFrom
        })
        item.locationFromName = city.name;
      } else {
        const indexItem = cart.findIndex(tour => tour.tourId == item.tourId)
        cart.splice(indexItem, 1);
      }
    }

    res.json({
      code: "success",
      cart
    })
  } catch (error) {
    console.log(error)
  }
}