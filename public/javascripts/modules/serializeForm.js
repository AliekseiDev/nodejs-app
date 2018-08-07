function serializeForm(form) {
  let formData = {};
  let items = form.querySelectorAll('[name]');
  for (let item of items) formData[item.name] = item.value;
  return formData;
}

export default serializeForm;