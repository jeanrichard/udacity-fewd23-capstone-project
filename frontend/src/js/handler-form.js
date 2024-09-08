// @ts-check
'use strict';

// 3rd Party.
import * as luxon from 'luxon';

// Project.
import { getDestination, getWeather, getPicture, saveTrip, deleteTrip } from './utils-api';
import * as formUtils from './handler-form-utils';
import * as typedefs from './typedefs';
import * as utils from './utils';
import { getTrips, splitTrips, tripEltFromObj } from './utils-trip';

/*------------------------------------------------------------------------------------------------
 * Main part
 *------------------------------------------------------------------------------------------------*/

/**
 * Validates the inputs provided by the user and shows errors where needed.
 *
 * If one or more inputs are invalid, returns a tuple `[false, null, null]`. Otherwise, returns a
 * tuple `[true, dest, date]`.
 *
 * @param {string} destStr the query.
 * @param {string} dateDepartingStr the date (in ISO format).
 * @param {string} dateReturningStr the date (in ISO format).
 * @param {luxon.DateTime} now the current date.
 * @return {[boolean, null|string, null|luxon.DateTime, null|luxon.DateTime]} as described above.
 */
function validateInputs(destStr, dateDepartingStr, dateReturningStr, now) {
  // We validate as many input fields as possible in one pass.

  // Validate the destination.
  const [destIsValid, errOrDest] = formUtils.validateDestination(destStr);
  if (!destIsValid) {
    /** @type {string} */
    const destErrMsg = errOrDest;
    formUtils.showErrorDestination(destErrMsg);
  } else {
    formUtils.clearErrorDestination();
  }

  // Validate the date departing.
  const maxDate = now.plus({ years: formUtils.MAX_YEARS_FROM_NOW });
  const [dateDepIsValid, errOrDateDep] = formUtils.validateDate(dateDepartingStr, now, maxDate);
  console.log('dateDepIsValid', dateDepIsValid, ', errOrDateDep', errOrDateDep);
  if (!dateDepIsValid) {
    /** @type {string} */
    // @ts-ignore: Type 'string | ...' is not assignable to ... .
    const dateErrMsg = errOrDateDep;
    formUtils.showErrorDateDeparting(dateErrMsg);
  } else {
    formUtils.clearErrorDateDeparting();
  }
  /** @type {luxon.DateTime} */
  // @ts-ignore: Type 'string | ...' is not assignable to ... .
  const dateDep = errOrDateDep;

  // Validate the date returning.
  const [dateRetIsValid, errOrDateRet] = formUtils.validateDate(dateReturningStr, dateDep, maxDate);
  if (!dateRetIsValid) {
    /** @type {string} */
    // @ts-ignore: Type 'string | ...' is not assignable to ... .
    const dateErrMsg = errOrDateRet;
    formUtils.showErrorDateReturning(dateErrMsg);
  } else {
    formUtils.clearErrorDateReturning();
  }
  /** @type {luxon.DateTime} */
  // @ts-ignore: Type 'string | ...' is not assignable to ... .
  const dateRet = errOrDateRet;

  const isValid = destIsValid && dateDepIsValid && dateRetIsValid;
  if (!isValid) {
    return [isValid, null, null, null];
  } else {
    /** @type {string} */
    const dest = errOrDest;

    return [isValid, dest, dateDep, dateRet];
  }
}

/**
 * Updates the UI.
 *
 * @param {Map<string, typedefs.Trip>} trips
 * @param {luxon.DateTime} now
 * @param {luxon.DateTime} dateDeparting
 * @param {luxon.DateTime} dateReturning
 * @param {typedefs.Destination} dstData
 * @param {typedefs.Weather} wthData
 * @param {typedefs.Picture} picData
 */
function addTrip(trips, now, dateDeparting, dateReturning, dstData, wthData, picData) {
  // We buld the trip object.
  // We generate a temporary trip ID, prefixed with '!'.
  const tripId = `!${self.crypto.randomUUID()}`;
  const tripObj = {
    tripId: tripId,
    destination: dstData,
    dateDeparting: dateDeparting.toMillis(),
    dateReturning: dateReturning.toMillis(),
    weather: wthData,
    picture: picData,
    isSaved: false,
  };

  // We add it to the collection.
  trips.set(tripId, tripObj);

  displayTrips(trips, now);
}

/**
 *
 * @param {typedefs.Trip} tripObj
 * @param {luxon.DateTime} now
 */
