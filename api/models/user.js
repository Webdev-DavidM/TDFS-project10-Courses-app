"use strict";
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide a value for 'firstName'"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide a value for 'lastName"],
  },
  emailAddress: {
    type: String,
    required: [true, "Please provide a value for 'email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a value for 'password"],
  },
  courses: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
