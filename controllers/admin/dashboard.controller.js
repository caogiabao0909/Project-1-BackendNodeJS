const AccountAdmin = require("../../models/account-admin.model")
const Order = require("../../models/order.model")

module.exports.dashboard = async (req, res) => {
  // section 1
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
  // End section 1


  res.render("admin/pages/dashboard", {
    pageTitle: "Tổng quan",
    overview
  })
}

module.exports.revenueChartPost = async (req, res) => {
  const { currentMonth, currentYear, previousMonth, previousYear, arrayDay } = req.body;

  // Lấy ra các order của tháng hiện tại
  const ordersInCurrentMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(currentYear, currentMonth - 1, 1),
      $lt: new Date(currentYear, currentMonth, 1)
    }
  })

  // Lấy ra các order của tháng trước đó
  const ordersInPreviousMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(previousYear, previousMonth - 1, 1),
      $lt: new Date(previousYear, previousMonth, 1)
    }
  })

  const dataCurrentMonth = []
  const dataPreviousMonth = []

  for (const day of arrayDay) {
    // Lấy doanh thu tháng hiện tại
    let totalCurrent = 0;
    for (const order of ordersInCurrentMonth) {
      const orderDate = new Date(order.createdAt).getDate();
      if (orderDate == day) {
        totalCurrent += order.total
      }
    }
    dataCurrentMonth.push(totalCurrent)

    // Lấy doanh thu tháng trước
    let totalPrevious = 0;
    for (const order of ordersInPreviousMonth) {
      const orderDate = new Date(order.createdAt).getDate();
      if (orderDate == day) {
        totalPrevious += order.total
      }
    }
    dataPreviousMonth.push(totalPrevious)
  }


  res.json({
    code: "success",
    dataCurrentMonth,
    dataPreviousMonth
  })
}