"use strict";

// load modules
const express = require("express");
const app = express();
const morgan = require("morgan");
const api = require("./routes/api.js");

// allow CORS between client and server

const cors = require("cors");
app.use(cors());

// Establish a connnection to the database and sync everytime there is a request //

const mongoose = require("mongoose");
// this will set up the validator so it will validate updates as well.
mongoose.set("runValidators", true);
mongoose.connect(
  "mongodb+srv://footballblubber:technics@cluster0.dkjvo.mongodb.net/THFS-FINAL-FULL-STACK-PROJECT?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("db connected");
});
// const { sequelize } = require('./models');

// (async () => {
//   try {
//     await sequelize.authenticate();
//     await sequelize.sync();
//     console.log('Connection to the database successful!');
//   } catch {
//     console.error('Unable to connect to the database');
//   }
// })();

//
// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// setup morgan which gives us http request logging
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// setup a friendly greeting for the root route

app.get("/", (req, res) => {
  res.json("welcome to the school api");
});

// TODO setup your api routes here

app.use("/api", api);

// send 404 if no other route matched, if no route is matched above then the 404 route will be used below as it is a use method which runs in orders on the page, all the other possible routes have been tried above so this is the last option

app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

//
// setup a global error handler
// app.use((err, req, res, next) => {
//   // if (enableGlobalErrorLogging) {
//   //   console.error(`Global error handler: ${JSON.stringify(err.message)}`);
//   // }
//   if (err.name === 'SequelizeValidationError') {
//     let errors = error.errors.map((err) => err.message);
//     res.status(400).json({ message: errors });
//   } else {
//     res.status(err.status).json({
//       message: err.message,
//     });
//   }
// });

// set our port
app.set("port", process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
