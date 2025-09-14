const Order = require("../../models/order.model");
const Tour = require("../../models/tour.model");


module.exports.createPost = async (req, res) => {
  try {
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