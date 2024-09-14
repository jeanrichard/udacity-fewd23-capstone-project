// @ts-check
'use strict';

import { handleAbout } from './js/handler-about';
import { handleSubmit } from './js/handler-form';
import { displayTrips } from './js/handler-form';
import { getTrips, loadTrips } from './js/utils-trip';
import * as formUtils from './js/handler-form-utils';

import * as luxon from 'luxon';

// Webpack magic.

import './assets/icons/logo.png';
import './styles/resets.scss';
import './styles/settings.scss';
import './styles/base.scss';
import './styles/header.scss';
import './styles/content.scss';
import './styles/form.scss';
import './styles/footer.scss';
import './styles/trip.scss';

import { readTrips } from './js/utils-api';

// FIXME Disable Service Worker for the moment.
// if ('serviceWorker' in navigator) {
//   // See https://webpack.js.org/guides/progressive-web-application/#registering-our-service-worker.
//   console.log('Registering service worker...');
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }

document.addEventListener('DOMContentLoaded', async (_) => {
  const [ok, data] = await readTrips();
  console.log('readTrips: ok=', ok, ', data=', data);
  let refreshUi = true;
  if (!ok) {
    // Generic error message.
    const errMsg = `Failed to read trips. Try to reload the page later.`;
    // @ts-ignore: Property 'message' does not exist on type 'DestinationResult'.
    formUtils.showErrorSubmit(data.message);
    refreshUi = false;
  } else {
    loadTrips(data);
    // We clear any error message.
    formUtils.clearErrorSubmit();
  }
  console.log('readTrips: refreshUi', refreshUi);
  if (refreshUi) {
    displayTrips(getTrips(), luxon.DateTime.now());
  }
});

export { handleAbout, handleSubmit };
