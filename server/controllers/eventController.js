/* eslint-disable camelcase */
// import the event model
const EventModel = require('../models/eventModel.js');
const db = require('../models/dbModel.js');

const EVENT_ORIGIN_TYPE = {
  'USER': 1,
  'TICKETMASTER': 2
};

const eventController = {};

// get all events from database
eventController.getEvents = async (req, res, next) => {
  try {
    /* select event information,
    using jsonb_agg to create a json object out of lat and lng by declaring key/value pairs */
    const queryStr = `
    SELECT e.id, 
    e.name, 
    e.description, 
    e.date, 
    e.loc_name AS locName, 
    e.address, 
    e.lat, 
    e.lng, 
    e.end_date,
    e.image_url,
    e.ticketmaster_evt_id,
    e.evt_origin_type_id,
    e.rsvp_url,
    u.id AS organizer_id,
    u.name AS organizer_name, 
    u.email AS organizer_email,
    u.picture AS organizer_picture
    FROM events e 
      LEFT OUTER JOIN users u 
        ON e.organizer_id = u.id 
    WHERE e.evt_origin_type_id = ${EVENT_ORIGIN_TYPE.USER}
    GROUP BY e.id, u.name, u.email, u.picture, u.id`;

    const queryResult = await db.query(queryStr);

    // Iterate through the rows, creating an EventModel for each row
    // Push all EventModels into the events array
    const eventsArr = [];
    queryResult.rows.forEach(row => {
      eventsArr.push(new EventModel(
        row.name,
        row.address,
        row.date,
        row.description,
        row.id,
        row.lat,
        row.lng,
        row.locName,
        row.end_date,
        row.image_url,
        row.ticketmaster_evt_id,
        row.rsvp_url,
        row.evt_origin_type_id,
        row.organizer_id,
        row.organizer_name,
        row.organizer_email,
        row.organizer_picture,
      ));
    });

    res.locals.events = eventsArr;
    // query shape: {something: x, rows:[{data}, {data2}], blah: y, ....}
    return next();
  } catch (error) {
      return next({
        log: 'eventController.getEvents error',
        message: { err: error.message },
      });
  }
};

// create a new event in the database
eventController.createEvent = async (req, res, next) => {
  try {
    if (!res.locals.dbEvent) {
      console.log('in event creator with req: ', req.body);

      const {
        name,
        address,
        date,
        description,
        location,
        locName,
        end_date,
        image_url,
        ticketmaster_evt_id,
        rsvp_url,
        evt_origin_type_id,
        organizer,
      } = req.body;

      const { lat, lng } = req.body.location;
      const organizer_id = req.body.organizer.id;

      // updated: insert the event into the database using subquery for the organizer id
      const addEventQuery = `INSERT INTO events 
        (
          name, 
          address, 
          date, 
          description, 
          lat, 
          lng,
          loc_name, 
          end_date, 
          image_url, 
          ticketmaster_evt_id, 
          rsvp_url, 
          evt_origin_type_id, 
          organizer_id
        ) 
        VALUES 
        (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        ) 
        RETURNING id`;

      // const newEventVals = [name, description, date, locName, address, lat, lng, userID];

      const newEventVals = [
        name,
        address,
        date,
        description,
        lat,
        lng,
        locName,
        end_date,
        image_url,
        ticketmaster_evt_id,
        rsvp_url,
        evt_origin_type_id,
        organizer_id,
      ];
      const newEvent = await db.query(addEventQuery, newEventVals);

      // **note - that rows[0] will actually be an OBJECT containing {id: <some number>} ** !
      res.locals.id = newEvent.rows[0];
    }
    return next();
  } catch (error) {
    return next({
      log: 'eventController.createEvent error',
      message: { err: error.message },
    });
  }
};

// update an event in the database
eventController.updateEvent = async (req, res, next) => {
  const {
    name, description, date, locName, address, userID, eventID,
  } = req.body;
  const { lat, lng } = req.body.location;
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
