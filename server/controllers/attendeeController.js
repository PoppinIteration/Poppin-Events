const db = require('../models/dbModel');

const attendeeController = {};

attendeeController.getEventsByUser = (req, res, next) => {
  const { userID } = req.query;

  const queryStr = `SELECT e.id, e.name, e.description, e.date, e.loc_name, e.lat, e.lng, e.address, e.rsvp_url, e.end_date, e.image_url, e.ticketmaster_evt_id, e.evt_origin_type_id,
    u.id AS organizer_id, u.name AS organizer_name, u.email AS organizer_email, u.picture AS organizer_picture, a.rsvp_level_id 
    FROM events e 
    INNER JOIN attendees a ON e.id = a.events_id 
    INNER JOIN users u ON a.users_id = u.id 
    WHERE a.users_id = $1`;
  db.query(queryStr, [userID])
    .then((data) => {
      const rsvpEvents = data.rows;

      const normalizedEvents = [];
      for (let i = 0; i < rsvpEvents.length; i += 1) {
        const event = rsvpEvents[i];
        const eventKeys = Object.keys(event);
        const normalEvent = {
          location: {},
          organizer: {},
        };
        for (let j = 0; j < eventKeys.length; j += 1) {
          const key = eventKeys[j];
          switch (key) {
            case 'loc_name':
              normalEvent.locName = event[key];
              break;
            case 'lat':
              normalEvent.location[key] = event[key];
              break;
            case 'lng':
              normalEvent.location[key] = event[key];
              break;
            case 'organizer_id':
              normalEvent.organizer.id = event[key];
              break;
            case 'organizer_name':
              normalEvent.organizer.name = event[key];
              break;
            case 'organizer_email':
              normalEvent.organizer.email = event[key];
              break;
            case 'organizer_picture':
              normalEvent.organizer.picture = event[key];
              break;
            case 'rsvp_level_id':
              break;
            default:
              normalEvent[key] = event[key];
          }
        }
        const rsvpData = {
          event: normalEvent,
          rsvp: event.rsvp_level_id,
        };
        normalizedEvents.push(rsvpData);
      }

      res.locals.rsvpEvents = normalizedEvents;
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
  let event_id; // this needs to be here for some reason - defining the let/const in the if statement throws an error
  if (res.locals.dbEvent) {
    event_id = res.locals.dbEvent;
  } else {
    event_id = res.locals.id.id;
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
