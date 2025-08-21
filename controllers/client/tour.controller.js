const Category = require("../../models/category.model");
const City = require("../../models/city.model");
const Tour = require("../../models/tour.model")

const moment = require("moment")

module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;

    const tourDetail = await Tour
      .findOne({
        slug: slug,
        deleted: false,
        status: "active",
      })

    if (!tourDetail) {
      return res.redirect("/")
    }

    const breadcrumb = {
      image: tourDetail.avatar,
      title: tourDetail.name,
      list: [
        {
          link: "/",
          title: "Trang chủ"
        }
      ]
    };

    const category = await Category.findOne({
      _id: tourDetail.category,
      deleted: false,
      status: "active"
    })

    if (category) {
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
        link: `/category/${category.slug}`,
        title: category.name
      })
    }

    breadcrumb.list.push({
      link: `/tour/detail/${slug}`,
      title: tourDetail.name
    })

    tourDetail.departureDateFormat = moment(tourDetail.departureDate).format("DD/MM/YYYY");

    const cityList = await City.find({
      _id: { $in: tourDetail.locations }
    })

    res.render("client/pages/tour-detail", {
      pageTitle: "Chi tiết tour",
      breadcrumb,
      tourDetail,
      cityList,
    })

  } catch (error) {
    console.log(error);
    res.redirect("/")
  }
}