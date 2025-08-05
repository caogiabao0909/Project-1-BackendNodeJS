const Category = require("../models/category.model")

// Lấy cây danh mục
const buildCategoryTree = (categories, parentId = "") => {
  const tree = [];

  categories.forEach(item => {
    if (item.parent == parentId) {
      const children = buildCategoryTree(categories, item.id);

      tree.push({
        id: item.id,
        name: item.name,
        slug: item.slug,
        children: children
      })
    }
  });

  return tree;
}

module.exports.buildCategoryTree = buildCategoryTree;
// Hết lấy cây danh mục

// Lấy tất cả id của danh mục cha và con
module.exports.getAllSubcategoryIds = async (parentId) => {
  const result = [parentId];

  // Hàm tìm các danh mục con
  const findChildren = async (currentId) => {
    const children = await Category
      .find({
        parent: currentId,
        deleted: false,
        status: "active"
      })
      .sort({
        position: "desc"
      })

    for (const child of children) {
      result.push(child.id);
      await findChildren(child.id);
    }
  }

  await findChildren(parentId);

  return result;
}
// Hết Lấy tất cả id của danh mục cha và con