function displayTrip(tripObj, now) {
  // We create a fragment based on the template.

  /** @type{ HTMLTemplateElement } */
  // @ts-ignore: Type 'HTMLTemplateElement | null' is not assignable ... .
  const tripTemplate = document.querySelector('#trip-template');
  /** @type {DocumentFragment} */
  // @ts-ignoreType: Type 'Node' is missing the following properties ... .
  const tripFragment = tripTemplate.content.cloneNode(/*deep=*/ true);

  // We populate the fragment.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLTemplateElement | null' is not assignable ... .
  const tripElt = tripFragment.querySelector('.trip');
  tripEltFromObj(tripElt, tripObj, now);

  // Add event handlers.
  tripElt.querySelector('.trip__btn-save')?.addEventListener('click', handleSave);
  tripElt.querySelector('.trip__btn-delete')?.addEventListener('click', handleDelete);

  return tripFragment;
}

/**
 *
 * @param {Array<typedefs.Trip>} trips
 * @param {HTMLElement} parent
 * @param {luxon.DateTime} now
 */
function updateTripCategory(trips, parent, now) {
  const frag = new DocumentFragment();
  if (trips.length > 0) {
    for (const trip of trips) {
      frag.append(displayTrip(trip, now));
    }
  } else {
    const p = document.createElement('p');
    p.innerHTML = '(None)';
    frag.append(p);
  }
  parent.replaceChildren(frag);
}

/**
 *
 * @param {Map<string, typedefs.Trip>} trips
 * @param {luxon.DateTime} now
 */
export function displayTrips(trips, now) {
  const [ongoing, pending, past] = splitTrips(trips, now);

  // Ongoing.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  const parentOngoing = document.querySelector('#trips-ongoing .trip-container');
  updateTripCategory(ongoing, parentOngoing, now);

  // Ongoing.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  const parentPending = document.querySelector('#trips-pending .trip-container');
  updateTripCategory(pending, parentPending, now);

  // Ongoing.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  const parentPast = document.querySelector('#trips-past .trip-container');
  updateTripCategory(past, parentPast, now);
}

export async function handleSave(event) {
  console.log('::: Save button clicked :::');
  if (!(event.target instanceof HTMLButtonElement)) {
    return;
  }
  const btn = event.target;
  /** @type { HTMLElement } */
  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  const tripElt = btn.closest('article.trip');
  /** @type { string } */
  // @ts-ignore: Type 'string | null' is not assignable ... .
  const tripId = tripElt.getAttribute('data-trip-id');

  const tripObj = getTrips().get(tripId);
  if (tripObj === undefined) {
    // Should never happen.
    return;
  }
  const [ok, data] = await saveTrip(tripId, tripObj);
  console.log('handleSave: ok=', ok, ', data=', data);
  if (!ok) {
    // Generic error message.
    const errMsg = `Failed to save trip. Try again later.`;
    // @ts-ignore: Property 'message' does not exist on type 'DestinationResult'.
    formUtils.showErrorDestination(data.message);
    return;
  } else {
    formUtils.clearErrorDestination();
    // We replace the temporary trip ID by the final one.
    tripObj.tripId = data.tripId;
  }
}

/**
 *
 * @param {Event} event
 */
export async function handleDelete(event) {
  console.log('::: Delete button clicked :::');
  if (!(event.target instanceof HTMLButtonElement)) {
    return;
  }
  const btn = event.target;
  /** @type { HTMLElement } */
  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  const tripElt = btn.closest('article.trip');
  /** @type { string } */
  // @ts-ignore: Type 'string | null' is not assignable ... .
  const tripId = tripElt.getAttribute('data-trip-id');

  // Retrieve the model.
  /** @type { typedefs.Trip } */
  // @ts-ignore: ... is possibly 'undefined'.
  const tripObj = getTrips().get(tripId);
  let refreshUi = true;
  if (!tripObj.isSaved) {
    // Remove the model.
    getTrips().delete(tripId);
  } else {
    // Pessimistic update.
    const [ok, data] = await deleteTrip(tripId);
    console.log('handleDelete: ok=', ok, ', data=', data);
    if (!ok) {
      // Generic error message.
      const errMsg = `Failed to delete trip. Try again later.`;
      // @ts-ignore: Property 'message' does not exist on type 'DestinationResult'.
      formUtils.showErrorDestination(data.message);
      refreshUi = false;
    } else {
      // Remove the model.
      getTrips().delete(tripId);
      // We clear any error message.
      formUtils.clearErrorDestination();
    }
  }
  if (refreshUi) {
    displayTrips(getTrips(), luxon.DateTime.now());
  }
}

