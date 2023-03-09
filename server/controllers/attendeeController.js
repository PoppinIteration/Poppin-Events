const db = require('../models/dbModel');

const attendeeController = {};

attendeeController.getEventsByUser = (req, res, next) => {
  const { userID } = req.query;

  const queryStr = 'SELECT e.*, a.rsvp_level_id FROM events e INNER JOIN attendees a ON e.id = a.events_id WHERE a.users_id = $1';
  db.query(queryStr, [userID])
    .then((data) => {
      const rsvpEvents = data.rows;
      console.log('Number of RSVP events returned for the user: ', rsvpEvents.length);
      res.locals.rsvpEvents = rsvpEvents;
      return next();
    })
    .catch((error) => next({
      log: 'Error in attendeeController.getEventsByUser',
      message: { err: error },
    }));
};

attendeeController.addAttendee = (req, res, next) => {
  const user_id = req.body.organizer.id;
  const rsvp_level = Number(req.params.rsvp_level);
  let event_id; //this needs to be here for some reason - defining the let/const in the if statement throws an error
  if (res.locals.dbEvent) {
    event_id = res.locals.dbEvent;
  } else {
    // const event_id = res.locals.id.id;
    event_id = 10;
  }

  const queryStr = 'INSERT INTO attendees (users_id, events_id, rsvp_level_id) VALUES ($1, $2, $3) RETURNING *';
  const args = [user_id, event_id, rsvp_level];
  db.query(queryStr, args)
    .then((data) => {
      const newAttendee = data.rows[0]; // newAttendee should be an object with key/value pairs for id (primary key), users_id, events_id, rsvp_level_id
      res.locals.newAttendee = newAttendee;
      return next();
    })
    .catch((error) => next({
      log: 'Error in attendeeController.addAttendee',
      message: { err: error },
    }));
};

module.exports = attendeeController;
