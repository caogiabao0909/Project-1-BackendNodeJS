const AccountAdmin = require("../../models/account-admin.model")
const Order = require("../../models/order.model")

module.exports.dashboard = async (req, res) => {
  const overview = {
    totalAdmin: 0,
    totalOrder: 0,
    revenue: 0,
  }

  overview.totalAdmin = await AccountAdmin.countDocuments({
    deleted: false
  })

  const orderList = await Order.find({
    deleted: false
  })

  overview.totalOrder = orderList.length;

  overview.revenue = orderList.reduce((sum, item) => {
    return (item.paymentStatus === "paid") ? sum + item.total : sum;
  }, 0)


  res.render("admin/pages/dashboard", {
    pageTitle: "Tổng quan",
    overview
  })
}