export default function autocomplete(input, lngInp, latInp) {
  if (!input) return;

  let dropdown = new google.maps.places.Autocomplete(input);
  dropdown.addListener('place_changed', (e) => {
    const place = dropdown.getPlace();

    lngInp.value = place.geometry.location.lng();
    latInp.value = place.geometry.location.lat();
  });

  input.on('keydown', (e) => {
    if (e.keyCode === 13) e.preventDefault();
  })
}