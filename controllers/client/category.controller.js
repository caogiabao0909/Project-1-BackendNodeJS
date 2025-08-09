const Category = require("../../models/category.model");

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

  res.render("client/pages/tour-list", {
    pageTitle: "Danh sách tour",
    breadcrumb: breadcrumb
  })
}