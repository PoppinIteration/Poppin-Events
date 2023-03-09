/* eslint-disable camelcase */
// import the event model
const db = require('../models/dbModel');

const eventController = {};

// find a specific event in the db that the user is rsvp-ing to, to see if we need to add the event to the db
eventController.findEvent = (req, res, next) => {
  // check what type of event it is - if it is a user event then it is already in the events table then return next()
  const { evt_origin_type_id } = req.body;
  if (evt_origin_type_id === 1) {
    res.locals.dbEvent = req.body.id;
    return next();
  }
  // if the event is a ticketmaster event then we need to check if it's already in the events table
  const { ticketmaster_evt_id } = req.body;
  const queryStr = 'SELECT id, ticketmaster_evt_id FROM events WHERE evt_origin_type_id = $1';
  db.query(queryStr, [evt_origin_type_id])
    .then((data) => {
      const ticketmasterEvents = data.rows;
      for (let i = 0; i < ticketmasterEvents.length; i += 1) {
        if (ticketmasterEvents[i].ticketmaster_evt_id === ticketmaster_evt_id) {
          res.locals.dbEvent = ticketmasterEvents[i].id;
          return next();
        }
      }
      // if the ticketmaster event ID is not in the events table then we need to create an event
      res.locals.dbEvent = false;
      return next();
    })
    .catch((error) => next({
      log: 'Error in eventController.findEvent',
      message: { err: error },
    }));
};

// get all events from database
eventController.getEvents = async (req, res, next) => {
  try {
    // select event information, using jsonb_agg to create a json object out of lat and lng by declaring key/value pairs
    const query = await db.query('SELECT e.id, e.name, e.description, e.date, e.loc_name AS locName, e.address, jsonb_agg(json_build_object(\'lat\', e.lat, \'lng\', e.lng)) AS location, u.name AS organizer, u.email, u.picture FROM events e LEFT OUTER JOIN users u ON e.organizer_id = u.id group by e.id, u.name, u.email, u.picture');
    res.locals.events = query.rows;
    // query shape: {something: x, rows:[{data}, {data2}], blah: y, ....}
    return next();
  } catch (error) {
    return next({
      log: 'eventController.getEvents error',
      message: { err: 'Error getting events from database' },
    });
  }
};

// create a new event in the database
eventController.createEvent = async (req, res, next) => {
  try {
    console.log('in event creator with req: ', req.body);
    const {
      name, description, date, locName, address, userID,
    } = req.body;
    const { lat, lng } = req.body.location[0];
    // insert the event into the database using a subquery for the organizer id
    const addEventQuery = 'INSERT INTO events (name, description, date, loc_name, address, lat, lng, organizer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id';
    const newEventVals = [name, description, date, locName, address, lat, lng, userID];
    const newEvent = await db.query(addEventQuery, newEventVals);
    // **note - that rows[0] will actually be an OBJECT containing {id: <some number>} ** !
    res.locals.id = newEvent.rows[0];
    return next();
  } catch (error) {
    return next({
      log: 'eventController.createEvent error',
      message: { err: 'Error creating event in database' },
    });
  }
};

// update an event in the database
eventController.updateEvent = async (req, res, next) => {
  const {
    name, description, date, locName, address, userID, eventID,
  } = req.body;
  const { lat, lng } = req.body.location[0];
  const values = [name, description, date, locName, address, lat, lng, userID, eventID];
  const text = 'UPDATE events SET name = $1, description = $2, date = $3, loc_name = $4, address = $5, lat = $6, lng = $7 WHERE organizer_id = $8 AND id = $9;';
  try {
    await db.query(text, values);
    return next();
  } catch (error) {
    return next({
      log: 'eventController.updateEvent error',
      message: { err: 'Error updating event in database' },
    });
  }
};

// delete an event from the database
eventController.deleteEvent = async (req, res, next) => {
  const { eventID, userID } = req.body.deleteReq;
  const values = [eventID, userID];
  const text = 'DELETE FROM events WHERE id = $1 AND organizer_id = $2';
  try {
    await db.query(text, values);
    return next();
  } catch (error) {
    return next({
      log: 'eventController.deleteEvent error',
      message: { err: 'Error deleting event from database' },
    });
  }
};

module.exports = eventController;
