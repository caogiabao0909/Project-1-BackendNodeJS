const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: String,
  parent: String,
  position: Number,
  status: String,
  avatar: String,
  description: String,
  createdBy: String,
  slug: String,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedBy: String,
  deletedAt: Date
}, {
  timestamps: true, // tự động sinh ra trường createdAt và updatedAt
});

const Category = mongoose.model('Category', schema, "categories");

module.exports = Category;