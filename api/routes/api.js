const express = require('express');
const router = express.Router();
const { User, Course } = require('../models/index');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      if (
        err.name === 'SequelizeValidationError' ||
        'SequelizeUniqueConstraintError'
      ) {
        let errors = err.errors.map((err) => err.message);
        res.status(400).json({ message: errors });
      } else {
        res.status(400).json(err);
      }
    }
  };
}

// middleware to authenticate users //

const authenticateUser = async (req, res, next) => {
  let message = null;
  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);
  // If the user's credentials are available...
  if (credentials) {
    // Attempt to retrieve the user from the data store
    // by their username (i.e. the user's "key"
    // from the Authorization header).
    // This is one way of finding the user with the same email but I have choosing a different one below //
    // const users = await User.findAll();
    // const user = users.find((u) => u.emailAddress === credentials.name);
    // i have chosen this way to find the user with the same password to use
    // practice some sequelize querying //
    const chosenUser = await User.findOne({
      where: {
        emailAddress: `${credentials.name}`,
      },
    });
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
      if (authenticated) {
        console.log(
          `Authentication successful for username: ${chosenUser.firstName} ${chosenUser.lastName}`
        );
        // Then store the retrieved user object on the request object
        // so any middleware functions that follow this middleware function
        // will have access to the user's information.
        req.currentUser = chosenUser;
      } else {
        message = `Authentication failure for username: ${chosenUser.id}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }
  // If user authentication failed...
  if (message) {
    console.warn(message);
    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
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

router.get('/users', authenticateUser, async (req, res) => {
  // this will check if the authenticated user id has the same id as the user requested in the params
  user = await User.findByPk(req.currentUser.id, {
    attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
  });
  if (user) {
    res.json(user);
  }
});

// User route- This post route allows you to add a user to the database, sets the location header to '/', returns no content but a status code of 201

router.post(
  '/users',
  asyncHandler(async (req, res) => {
    if (req.body.password) {
      // The next two lines I am hashing the password to make it secure
      const password = bcryptjs.hashSync(req.body.password);
      req.body.password = password;
    }
    console.log(req.body);
    await User.create(req.body);
    // res.location redirsct the user to the home page
    res.location('/').status(201).end();
  })
);

// course get route- returns a list of courses ( including the user that owns each course ) and returns a status of 200

router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    let courses;
    courses = await Course.findAll({
      attributes: ['id', 'title', 'description', 'estimatedTime', 'userId'],
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
        },
      ],
    });
    res.json(courses);
  })
);

// specific course get route- returns a specific course based on the course id ( including the user that owns the course) and returns a 200 status code //

router.get(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    let course;
    course = await Course.findByPk(req.params.id, {
      attributes: [
        'id',
        'title',
        'description',
        'estimatedTime',
        'materialsNeeded',
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
        },
      ],
    });

    if (course) {
      res.json(course);
    } else {
      res.status(404).json('no such course found');
    }
  })
);

// post route for courses- create a course, sets the location header for the uri for the course, and returns no content but a 201 status code

router.post(
  '/courses',
  authenticateUser,
  asyncHandler(async (req, res) => {
    let course = req.body;
    // let courseTitle = req.body.title;
    // let courseId ;
    let createdCourse = await Course.create(course);
    // redirect the location header to the course created.
    res.location(`/course/${createdCourse.id}`).status(201).end();
  })
);

// put route- this will update a course and return a status code of 204 with no content. Sequelize will not validate if they are empty on put methods like it does on post methods, therefore I have set up my own validation below if any fields are empty.

router.put(
  '/courses/:id',
  authenticateUser,
  asyncHandler(async (req, res) => {
    let errors = {};
    let okToUpdate = true;
    if (!req.body.title) {
      errors.message = ['Please provide a title'];
      okToUpdate = false;
    }
    if (!req.body.description) {
      if (errors.message) {
        errors.message.push('Please provide a description');
      } else {
        errors.message = ['Please provide a description'];
      }
      okToUpdate = false;
    }
    if (!okToUpdate) {
      res.status(400).json(errors);
    }
    if (okToUpdate) {
      let updatedCourse;
      updatedCourse = await Course.findByPk(req.params.id);
      if (updatedCourse) {
        if (updatedCourse.userId == req.currentUser.id) {
          // If checks if there is a course, if not it will throw an error of
          // course not found below in the else statement
          await updatedCourse.update(req.body);
          res.status(204).end();
        } else {
          res
            .status(403)
            .json('Access denied, a user can only update their own courses');
        }
      } else {
        res.status(404).end();
      }
    }
  })
);

// delete route- this deletes the chosen route and returns a 204 status code and not comments

router.delete(
  '/courses/:id',
  authenticateUser,
  asyncHandler(async (req, res) => {
    let course;
    course = await Course.findByPk(req.params.id);
    if (req.currentUser.id == parseInt(course.userId)) {
      console.log(course);
      if (course) {
        await course.destroy();
        res.status(204).end();
      } else {
        res.status(400).json('No such course to delete');
      }
    } else {
      console.log('access denied');
      res
        .status(403)
        .json('Access denied, a user can only delete their own courses');
    }
  })
);

//

module.exports = router;
