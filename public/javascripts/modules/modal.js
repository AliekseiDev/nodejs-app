import { $ } from './bling';

let getDocHeight = () => Math.max(
  document.body.scrollHeight, document.documentElement.scrollHeight,
  document.body.offsetHeight, document.documentElement.offsetHeight,
  document.body.clientHeight, document.documentElement.clientHeight
);

let getScrollBarSize = () => {
  let div = document.createElement('div');

  div.style.overflowY = 'scroll';
  div.style.width = '50px';
  div.style.height = '50px';
  div.style.visibility = 'hidden';

  document.body.appendChild(div);
  let scrollWidth = div.offsetWidth - div.clientWidth;
  document.body.removeChild(div);
  return scrollWidth;
}

let modal = $('.modal');

let closeModal = () => {
  document.body.style.overflow = 'auto';
  modal.classList.remove('opened');
}

modal.addEventListener('click', (e) => {
  let target = e.target;
  if (!target.closest('.close')) return;
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  closeModal();
});

let openModal = function(selector, handler) {
  let form = document.querySelector(selector);
  if (!form) return console.log('Form doesn\'t exist');
  form = form.cloneNode(true);
  if (handler) form.onsubmit = handler;

  document.body.style.overflow = 'hidden';
  if (getDocHeight() > document.documentElement.clientHeight) {
    document.body.style.paddingRight = `${getScrollBarSize()}px`;      
  }

  let modalContent = modal.querySelector('.modal_content');
  modalContent.innerHTML = '';
  modalContent.append(form);
  document.body.style.overflow = 'hidden';
  modal.classList.add('opened');
}


export { openModal, closeModal };