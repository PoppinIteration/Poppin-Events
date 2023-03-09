const tmEventController = {};

// get all events in a specific city
tmEventController.getEvents = (req, res, next) => {
  console.log('inTMEVENTCONTROLLER')
  const { city, state } = res.locals;
  const { TICKETMASTER_API_KEY } = process.env;
  // console.log('city: ', city);
  // console.log('state: ', state);
  // console.log('tm API key: ', TICKETMASTER_API_KEY);

  fetch(`https://app.ticketmaster.com/discovery/v2/events.json?city=${city}&state=${state}&size=25&apikey=${TICKETMASTER_API_KEY}`)
    .then((response) => response.json())
    .then((data) => {
      const myEvents = data._embedded.events;
      // console.log('myEvents from ticketmaster: ', myEvents);
      const extracted = [];

      // only pull the first 10 events
      for (let i = 0; i < 25; i += 1) {
        // console.log('i value', i);
        // console.log('eventID: ', myEvents[i].id);
        // console.log('event name: ', myEvents[i].name);
        // console.log('event start date: ', myEvents[i].dates.start.dateTime);
        // console.log('locname: ', myEvents[i]._embedded.venues[0].name);
        // console.log('address: ', `${myEvents[i]._embedded.venues[0].address.line1}, ${myEvents[i]._embedded.venues[0].city.name}, ${myEvents[i]._embedded.venues[0].state.stateCode}, ${myEvents[i]._embedded.venues[0].postalCode}`);
        // console.log('lat: ', myEvents[i]._embedded.venues[0].location.latitude);
        // console.log('lng: ', myEvents[i]._embedded.venues[0].location.longitude);
        // console.log('url: ', myEvents[i].url);

        // each event details
        const details = {
          name: myEvents[i].name,
          address: `${myEvents[i]._embedded.venues[0].address.line1}, ${myEvents[i]._embedded.venues[0].city.name}, ${myEvents[i]._embedded.venues[0].state.stateCode} ${myEvents[i]._embedded.venues[0].postalCode}`,
          date: myEvents[i].dates.start.dateTime,
          description: '',
          id: null,
          location: [
            {
              lat: myEvents[i]._embedded.venues[0].location.latitude,
              lng: myEvents[i]._embedded.venues[0].location.longitude,
            }
          ],
          locName: myEvents[i]._embedded.venues[0].name,
          end_date: null,
          image_url: myEvents[i].images[0].url,
          ticketmaster_evt_id: myEvents[i].id,
          rsvp_url: myEvents[i].url,
          evt_origin_type_id: 2,
          organizer: {
            id: 1,
            name: 'Ticketmaster',
            email: 'customer_support@ticketmaster.com',
            picure: 'https://play-lh.googleusercontent.com/KmWVboPY-BCCfiflJ-AYCPGBv86QLMsXsSpvQksC0DVR8ENV0lh-lwHnXrekpHwbQA=w240-h480-rw',
          },
        };
        extracted.push(details);
      }
      // console.log('extracted events object: ', extracted);
      res.locals.events = extracted;
      return next();
    })
    .catch((error) => next({
      log: 'tmEventController.getEvents error: Error getting events from ticketmaster.',
      status: 404,
      message: { err: error },
    }));
};

module.exports = tmEventController;
