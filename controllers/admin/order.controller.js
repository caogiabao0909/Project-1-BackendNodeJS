const { paymentMethod, paymentStatus, orderStatus } = require("../../config/variable")
const moment = require("moment")
const Order = require("../../models/order.model")
const City = require("../../models/city.model")

module.exports.list = async (req, res) => {
  const find = {
    deleted: false
  }

  const orderList = await Order
    .find(find)
    .sort({
      createAt: "desc"
    })


  for (const orderDetail of orderList) {
    orderDetail.paymentMethodName = paymentMethod.find(item => item.value === orderDetail.paymentMethod).label;
    orderDetail.paymentStatusName = paymentStatus.find(item => item.value === orderDetail.paymentStatus).label;
    orderDetail.orderStatusName = orderStatus.find(item => item.value === orderDetail.status).label;
    orderDetail.createdAtTime = moment(orderDetail.createdAt).format("HH:mm")
    orderDetail.createdAtDate = moment(orderDetail.createdAt).format("DD/MM/YYYY")
  }

  res.render("admin/pages/order-list", {
    pageTitle: "Quản lý đơn hàng",
    orderList
  })
}

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const orderDetail = await Order.findOne({
      _id: id,
      deleted: false
    })

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format("YYYY-MM-DDTHH:mm");

    for (const tourDetail of orderDetail.items) {
      const city = await City.findOne({
        _id: tourDetail.locationFrom
      })

      tourDetail.locationFromName = city.name
      tourDetail.departureDataFormat = moment(tourDetail.departureData).format("DD/MM/YYYY")
    }

    res.render("admin/pages/order-edit", {
      pageTitle: `Đơn hàng: ${orderDetail.orderCode}`,
      orderDetail,
      paymentMethod,
      paymentStatus,
      orderStatus
    })
  } catch (error) {
    console.log(error)
    res.redirect(`/${pathAdmin}/order/list`)
  }
}

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const orderDetail = await Order.findOne({
      _id: id,
      deleted: false
    })

    if (!orderDetail) {
      res.json({
        code: "error",
        message: "Thông tin đơn hàng không hợp lệ!"
      })
      return
    }

    await Order.updateOne({
      _id: id,
      deleted: false,
    }, req.body)

    req.flash("success", "Cập nhật đơn hàng thành công!")

    res.json({
      code: "success",
    })

  } catch (error) {
    console.log(error)
    res.json({
      code: "error",
      message: "Thông tin đơn hàng không hợp lệ!"
    })
  }
}