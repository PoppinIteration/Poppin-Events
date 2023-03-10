import "../stylesheets/App.css";
import React, { useState, useEffect, useContext } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
/* https://www.npmjs.com/package/@react-google-maps/api */

import axios from "axios";
import MarkerCreator from "./MarkerCreator";
import MarkerUpdator from "./MarkerUpdator";
import { UserContext } from "./UserContext";
import RsvpDisplay from "./RsvpDisplay";

function Map() {
  // state for map center positioning
  const [mapPos, setMapPos] = useState({
    lat: 0.37766641e2,
    lng: -0.123098308e3,
  });

  // state for the data for marker from the database
  const [markerData, setMarkerData] = useState([]);
  const [ticketMasterData, setTicketMasterData] = useState([]);
  const [rsvp, setRSVP] = useState(0);

  // state to display the event data to the page after clicking a marker
  const [eventData, setEventData] = useState(null);

  // get the userID from the context
  // userID is used to determine if the user is the creator of the event
  const { user } = useContext(UserContext);
  const [updating, setUpdating] = useState(false);
  // in-the-works refactor to clarify userID vs eventID from .id
  const userID = user === null ? null : user.id;

  // Load the script for google maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    // we don't think this is actually used, but removing it breaks EVERYTHING?!
    libraries: ["places"],
  });

  // get all marker data from database on mount
  useEffect(() => {
    try {
      const getEvents = async () => {
        const response = await axios.get("/api/events");
        const { data } = response;
        // console.log(data);
        setMarkerData(data);
      };

      const getTicketMasterEvents = async () => {
        // const posi = {};
        // navigator.geolocation.getCurrentPosition((position) => {
        //   posi.lat = position.coords.latitude;
        //   posi.lng = position.coords.longitude;
        // })

        // console.log('This posi is: ', Object.keys(posi));
        // console.log('This is lat: ', posi.lat);
        // console.log('This is lng: ', posi.lng);
        const response = await axios.get('/api/ticketmaster/34.0522/-118.2437');

        // const response = await axios.get(`/api/ticketmaster/${posi.lat}/${posi.lng}`);
        const { data } = response;
        console.log(data);
        // console.log("getTicketMasterEvents: ", Object.values(data));
        setTicketMasterData(Object.values(data));
      };
      getEvents();
      getTicketMasterEvents();
      // get current user location and set the center of the map to that location
      if (navigator.geolocation) {
        // native browser geolocation functionality
        navigator.geolocation.getCurrentPosition((position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          // change map center positioning state
          setMapPos(pos);
        });
      }
    } catch (e) {
      console.log("error in getEvents: ", e.message);
    }
  }, []);

  // change google map position to current user location on button click
  const currPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // change map center positioning state
        setMapPos(pos);
      });
    }
  };

  // handle click on update button
  const editUsersEvent = () => {
    setUpdating(true);
  };

  // handle click on delete button
  const deleteUsersEvent = async (eID, uID) => {
    // create the object for the db query on backend
    const deleteReq = {
      eventID: eID,
      userID: uID,
    };
    // send object to the server to delete the event
    const response = await axios.delete("/api/events/", {
      // yeah, not restful, oh well sowee >.<
      data: { deleteReq },
    });
    // filter the removed event from the marker data array
    setMarkerData((prevMarkerData) =>
      prevMarkerData.filter((event) => event.id !== eID)
    );
    setEventData(null);
  };

  const sendRSVP = async (e) => {
    const rsvpVal = e.target.value;
    console.log(eventData);

    const response = await axios.post(`/api/rsvp/${rsvpVal}`, eventData);
    console.log(response);
  };

  // ensures that a div exists for the map even when the map API key is not loaded successfully. DO NOT DELETE
  if (!isLoaded) return <div>Loading... 🥺</div>;
  // <GoogleMap><GoogleMap /> component imported from @react-google-maps/api used to render google maps
  // https://react-google-maps-api-docs.netlify.app/#googlemap

  // yes ... we know that this could be refactored into multiple components but .... time
  return (
    <div className="map-section">
      <GoogleMap
        zoom={14}
        center={mapPos}
        mapContainerClassName="map-container box-shadow-1"
      >
        <button
          className="current-location-button"
          onClick={() => currPosition()}
        >
          Search Near Me
        </button>
        {/* If markerData is changed, places corresponding Markers in the map */}
        {/* <MarkerF/> component imported from @react-google-maps/api renders markers on the map */}
        {markerData.length > 0 &&
          markerData.map((event) => (
            // console.log('User created Events: ', event);

            <MarkerF
              key={event.id}
              title={event.name}
              // position={event.location[0]}
              position={{
                lat: parseFloat(event.location.lat),
                lng: parseFloat(event.location.lng),
              }}
              onClick={() => setEventData(event)}
            />
          ))}
        {ticketMasterData.length > 0 &&
          ticketMasterData.map((event, index) => (
            // console.log({
            //   lat: event.lat,
            //   lng: event.lng,
            // });
            // console.log('ticketMaster Events: ', event);
            // Lines 170 & 171: Have to parseFloat() to avoid type coercion
            <MarkerF
              key={event.ticketmaster_evt_id}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
              title={event.name}
              position={{
                lat: parseFloat(event.location.lat),
                lng: parseFloat(event.location.lng),
              }}
              onClick={() => setEventData(event)}
            />
          ))}
      </GoogleMap>
      {/* If a Marker is being added, call MarkerCreator and if updated, call MarkerUpdator */}
      <div className="whole-right-section">
        <div className="right-section">
          {!updating && <MarkerCreator setMarkerData={setMarkerData} />}
          {updating && (
            <MarkerUpdator
              eventData={eventData}
              setEventData={setEventData}
              setUpdating={setUpdating}
              setMarkerData={setMarkerData}
            />
          )}
          <RsvpDisplay />
        </div>

        {/* If eventData and user are not null, display the event data */}
        {/* TODO: Ensure this will work for both ticketmaster and user created events once backends changes have been merged into dev  */}
        {eventData && user && (
          <div className="info-container box-shadow-1">
            <h2 className="event-title">{eventData.name}</h2>
            <p className="event-description"> {eventData.description}</p>
            <ul className="info-list">
              <li className="info-list-item">
                Organizer: {eventData.organizer.username}
              </li>
              <li className="info-list-item">Location: {eventData.address}</li>
              <li className="info-list-item">
                Date: {new Date(eventData.date).toLocaleString()}
              </li>
              {/* <li className="info-list-item">RSVP: {eventData.organizer.email}</li> */}
              <li>
                {" "}
                RSVP:
                <div className="rsvp-button-div">
                  <button className="rsvp-button" onClick={sendRSVP} value={1}>
                    Not Going
                  </button>
                  <button className="rsvp-button" onClick={sendRSVP} value={2}>
                    Maybe Going
                  </button>
                  <button className="rsvp-button" onClick={sendRSVP} value={3}>
                    Likely Going
                  </button>
                  <button className="rsvp-button" onClick={sendRSVP} value={4}>
                    {" "}
                    Definitely Going
                  </button>
                </div>
              </li>
            </ul>
            {/* If the user is the creator of the event, display the edit and delete buttons */}
            {eventData.organizer.email === user.email && (
              <div className="event-buttons-container">
                <button
                  className="edit-button "
                  type="button"
                  onClick={editUsersEvent}
                >
                  {" "}
                  Edit{" "}
                </button>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteUsersEvent(eventData.id, user.id)}
                >
                  {" "}
                  Delete{" "}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;
