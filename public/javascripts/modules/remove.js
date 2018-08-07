import axios from 'axios';
import { $ } from './bling';
import { openModal, closeModal } from './modal';

let getFormHandler = (href, card) => {
  return function(e) {   
    e.preventDefault();

    card.classList.add('deleted'); 
    this.action = href;

    axios
      .post(this.action)
      .then(res => {
        if (res.status !== 200) {
          throw new Error();
        }
        closeModal();
      })
      .catch(e => {
        closeModal();
        let err = `<p class="error">Something went wrong. Refresh and try again</p>`;
        card.style.opacity = '.7';
        card.insertAdjacentHTML('beforeend', err);
      });
  }

}

function ajaxRemoveReview(e) {
  e.preventDefault();
  let card = this.closest('.prnt-modal');
  openModal(this.dataset.modalForm, getFormHandler(this.href, card));
}

export default ajaxRemoveReview;