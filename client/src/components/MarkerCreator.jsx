import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import { useJsApiLoader } from "@react-google-maps/api";
import Autocomplete from "react-google-autocomplete";
import { UserContext } from "./UserContext";

const libraries = ["places"];
export default function MarkerCreator(props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const { user } = useContext(UserContext);
  // state for controlled inputs
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [locName, setLocName] = useState("");
  // const [endDate,]
  let autocomplete = null;

  // submit handler
  const eventSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("in MARKER CREATOR user is: ", user.id);
      const { id, email, picture, name: username } = user;
      // new event object for database
      // const event = {
      //   name,
      //   address,
      //   locName,
      //   date,
      //   description,
      //   userID: id,
      // };


      // Modified event object: testing
      const event = {
        name,
        address,
        id: null,
        date,
        description,
        locName,
        endDate: null,  // TODO: Figure out how we'll fill out this portion
        image_url: null, // TODO: Ticket master, Figure out how we'll fill out this portion later
        organizer: {
          id,
          username,
          email,
          picture
        },
        ticketmaster_evt_id: null,
        rsvp_url: null,
        evt_origin_type_id: 1, // user created = 1, ticketmaster = 2
        // location is added below on line 72 - 74 after we've received data from google's geocode api
      };

      // encode the address
      const encoded = address.replaceAll(" ", "+");
      // geocode the address (https://developers.google.com/maps/documentation/geocoding/requests-geocoding)
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }`;
      const response = await axios.get(url);
      const data = response.data.results[0];
      event.location = {
          lat: data.geometry.location.lat,
          lng: data.geometry.location.lng,
      }
      // send the post request to the server
      const eventID = await axios.post("/api/events", event);
      // add other pairs to the event object for the front-end to read
      event.id = eventID.data.id;
      // add the new event into state (from parent component) to rerender the map + markers
      props.setMarkerData((prevMarkerData) => [...prevMarkerData, event]);
    } catch (err) {
      console.log("error in post: ", err.message);
    }
  };

  // autocomplete onLoad
  function onLoad(ac) {
    console.log("here in ONLOAD, ac is: ", ac);
    autocomplete = ac;
  }

  // autocomplete change handler
  function handleChange() {
    console.log("autocomplete is currently: ", autocomplete);
    if (autocomplete !== null) {
      console.log("autocomplete place is: ", autocomplete.getPlace());
    }
  }

  // <Autocomplete /> component imported from @react-google-maps/api to have autocomplete address
  return (
    <div className="create-event-container box-shadow-1">
      <h4>Create an Event</h4>
      <form id="add-event" className="create-form" onSubmit={eventSubmit}>
        <label className="screen-reader-text" htmlFor="event-name">
          Name your event:
        </label>
        <input
          placeholder="Name"
          id="event-name"
          type="text"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
        />
        <label className="screen-reader-text" htmlFor="event-description">
          Describe your event:
        </label>
        <input
          placeholder="Description"
          id="event-description"
          type="text"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          required
        />
        <label className="screen-reader-text" htmlFor="event-location">
          Event Location:
        </label>
        <input
          placeholder="Location"
          id="event-location"
          type="text"
          onChange={(e) => setLocName(e.target.value)}
          value={locName}
          required
        />
        <label className="screen-reader-text" htmlFor="event-address">
          Event Address:
        </label>
        <Autocomplete
          placeholder="Enter address"
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          options={{ types: [] }} // empty array means select all types
          onPlaceSelected={(place) => {
            console.log("PLACE in autocomplete IS: ", place);
            setAddress(place.formatted_address);
          }}
        />
        <label className="screen-reader-text" htmlFor="event-date">
          Date:
        </label>
        <input
          placeholder="Date and time"
          id="event-date"
          type="datetime-local"
          onChange={(e) => setDate(e.target.value)}
          value={date}
          required
        />
        {/* <label className="screen-reader-text" htmlFor="event-date">
          End Date:
        </label> */}
        {/* 
        <input
          placeholder="Date and time"
          id="event-end-date"
          type="datetime-local"
          onChange={(e) => setEndDate(e.target.value)}
          value={date}
        /> */}
        <button className="button-primary">Submit</button>
      </form>
    </div>
  );
}
