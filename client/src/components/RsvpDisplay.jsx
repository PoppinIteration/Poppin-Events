import React, { useState, useEffect, useContext } from "react";
import axios from "axios";

import "../stylesheets/App.css";
import { UserContext } from "./UserContext";

// import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
// /* https://www.npmjs.com/package/@react-google-maps/api */
// import MarkerCreator from "./MarkerCreator";
// import MarkerUpdator from "./MarkerUpdator";

function RsvpDisplay() {
  const { user } = useContext(UserContext);
  const [rsvp, setRSVP] = useState([]);

  useEffect(() => {
    const { id } = user;
    axios.get(`/api/rsvp?userID=${id}`).then((res) => {
      setRSVP(res.data);
      // console.log("rsvp is currently: ", rsvp);
    });

    console.log(rsvp);

    // const generateRSVPEvents = async () => {
    //   const response = await axios.get(`/api/rsvp?userID=${id}`);
    //   console.log(response);
    //   // setRSVP(response);
    // };
    // generateRSVPEvents();
  }, []);
  console.log("rsvp is currently: ", rsvp);
  const events = [];
  rsvp.forEach((event) => {
    events.push(
      <li>
        {event.event.name} {event.rsvp}
      </li>
    );
  });

  return (
    <div className="create-event-container box-shadow-1">
      <h4>Your RSVP'd Events</h4>
      <ul className="info-list">{events}</ul>
    </div>
  );
}

export default RsvpDisplay;
