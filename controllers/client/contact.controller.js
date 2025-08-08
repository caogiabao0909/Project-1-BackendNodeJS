const Contact = require("../../models/contact.model");

module.exports.createPost = async (req, res) => {
  const { email } = req.body;

  const existEmail = await Contact.findOne({
    email: email,
  })

  if (existEmail) {
    res.json({
      code: "error",
      message: "Email đã được đăng ký!"
    })
    return;
  }

  const newRecord = new Contact(req.body);
  await newRecord.save();

  req.flash("success", "Đăng ký nhận thông tin thành công!")

  res.json({
    code: "success",
  })
}