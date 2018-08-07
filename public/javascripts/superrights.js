import '../sass/style.superrights.scss';

import { $, $$ } from './modules/bling';

import { complaintsHandler } from './modules/complaintsHandler';


$('.complaints').on('click', complaintsHandler);