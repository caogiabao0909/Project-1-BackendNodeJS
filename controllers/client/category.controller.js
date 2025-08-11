const Category = require("../../models/category.model");
const Tour = require("../../models/tour.model")
const City = require("../../models/city.model");

const categoryHelper = require("../../helpers/category.helper")

const moment = require("moment");

module.exports.list = async (req, res) => {
  const slug = req.params.slug;

  const category = await Category.findOne({
    slug: slug,
    deleted: false,
    status: "active"
  })

  if (!category) {
    res.redirect("/");
    return
  }

  const breadcrumb = {
    image: category.avatar,
    title: category.name,
    list: [
      {
        link: "/",
        title: "Trang chủ"
      }
    ]
  };

  if (category.parent) {
    const parentCategory = await Category.findOne({
      _id: category.parent,
      deleted: false,
      status: "active"
    })

    if (parentCategory) {
      breadcrumb.list.push({
        link: `/category/${parentCategory.slug}`,
        title: parentCategory.name
      })
    }
  }

  breadcrumb.list.push({
    link: `/category/${slug}`,
    title: category.name
  })

  // Lấy danh sách tour
  const listCategoryId = await categoryHelper.getAllSubcategoryIds(category.id)

  const find = {
    category: { $in: listCategoryId },
    deleted: false,
    status: "active"
  }

  // Tính tổng số tour
  const totalTour = await Tour.countDocuments(find)

  const tourList = await Tour
    .find(find)
    .sort({
      position: "desc"
    })
    .limit(8)

  for (const item of tourList) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  // Hết Lấy danh sách tour

  // Lấy danh sách thành phố
  const cityList = await City.find({});
  // Hết Lấy danh sách thành phố

  res.render("client/pages/tour-list", {
    pageTitle: "Danh sách tour",
    breadcrumb,
    category,
    tourList,
    totalTour,
    cityList
  })
}