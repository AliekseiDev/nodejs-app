import { $ } from './bling';
import { openModal } from './modal';

let getFormHandler = (href) => {
  return function(e) {
    this.action = href;
  }

}

function complain(e) {
  e.preventDefault();
  openModal('#complain', getFormHandler(this.href));
}

export default complain;