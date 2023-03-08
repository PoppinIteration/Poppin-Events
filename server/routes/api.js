const express = require('express');
const userController = require('../controllers/userController');
const eventController = require('../controllers/eventController');
const sessionController = require('../controllers/sessionController');
const tmEventController = require('../controllers/tmEventController');
const geocodeController = require('../controllers/geoCodeController');

const router = express.Router();

// Responds with user info (location + events) when passed in the correct google id
// router.get(
//   '/user/:id',
//   userController.getUser,
//   (req, res) => res.status(200).json(res.locals.user),
// );

// Log in or a new user in the database
router.post(
  '/users',
  userController.login,
  (req, res) => res.status(200).json(res.locals.id),
);

// Responds with all events in the database (Name, Location, Date, Description, Created By)
router.get(
  '/events',
  eventController.getEvents,
  (req, res) => res.status(200).json(res.locals.events),
);

// Create an event in the database
router.post(
  '/events',
  eventController.createEvent,
  (req, res) => res.status(200).json(res.locals.id),
);

// Update an event in the database
router.put(
  '/events',
  eventController.updateEvent,
  (req, res) => res.sendStatus(200),
);

// Delete an event in the database
router.delete(
  '/events',
  eventController.deleteEvent,
  (req, res) => res.sendStatus(200),
);

// GET all the events in a specific area from Ticketmaster API
router.get(
  '/ticketmaster/:lat/:lng',
  geocodeController.reverseGeocode,
  // (req, res) => res.status(200).json(res.locals),
  tmEventController.getEvents,
  (req, res) => res.status(200).json(res.locals.events),
);

// Checks for active sessions
router.get(
  '/sessions',
  sessionController.validateSession,
  (req, res) => res.status(200).send(res.locals),
);
router.delete(
  '/sessions',
  sessionController.deleteSession,
  (req, res) => res.sendStatus(200),
);

module.exports = router;
