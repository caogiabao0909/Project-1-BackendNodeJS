const moment = require("moment");
const { paymentMethod, paymentStatus, orderStatus } = require("../../config/variable");
const { generateRandomNumber } = require("../../helpers/generate.helper");
const Order = require("../../models/order.model");
const Tour = require("../../models/tour.model");
const City = require("../../models/city.model");


module.exports.createPost = async (req, res) => {
  try {
    let orderCode;
    let isDuplicate = true;
    while (isDuplicate) {
      orderCode = `OD` + generateRandomNumber(10);
      const existingOrder = await Order.findOne({ orderCode });
      if (!existingOrder) {
        isDuplicate = false;
      }
    }
    req.body.orderCode = orderCode;

    for (const item of req.body.items) {
      const tourInfo = await Tour.findOne({
        _id: item.tourId
      })

      if (tourInfo) {
        // Giá
        item.priceNewAdult = tourInfo.priceNewAdult;
        item.priceNewChildren = tourInfo.priceNewChildren;
        item.priceNewBaby = tourInfo.priceNewBaby;

        // Ngày khởi hành
        item.departureDate = tourInfo.departureDate

        // Ảnh
        item.avatar = tourInfo.avatar

        // Tiêu đề
        item.name = tourInfo.name

        // Cập nhật lại số lượng
        if (item.quantityChildren > tourInfo.stockChildren || item.quantityAdult > tourInfo.stockAdult || item.quantityBaby > tourInfo.stockBaby) {
          res.json({
            code: "error",
            message: `Số lượng chỗ của tour ${tourInfo.name} đã hết, vui lòng đặt lại!`
          })
          return;
        }

        await Tour.updateOne({
          _id: item.tourId
        }, {
          stockAdult: tourInfo.stockAdult - item.quantityAdult,
          stockChildren: tourInfo.stockChildren - item.quantityChildren,
          stockBaby: tourInfo.stockBaby - item.quantityBaby,
        })
      }
    }

    // Tạm tính 
    req.body.subTotal = req.body.items.reduce((sum, tour) => {
      return sum + (tour.quantityAdult * tour.priceNewAdult) + (tour.quantityChildren * tour.priceNewChildren) + (tour.quantityBaby * tour.priceNewBaby)
    }, 0)

    // Giảm
    req.body.discount = 0

    // Thanh toán
    req.body.total = req.body.subTotal - req.body.discount

    // Trạng thái đơn hàng
    req.body.status = "initial"

    // Trạng thái thanh toán
    req.body.paymentStatus = `unpaid`

    const newRecord = new Order(req.body)
    await newRecord.save();

    res.json({
      code: "success",
      message: "Đặt hàng thành công!",
      orderId: newRecord.id
    })

  } catch (error) {
    console.log(error);

    res.json({
      code: "error",
      message: "Đặt hàng không thành công!"
    })
  }
}

module.exports.success = async (req, res) => {
  try {
    const { orderId, phone } = req.query;

    const orderDetail = await Order.findOne({
      _id: orderId,
      phone: phone,
    })

    if (!orderDetail) {
      res.redirect(`/`)
      return
    }

    orderDetail.paymentMethodName = paymentMethod.find(item => item.value === orderDetail.paymentMethod).label;
    orderDetail.paymentStatusName = paymentStatus.find(item => item.value === orderDetail.paymentStatus).label;
    orderDetail.orderStatusName = orderStatus.find(item => item.value === orderDetail.status).label;
    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format("HH:mm - DD/MM/YYYY")

    for (const item of orderDetail.items) {
      const tourInfo = await Tour.findOne({
        _id: item.tourId,
        deleted: false
      })

      if (tourInfo) {
        item.slug = tourInfo.slug;
      }

      item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY")

      const city = await City.findOne({
        _id: item.locationFrom
      })

      if (city) {
        item.cityName = city.name
      }

    }

    res.render(`client/pages/order-success`, {
      pageTitle: `Đặt hàng thành công`,
      orderDetail
    })
  } catch (error) {
    console.log(error)
    res.redirect(`/`)
  }
}