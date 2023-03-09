class EventModel {
  constructor(
    name,
    address,
    date,
    description,
    id,
    lat,
    lng,
    locName,
    end_date,
    image_url,
    ticketmaster_evt_id,
    rsvp_url,
    evt_origin_type_id,
    organizer_id,
    organizer_name,
    organizer_email,
    organizer_picture) {
    this.name = name;
    this.address = address;
    this.date = date;
    this.description = description;
    this.id = id;
    this.location = {
      'lat': lat,
      'lng': lng
    };
    this.locName = locName;
    this.end_date = end_date;
    this.image_url = image_url;
    this.ticketmaster_evt_id = ticketmaster_evt_id;
    this.rsvp_url = rsvp_url;
    this.evt_origin_type_id = evt_origin_type_id;
    this.organizer = {
      'id': organizer_id,
      'name': organizer_name,
      'email': organizer_email,
      'picture': organizer_picture
    };
  }
}

module.exports = EventModel;