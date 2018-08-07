import '../sass/style.scss';

// import "babel-polyfill";
import { $, $$ } from './modules/bling';

import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';
import ajaxRemove from './modules/remove';
import complain from './modules/complain';


autocomplete( $('input#address'), $('input#lng'), $('input#lat') );
typeAhead( $('.search') );
makeMap( $('#map') );

let heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);

let removeLinks = $$('.remove_store, .review__remove');
removeLinks.on('click', ajaxRemove);

let complainLinks = $$('.complain a');
complainLinks.on('click', complain);