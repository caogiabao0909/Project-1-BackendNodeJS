const moment = require("moment");
const { paymentMethod, paymentStatus, orderStatus } = require("../../config/variable");
const { generateRandomNumber } = require("../../helpers/generate.helper");

const Order = require("../../models/order.model");
const Tour = require("../../models/tour.model");
const City = require("../../models/city.model");

const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const uuid = require('uuid/v1'); // npm install uuid

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

module.exports.paymentZaloPay = async (req, res) => {
  try {
    const orderId = req.query.orderId

    const orderDetail = await Order.findOne({
      _id: orderId,
      paymentStatus: "unpaid",
      deleted: false
    })

    if (!orderDetail) {
      res.redirect("/")
      return
    }

    // APP INFO
    const config = {
      app_id: process.env.ZALOPAY_APPID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: `${process.env.ZALOPAY_DOMAIN}/v2/create`
    };

    const embed_data = {
      redirecturl: `${process.env.DOMAIN_WEBSITE}/order/success?orderId=${orderDetail.id}&phone=${orderDetail.phone}`
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: `${orderDetail.phone}-${orderDetail.id}`,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: orderDetail.total,
      description: `Thanh toán đơn hàng ${orderDetail.orderCode}`,
      bank_code: "",
      callback_url: `${process.env.DOMAIN_WEBSITE}/order/payment-zalopay-result`
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const response = await axios.post(config.endpoint, null, { params: order });
    if (response.data.return_code == 1) {
      res.redirect(response.data.order_url);
    } else {
      res.redirect("/");
    }

  } catch (error) {
    console.log(error)
    res.redirect("/")
  }
}

module.exports.paymentZaloPayResultPost = async (req, res) => {
  const config = {
    key2: process.env.ZALOPAY_KEY2
  };

  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);


    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.returncode = -1;
      result.returnmessage = "mac not equal";
    }
    else {
      // thanh toán thành công
      let dataJson = JSON.parse(dataStr, config.key2);
      const [phone, orderId] = dataJson.app_user.split("-");

      await Order.updateOne({
        _id: orderId,
        phone: phone,
        deleted: false
      }, {
        paymentStatus: "paid"
      })

      result.returncode = 1;
      result.returnmessage = "success";
    }
  } catch (ex) {
    result.returncode = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.returnmessage = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);

}
