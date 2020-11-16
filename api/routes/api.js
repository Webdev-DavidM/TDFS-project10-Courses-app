const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");
const mongoose = require("mongoose");

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    let errors = [];
    try {
      await cb(req, res, next);
    } catch (err) {
      if (err.reason) {
        res.status(400).json({ message: err }).end();
      } else {
        for (const error in err.errors) {
          errors.push(err.errors[error].message);
          res.status(400).json({ message: errors }).end();
        }
      }
    }
  };
}

// middleware to authenticate users //

const authenticateUser = async (req, res, next) => {
  let message = null;
  let chosenUser = null;
  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);
  console.log(credentials);
  // If the user's credentials are available...
  if (credentials) {
    try {
      let user = await User.findOne({ emailAddress: credentials.name });
      if (user) {
        chosenUser = user;
      } else {
        return res.status(401).json("no such user exists");
      }
    } catch (err) {
      res.json(err);
    }

    console.log("user from database", chosenUser);
    // If a user was successfully retrieved from the data store...
    if (chosenUser) {
      // Use the bcryptjs npm package to compare the user's password
      // (from the Authorization header) to the user's password
      // that was retrieved from the data store.
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        chosenUser.password
      );
      // If the passwords match...
      console.log("authenticated", authenticated);

      if (authenticated) {
        console.log(
          `Authentication successful for username: ${chosenUser.firstName} ${chosenUser.lastName}`
        );
        // Then store the retrieved user object on the request object
        // so any middleware functions that follow this middleware function
        // will have access to the user's information.
        req.currentUser = chosenUser;
      } else {
        message = `Authentication failure for username: ${chosenUser.firstName} ${chosenUser.lastName}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = "Auth header not found";
  }
  // If user authentication failed...

  if (message !== null) {
    console.warn(message);
    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: "Access Denied" });
  } else {
    // Or if user authentication succeeded...
    // Call the next() method.
    next();
  }
};

// Get route- this will return the info about the current user based on the authorization name and password in the header of the req
//// I am passing the middleware function to the get users route, if the passwords dont match then
// the inline route handler will never get called.

// User route- This route returned the currently authenticated user and returns a status code of 200
// WORKING ON POSTMAN//
router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    //this will check if the authenticated user id has the same id as the user requested in the params
    let user = await User.findOne({ _id: req.currentUser._id });
    if (user) {
      res.json(user);
    }
    if (!user) {
      res.status(400).json("no user found");
    }
  })
);

// User route- This post route allows you to add a user to the database, sets the location header to '/', returns no content but a status code of 201
// WORKING ON POSTMAN
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    // here I check if there is a user already with this email address, fi so I send back an error message
    if (req.body.emailAddress) {
      let userExists = await User.findOne({
        emailAddress: req.body.emailAddress,
      });
      if (userExists) {
        return res.status(401).json("user exists");
      }
    }
    if (req.body.password) {
      // The next two lines I am hashing the password to make it secure
      const password = bcryptjs.hashSync(req.body.password);
      req.body.password = password;
    }
    let response = await User.create(req.body);
    res.status(201).json(response).end();
  })
);

// course get route- returns a list of courses ( including the user that owns each course ) and returns a status of 200
//WORKING ON POSTMAN
router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    let course = await Course.find();
    res.status(200).json(course);
  })
);

// specific course get route- returns a specific course based on the course id ( including the user that owns the course) and returns a 200 status code //
// WORKING ON POSTMAN
router.get(
  "/courses/:id",
  asyncHandler(async (req, res) => {
    let course = await Course.findOne({ _id: req.params.id });
    if (course) {
      let user = await User.findOne(
        { _id: course.user },
        { _id: 1, firstName: 1, lastName: 1 }
      );
      res.status(200).json({ course, user });
    } else {
      res.status(404).json("no such course found");
    }
  })
);

// post route for courses- create a course, sets the location header for the uri for the course, and returns no content but a 201 status code
// WORKING ON POSTMAN
router.post(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res) => {
    //Here now that the user has been authenticated with my middleware, I can use the id from the currentUser found in
    // authenticateUser middleware to add to the course.
    req.body.user = req.currentUser._id;
    let response = await Course.create(req.body);
    res.status(201).json(response).end();
  })
);

// put route- this will update a course and return a status code of 204 with no content.
//Sequelize will not validate if they are empty on put methods like it does on post methods, therefore I have set up my own validation below if any fields are empty.
//
router.put("/courses/:id", authenticateUser, async (req, res) => {
  // as validation is not performed on updates as default, I will validate the data myself
  let errors = {};
  errors.message = [];
  let okToUpdate = true;
  if (!req.body.title) {
    errors.message.push("Please provide a title");
    okToUpdate = false;
  }
  if (!req.body.description) {
    errors.message.push("Please provide a description");
    okToUpdate = false;
  }
  if (!okToUpdate) {
    res.status(400).json(errors).end();
  }
  //here I will make sure that find the course on the database and msake sure the course
  // user is the same as chosenUser_id

  let course = await Course.findOne({ _id: req.params.id });
  if (!course) {
    res.status(404).json("no course found").end();
  }
  if (course) {
    // as objectIDs are bson object I need to convert them to strings to
    // compare them to my user string
    userId = req.currentUser._id.toString();
    if (course.user === userId) {
      await Course.updateOne({ _id: req.params.id }, req.body);
      return res.status(204).end();
    } else {
      res
        .status(403)
        .json("Access denied, a user can only update their own courses")
        .end();
    }
  }
});

// delete route- this deletes the chosen route and returns a 204 status code and not comments

router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    console.log(req.params.id);
    debugger;
    let course = await Course.findOne({ _id: req.params.id });
    console.log("course", course);
    if (!course) {
      res.status(401).json("Course doesnt exist");
    } else {
      let currentUser = req.currentUser.id.toString();
      if (currentUser === course.user) {
        await Course.deleteOne({ _id: req.params.id });
        res.status(204).json("deleted").end();
      }
    }
  })
);

module.exports = router;