/**
 * Handles the submit event:
 * 1) Validates inputs. (Displays an alert and stops if invalid.)
 * 2) Contact the backend API to (fixme). (Displays an alert and stops if error.)
 * 3) Updates the UI. Note: We disable the submit button while handling the event to prevent the
 * user from triggering multiple concurrent requests.
 *
 * @param {SubmitEvent} event the submit event.
 */
export async function handleSubmit(event) {
  console.log('::: Form submitted :::');

  // We do no want to submit the form.
  event.preventDefault();

  // This is the way to report form validation errors despite `preventDefault`.
  // /** @type{HTMLFormElement} */
  // // @ts-ignore: Object is possibly 'null'.
  // const formElt = document.getElementById('input-form')
  // formElt.reportValidity();

  // We retrieve the destination.
  /** @type {string} */
  // @ts-ignore: Object is possibly 'null'.
  const destStr = document.getElementById('destination').value;

  // We retrieve the date.
  /** @type {string} */
  // @ts-ignore: Object is possibly 'null'.
  const dateDepartingStr = document.getElementById('date-departing').value;

  // We retrieve the date.
  /** @type {string} */
  // @ts-ignore: Object is possibly 'null'.
  const dateReturningStr = document.getElementById('date-returning').value;

  try {
    // Disable submit button until response or error.
    formUtils.disableSubmit();

    // Current date (to ensure consistency through the entire submit process).
    const now = luxon.DateTime.now();
    const [isValid, destOpt, dateDepOpt, dateRetOpt] = validateInputs(
      destStr,
      dateDepartingStr,
      dateReturningStr,
      now,
    );
    if (!isValid) {
      // Abort.
      console.log('handleSubmit: inputs failed validation, aborting.');
      return;
    }

    /** @type {string} */
    // @ts-ignore: Type '... | null' is not assignable to ... .
    const dest = destOpt;
    /** @type {luxon.DateTime} */
    // @ts-ignore: Type '... | null' is not assignable to ... .
    const dateDep = dateDepOpt;
    /** @type {luxon.DateTime} */
    // @ts-ignore: Type '... | null' is not assignable to ... .
    const dateRet = dateRetOpt;

    // Compute the number of days remaining.
    const numDays = utils.getNumRemainingDays(dateDep, now);

    // Find the destination.
    const [dstOk, dstData] = await getDestination(destStr);
    console.log('handleSubmit: dstOk=', dstOk, ', dstData=', dstData);
    if (!dstOk) {
      // @ts-ignore: Property 'message' does not exist on type 'DestinationResult'.
      formUtils.showErrorDestination(dstData.message);
      return;
    } else {
      formUtils.clearErrorDestination();
    }
    // The `name` and `countryName` fields contain the resolved names.
    /** @type { typedefs.Destination } */
    // @ts-ignore: Type 'DestinationResult' is not assignable ... .
    const destination = dstData;
    const { lon: lonStr, lat: latStr, name, countryName } = destination;
    const lon = parseFloat(lonStr);
    const lat = parseFloat(latStr);

    // Get the weather forecast.
    const [wthOk, wthData] = await getWeather(lon, lat, numDays);
    console.log('handleSubmit: wthOk=', wthOk, ', wthData=', wthData);
    if (!wthOk) {
      // This is actually not a user mistake.
      // @ts-ignore: Property 'message' does not exist on type 'WeatherResult'.
      showErrorSubmit(wthData.message);
      return;
    } else {
      formUtils.clearErrorSubmit();
    }
    /** @type { typedefs.Weather } */
    // @ts-ignore: Type 'WeatherResult' is not assignable ... .
    const weather = wthData;

    // Get the destination picture.
    const [picOk, picData] = await getPicture(name, countryName);
    console.log('handleSubmit: picOk=', picOk, ', picData=', picData);
    /** @type {typedefs.Picture} */
    let picture;
    if (!picOk) {
      // This is not fatal; we simply display a placeholder.
      picture = {
        imageUrl: 'https://api.iconify.design/material-symbols-light/hide-image-outline.svg',
      };
    } else {
      // @ts-ignore: Type 'PictureResult' is not assignable ... .
      picture = picData;
    }

    // We update the UI.
    addTrip(getTrips(), now, dateDep, dateRet, destination, weather, picture);
  } finally {
    // FIXME Clear form.
    formUtils.enableSubmit();
  }
}
