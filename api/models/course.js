"use strict";
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a value for 'title'"],
  },
  description: {
    type: String,
    required: [true, "Please provide a value for 'description'"],
  },
  estimatedTime: {
    type: String,
  },
  materialsNeeded: {
    type: String,
  },
  user: {
    type: String,
  },
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
