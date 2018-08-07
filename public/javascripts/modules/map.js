import axios from 'axios';
import { $ } from './bling';


let options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function success(pos) {
  var crd = pos.coords;

  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);
};

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};



let mapOptions = {
  center: { lat: 43.2, lng: -79.8 },
  zoom: 10
}

let loadPlaces = (map, lat = 43.2, lng = -79.8) => {
  axios.get(`/api/v1/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      let places = res.data;
      if (!places.length) {
        alert('No places found');
        return;
      }

      let bounds = new google.maps.LatLngBounds();
      let infoWindow = new google.maps.InfoWindow();

      let markers = places.map(place => {
        let [placeLng, placeLat] = place.location.coordinates;
        let position = { lat: placeLat, lng: placeLng };

        bounds.extend(position);

        let marker = new google.maps.Marker({ map, position });
        marker.place = place;

        return marker;
      });

      markers.forEach(marker => {
        marker.addListener('click', function() {
          console.log(this.place);
          infoWindow.setContent(this.place.name);
          infoWindow.open(map, this);
        })
      });

      map.fitBounds(bounds);
      map.setCenter(bounds.getCenter());
      
    });
}

let makeMap = (mapDiv) => {
  if (!mapDiv) return;

  navigator.geolocation.getCurrentPosition(success, error, options);
  let map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  let input = $('[name="geolocate"]');
  let autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    let place = autocomplete.getPlace();
    let location = place.geometry.location;
    loadPlaces(map, location.lat(), location.lng());
  });
}

export default makeMap;