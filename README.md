# Poppin-Events
Poppin-Events is an application that allows users to view events in their area (user created or Ticketmaster’s public events), RSVP to events, create new events, edit or delete user's own events, and view RSVP’d events of other users within the network.

## Prerequisites
This guide assumes you have done the following:
* Install Node 18.
* Install PostgreSQL.
  * Add PostgreSQL server URI to a .env file in the server directory.
```sh
PG_URI=<your_SQL_db_uri>
```
* Setup Google API keys for OAuth 2.0 and Maps (reverse geocoding).
  * Sign up with Google Cloud Platform to create your own application to obtain the client ID and secret for OAuth and API key for Maps.
  * Add client ID, secret and key in a .env file in the client directory.
   * Add the Maps API key to a .env file in the server directory.
```sh 
VITE_GOOGLE_OATH_CLIENT_ID
VITE_GOOGLE_OATH_CLIENT_SECRET
VITE_GOOGLE_MAPS_API_KEY
```
  

* Setup Ticketmaster API key.
  * Add the Ticketmaster API key into the .env file in the server directory.
```sh
TICKETMASTER_API_KEY
```

#### .env File Setup

The recommended `.env` client and server files setup is below. 

**server/.env**

The listed variables will be accessed using `process.env.<env_Variable_Name>`:
```sh
PG_URI=<your_pg_uri>
VITE_GOOGLE_MAPS_API_KEY=<your_google_maps_key>
TICKETMASTER_API_KEY=<your_ticketmaster_key>
```

**client/.env**

The following will be accessed using `import.meta.env.<env_Variable_Name>`:
```sh
VITE_GOOGLE_OATH_CLIENT_ID=<your_google_oath_id>
VITE_GOOGLE_OATH_CLIENT_SECRET=<your_google_oath_secret>
VITE_GOOGLE_MAPS_API_KEY=<your_google_maps_key>
```

## Installation
Build the application in the root directory. The client and server need to also be built separately. 

1. Install root directory dependencies.
```sh
npm install
```
Build the client.

2. From the root of the repository, change to `client` directory.
```sh
cd client
```

3. Install client dependencies.
```sh
npm install
```

Build the server.

4. From the root of the repository, change to `server` directory.
```sh
cd server
```

5. Install server dependencies.
```sh
npm install
```

Deploy the application.

6. Run application in the root directory to concurrently run the the client (3000). 

  *Note*: If your server is running on 3001, it will not run. Shut down port 3001 and `killall node` before starting again.
```sh
npm start
```

## Data & System Design

**Database Schema**: 

![pg_schema](/docs/schema.png)

**Standardized Event Data Format (frontend & backend)**:

![event_data_format](/docs/eventDataFormat.png)

**Production Design Document**:

![production_design](/link_to_be_added)
