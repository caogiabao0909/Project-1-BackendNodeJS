const { paymentMethod, paymentStatus, orderStatus } = require("../../config/variable")
const moment = require("moment")
const Order = require("../../models/order.model")

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
  console.log(orderList)


  res.render("admin/pages/order-list", {
    pageTitle: "Quản lý đơn hàng",
    orderList
  })
}

module.exports.edit = async (req, res) => {
  res.render("admin/pages/order-edit", {
    pageTitle: "QĐơn hàng: OD000001",
  })
}