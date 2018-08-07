import axios from 'axios';
import serializeForm from './serializeForm';

let currentCard = null;


let setCardState = ({text, type, card, cardStyle = ''}) => {
  
  let span = card.querySelector('.status');
  if (span) span.remove();

  span = document.createElement('span');
  span.className = `status ${type}`;
  span.textContent = text;

  card.className = `complaint ${cardStyle}`;
  card.append(span);
  return span;
}

let errorHandler = (err, card) => {
  let state = {
    text: `${err.response.data.message || err.response.statusText}. Reload page`,
    type: 'bad',
    cardStyle: 'deleted',
    card
  };
  setCardState(state);
}



let deleteButtonsHandler = (card, target, dataset) => {
  setCardState({ text: 'Deleting..', type: 'process', card, cardStyle: 'loading' });
    
  axios
  .post(target.href)
  .then(res => {
    let state = { text: res.data.message, type: 'done', card };
    let span = setCardState(state);
    // If this is delete [store || review] button
    // we will delete 'update and delete' buttons
    // because they no need more
    if (dataset.type === 'item-info') {
      setTimeout(() => {span.remove()}, 2000);
      let controls = card.querySelectorAll('[data-type], [data-action="update"]');
      for (let item of controls) item.remove();
      card.querySelector('.item').classList.add('deleted');
    } else {
      state.cardStyle = 'deleted';
      setCardState(state);
    }
  })
  .catch((err) => errorHandler(err, card));
}

let updateButtonHandler = (card, target) => {
  let form = card.querySelector('form');
  let formData = serializeForm(form);
  setCardState({ text: 'Updating..', type: 'process', card, cardStyle: 'loading' });
  axios
    .post(target.href, formData)
    .then(
      (res) => {
        let span = setCardState({ text: res.data.message, type: 'done', card});
        setTimeout(() => {span.remove()}, 2000);
      }
    )
    .catch((err) => errorHandler(err, card));
}



let complaintsHandler = function(e) {
  let target = e.target.closest('.control');
  if (!target) return;

  e.preventDefault();
  let card = target.closest('.complaint');
  if (currentCard == card) return;

  let dataset = target.dataset;
  // If this is delete button
  if (dataset.action === 'delete')
    return deleteButtonsHandler(card, target, dataset);

  // If this is update button
  updateButtonHandler(card, target);
}

export { complaintsHandler };