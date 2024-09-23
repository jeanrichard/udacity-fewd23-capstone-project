// @ts-check
'use strict';

// 3rd party.
import * as luxon from 'luxon';

// Project.
import { getTrips } from '../store/trip-store';
import * as apiUtils from '../utilities/api-utils';
import * as tripsUtils from './trips-utils';
import * as typedefs from '../types/typedefs';

/**
 * Adds a trip to the trip collection and updates the UI based on the new trip collection.
 *
 * @param {Map<string, typedefs.Trip>} trips - The trip collection.
 * @param {luxon.DateTime} now - The current date & time.
 * @param {luxon.DateTime} dateDeparting - The date departing.
 * @param {luxon.DateTime} dateReturning - The date returning.
 * @param {typedefs.Destination} destData - The destination data.
 * @param {typedefs.Weather} weatherData - The weather data.
 * @param {typedefs.Picture} pictureData - The picture data.
 */
export function addTrip(
  trips,
  now,
  dateDeparting,
  dateReturning,
  destData,
  weatherData,
  pictureData,
) {
  // We generate a temporary trip ID, prefixed with '!'.
  const tripId = `!${self.crypto.randomUUID()}`;

  // We buld the trip object.
  const tripObj = {
    tripId: tripId,
    destination: destData,
    dateDeparting: dateDeparting.toMillis(),
    dateReturning: dateReturning.toMillis(),
    weather: weatherData,
    picture: pictureData,
    isSaved: false,
  };

  // We add it to the trip collection.
  trips.set(tripId, tripObj);

  // We refresh the UI.
  displayTrips(trips, now);
}

/**
 * Updates a trip category (ongoing/pending/past) in the UI.
 *
 * @param {HTMLElement} parent - The element for that category.
 * @param {Array<typedefs.Trip>} trips - The trips in that category.
 * @param {luxon.DateTime} now - The current date & time.
 */
function updateTripCategory(parent, trips, now) {
  const frag = new DocumentFragment();
  if (trips.length > 0) {
    for (const trip of trips) {
      const tripElt = tripsUtils._renderTrip(trip, now);
      if (!trip.isSaved) {
        // FIXME Add ignore
        tripsUtils.enableSaveButton(tripElt);
        tripsUtils.showInfo(tripElt, 'Your trip is not saved, yet.');
      } else {
        tripsUtils.disableSaveButton(tripElt);
      }
      frag.append(tripElt);
    }
  } else {
    const p = document.createElement('p');
    p.innerHTML = '(None)';
    frag.append(p);
  }
  parent.replaceChildren(frag);
}

/**
 * Updates the UI based on a given trip collection.
 *
 * @param {Map<string, typedefs.Trip>} trips - The trip collection.
 * @param {luxon.DateTime} now - The current date & time.
 */
export function displayTrips(trips, now) {
  const [ongoing, pending, past] = tripsUtils.splitTrips(trips, now);

  // Ongoing.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  const parentOngoing = document.querySelector('#trips-ongoing .trip-container');
  updateTripCategory(parentOngoing, ongoing, now);

  // Ongoing.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  const parentPending = document.querySelector('#trips-pending .trip-container');
  updateTripCategory(parentPending, pending, now);

  // Ongoing.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  const parentPast = document.querySelector('#trips-past .trip-container');
  updateTripCategory(parentPast, past, now);
}

/*------------------------------------------------------------------------------------------------
 * Handling events
 *------------------------------------------------------------------------------------------------*/

/**
 * Saves a trip to the backend.
 *
 * @param {HTMLElement} tripElt - The trip HTML element.
 */
async function saveTrip(tripElt) {
  console.log('::: Save button clicked :::');

  /** @type { string } */
  // @ts-ignore: Type 'string | null' is not assignable ... .
  const tripId = tripElt.getAttribute('data-trip-id');

  const tripObj = getTrips().get(tripId);
  if (tripObj === undefined) {
    // Should never happen.
    return;
  }
  const [ok, data] = await apiUtils.createTrip(tripObj);
  console.debug('saveTrip: ok=', ok, ', data=', data);
  if (!ok) {
    // @ts-igore: Property 'message' does not exist on type 'DestinationResult'.
    tripsUtils.showError(tripElt, data.message);
    return;
  } else {
    // We replace the temporary trip ID by the final one.
    tripObj.tripId = data.tripId;
    // We update the status.
    tripObj.isSaved = true;
    // We refresh the UI.
    displayTrips(getTrips(), luxon.DateTime.now());
  }
}

/**
 * Deletes a trip from the backend.
 *
 * @param {HTMLElement} tripElt - The trip HTML element.
 */
async function deleteTrip(tripElt) {
  console.log('::: Delete button clicked :::');

  /** @type { string } */
  // @ts-ignore: Type 'string | null' is not assignable ... .
  const tripId = tripElt.getAttribute('data-trip-id');

  // Retrieve the model.
  /** @type { typedefs.Trip } */
  // @ts-ignore: ... is possibly 'undefined'.
  const tripObj = getTrips().get(tripId);
  let refreshUi = true;
  if (!tripObj.isSaved) {
    // Update the frontend the model.
    getTrips().delete(tripId);
  } else {
    // Pessimistic update.
    const [ok, data] = await apiUtils.deleteTrip(tripId);
    console.debug('handleDelete: ok=', ok, ', data=', data);
    if (!ok) {
      // @ts-ignore: Property 'message' does not exist on type 'DestinationResult'.
      tripsUtils.showError(tripElt, data.message);
      refreshUi = false;
    } else {
      // Update the frontend model.
      getTrips().delete(tripId);
    }
  }
  if (refreshUi) {
    displayTrips(getTrips(), luxon.DateTime.now());
  }
}

/**
 * Handles trip save/delete events.
 *
 * Note: This handler is meant for event delegation.
 *
 * @param {Event} event - The click event.
 */
export async function handleTripClickEvent(event) {
  if (!(event?.target instanceof HTMLButtonElement)) {
    return;
  }

  // We implement event delegation.
  const clickedElement = event.target;

  // Handle "Save" button clicks.
  if (clickedElement.matches('.trip__btn-save')) {
    /** @type {HTMLElement} */
    // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
    const tripElement = clickedElement.closest('.trip');
    await saveTrip(tripElement);
  }

  // Handle "Delete" button clicks
  else if (clickedElement.matches('.trip__btn-delete')) {
    /** @type {HTMLElement} */
    // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
    const tripElement = clickedElement.closest('.trip');
    await deleteTrip(tripElement);
  }
}
