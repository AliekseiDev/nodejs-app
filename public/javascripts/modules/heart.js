import axios from 'axios';
import { $ } from './bling';

let isWaiting = false;
function ajaxHeart(e) {
  e.preventDefault();
  if (isWaiting) return;

  isWaiting = true;
  axios
    .post(this.action)
    .then(res => {
      isWaiting = false;
      let isHearted = this.heart.classList.toggle('action--form__button--hearted');
      if (isHearted) {
        this.heart.classList.add('action--form__button--float');
        setTimeout(() => {
          this.heart.classList.remove('action--form__button--float');
        }, 1500)
      }
      $('.heart-count').textContent = res.data.length;
    })
    .catch(err => console.error(err));
}

export default ajaxHeart;