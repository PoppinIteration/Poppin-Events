# Poppin-Events
An app that allows users to view events in their area, create new events, and edit/delete their own events from the map

# To future archaeologists: 
We used Vite! Enjoy (here is the starter video for structure: https://www.youtube.com/watch?v=PPjpHaLkV7A)

Note: You'll have to npm i for the root directory, the client, and the server separately

Run 'npm start' in root directory to concurrently run server(5000) and client(3000)

Npm install your frontend dependencies in client folder, backend dependencies in server folder

If your server is running on 3001, it won't work, so shut it down and killall node before starting again

Some important considerations - things you'll have to create and set up for yourself:

1 - GoogleAPI key for OAuth and Maps (make a .env file in the client directory with key value pairs that correspond with constants that are imported like import.meta.env.VITE_GOOGLE_OATH_CLIENT_ID or import.meta.env.VITE_GOOGLE_OATH_CLIENT_ID)

    - You will need to sign up via Google Cloud Platform to create your own application to get your own Client ID and Secret for Oauth, and same thing for Google Maps
    
2 - SQL server URI (make a .env file in the server directory with PG_URI='<your SQL db uri>')

SQL server Schema: 
    ![pg_schema](/docs/schema.png)

Must swap in your own via .envs:

    The following will be accessed using "process.env.<env Variable Name>":
    server/.env => add in a PG_URI
        - Links to a SQL database
    server/.env => add in TICKETMASTER_API_KEY 
        - Links to the Ticketmaster api
    server/.env => add in VITE_GOOGLE_MAPS_API_KEY
        - Links to the Google geocoding api for reverse geocoding

    The following will be imported using "import.meta.env.<env Variable Name>":
    client/.env => swap out VITE_GOOGLE_MAPS_API_KEY
        - Links to Google Maps api
    client/.env => swap out VITE_GOOGLE_OATH_CLIENT_ID
        - Links to Google oAuth 2.0 Login

Event data has now been standardized to be sent and received from both frontend and backend in the following format: 
![event_data_format](/docs/eventDataFormat.png)

Unimplemented features with frameworks:

1 - display pictures next to the organizer's name in the event display: Currently, we get, store, and update user picture urls, but they are unused

Possible Refactors:

1 - Possibly display event boxes on map if you want, instead of to the side

2 - Refactor use of .id for both events and users to be userID / eventID on the front-end

Bugs to squash:

1 - Newly created events don't have their time populate correctly on edit without a full page reload - likely, the date isn't being saved in state in a way the datetime-local input wants to receive
