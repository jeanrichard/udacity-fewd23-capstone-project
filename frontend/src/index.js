// @ts-check
'use strict';

import * as luxon from 'luxon';

import { handleAbout } from './js/about/handler-about';
import { handleSubmit } from './js/search-form/search-form';
import { handleTripClickEvent, displayTrips } from './js/trips/trips';
import { getTrips, replaceTrips } from './js/store/trip-store';

import * as formUtils from './js/search-form/search-form-utils';
import * as typedefs from './js/types/typedefs';

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

import { readTrips } from './js/utilities/api-utils';

// Service Worker.
if ('serviceWorker' in navigator) {
  // See https://webpack.js.org/guides/progressive-web-application/#registering-our-service-worker.
  console.log('Registering service worker...');
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

document.addEventListener('DOMContentLoaded', async (_) => {
  // We register the 'Click' event handler for event delegation.
  const tripsSection = document.getElementById('trips');
  // @ts-ignore: 'tripsSection' is possibly 'null'.
  tripsSection.addEventListener('click', (event) => handleTripClickEvent(event));

  const [ok, data] = await readTrips();
  console.log('readTrips: ok=', ok, ', data=', data);
  if (!ok) {
    // Generic error message.
    const errMsg = `Failed to read trips. Try to reload the page later.`;
    // @ts-ignore: Property 'message' does not exist on type 'DestinationResult'.
    formUtils.showErrorSubmit(data.message);
  } else {
    /** @type { Array<typedefs.Trip> } */
    // @ts-ignore: Type 'ApiError | Trip[]' is not assignable ...
    const newTrips = data;
    replaceTrips(newTrips);
    // Refresh the UI.
    displayTrips(getTrips(), luxon.DateTime.now());
  }
});

export { handleAbout, handleSubmit };
