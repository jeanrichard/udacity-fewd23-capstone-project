// @ts-check
'use strict';

// 3rd Party.
import * as luxon from 'luxon';

// Project.
import { getDestination, getWeather, getPicture } from './utils-api';
import * as formUtils from './handler-form-utils';
// @ts-ignore: Cannot find module ... .
import imagePlaceholder from '../images/no-image-available_1024x1024.png';

/*------------------------------------------------------------------------------------------------
 * Utilities
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns the number of remaining days until a given date.
 * @param {luxon.DateTime} date the given date.
 * @param {luxon.DateTime} now the current date.
 */
function getNumRemainingDays(date, now) {
  return Math.ceil(date.diff(now, 'days').days);
}

/*------------------------------------------------------------------------------------------------
 * Main part
 *------------------------------------------------------------------------------------------------*/

const MAX_YEARS_FROM_NOW = 100;

/**
 * Validates the inputs provided by the user and shows errors where needed. If the inputs are
 * valid, returns a tuple `[true, dest, date]`, where the destination and date have been sanitized.
 * Otherwise, returns a tuple `[false, dest, date]`, where the destination and/or date are `null`.
 * 
 * @param {string} destStr the query.
 * @param {string} dateStr the date (in ISO format).
 * @param {luxon.DateTime} now the current date.
 * @return {[boolean, string|null, luxon.DateTime|null]} as described above.
 */
function validateInputs(destStr, dateStr, now) {
  // We validate as many input fields as possible in one pass.

  // Validate the destination.
  const destTrimmed = destStr.trim();
  let destIsValid = true;
  let destMsg = '';
  let destResult = null;
  if (destTrimmed === '') {
    destIsValid = false;
    destMsg = 'Destination cannot be emtpy. Please, enter a destination.';
  } else {
    destResult = destTrimmed;
  }
  if (!destIsValid) {
    formUtils.showErrorDestination(destMsg);
  } else {
    formUtils.clearErrorDestination();
  }

  // Validate the date.
  const dateTrimmed = dateStr.trim();
  let dateIsValid = true;
  let dateMsg = '';
  let dateResult = null;
  if (dateTrimmed === '') {
    dateIsValid = false;
    dateMsg = 'Date cannot be empty. Please, enter a date.';
  } else {
    const date = luxon.DateTime.fromISO(dateTrimmed);
    // See https://github.com/moment/luxon/blob/master/docs/validity.md.
    if (!date.isValid) {
      dateIsValid = false;
      dateMsg = 'Date is invalid. Please, enter a valid date.';
    } else if (date < now) {
      dateIsValid = false;
      dateMsg = 'Date cannot be in the past. Please, enter a valid date.';
    } else if (date > now.plus({ years: MAX_YEARS_FROM_NOW })) {
      dateIsValid = false;
      dateMsg = `Date cannot be more than ${MAX_YEARS_FROM_NOW} year(s) from now. Please, enter a valid date.`;
    } else {
      dateResult = date;
    }
  }
  if (!dateIsValid) {
    formUtils.showErrorDate(dateMsg);
  } else {
    formUtils.clearErrorDate();
  }

  const isValid = destIsValid && dateIsValid;
  return [isValid, destResult, dateResult];
}

/**
 * Updates the UI.
 *
 * @param {number} numDays 
 * @param {*} dstData 
 * @param {*} wthData 
 * @param {*} picData 
 */
function updateUI(numDays, dstData, wthData, picData) {
  // 1. Retrieve the template and clone it.

  /** @type{ HTMLTemplateElement } */
  // @ts-ignore: Type 'HTMLTemplateElement | null' is not assignable ... .
  const tripTemplate = document.querySelector('#trip-template');
  /** @type {DocumentFragment} */
  // @ts-ignoreType: Type 'Node' is missing the following properties ... .
  const tripFragment = tripTemplate.content.cloneNode(/*deep=*/ true);

  // 2. Update the fields.

  // @ts-ignore: Object is possibly 'null'.
  tripFragment.querySelector('.destination > .name').textContent = dstData.name;
  // @ts-ignore: Object is possibly 'null'.
  tripFragment.querySelector('.destination > .country-name').textContent = dstData.countryName;
  // @ts-ignore: Object is possibly 'null'.
  tripFragment.querySelector('.destination > .num-days').textContent = numDays;

  // @ts-ignore: Object is possibly 'null'.
  const weatherElt =
    numDays <= 1
      ? tripFragment.querySelector('.weather-current')
      : tripFragment.querySelector('.weather-forecasts');

  // Specific fields and hid other type of weather.
  if (numDays <= 1) {
    // @ts-ignore: Object is possibly 'null'.
    tripFragment.querySelector('.weather-forecasts').style.display = 'none';
  } else {
    // @ts-ignore: Object is possibly 'null'.
    weatherElt.querySelector('.temp-max').textContent = wthData.tempMax;
    // @ts-ignore: Object is possibly 'null'.
    weatherElt.querySelector('.temp-min').textContent = wthData.tempMin;
    // @ts-ignore: Object is possibly 'null'.
    tripFragment.querySelector('.weather-current').style.display = 'none';
  }

  // Common fields.
  // @ts-ignore: Object is possibly 'null'.
  weatherElt.querySelector('.temp').textContent = wthData.temp;
  // @ts-ignore: Object is possibly 'null'.
  weatherElt.querySelector('.weather-desc').textContent = wthData.weather.desc;
  // @ts-ignore: Object is possibly 'null'.
  weatherElt.querySelector('.weather-icon').innerHTML =
    `<img src="${wthData.weather.iconUrl}" alt="${wthData.weather.desc}.">`;

  // @ts-ignore: Object is possibly 'null'.
  tripFragment.querySelector('.location-pic').innerHTML =
    `<img src="${picData.imageUrl}" alt="An image chosen to represent ${dstData.name}, ${dstData.countryName}.">`;

  // FIXME More to do.

  // Insert the fragment.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  const parent = document.querySelector('#trips');
  parent.replaceChildren(tripFragment); // FIXME Multiple trips.

  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  document
    .querySelector('.trips-container')
    .classList.toggle('trips-container--nonempty', /*force=*/ true);
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
  const dateStr = document.getElementById('date').value;

  try {
    // Disable submit button until response or error.
    formUtils.disableSubmit();

    // Current date (to ensure consistency through the entire submit).
    const now = luxon.DateTime.now();
    const [isValid, destOpt, dateOpt] = validateInputs(destStr, dateStr, now);
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
    const date = dateOpt;

    // Compute the number of days remaining.
    const numDays = getNumRemainingDays(date, now);

    // Find the destination.
    const [dstOk, dstData] = await getDestination(destStr);
    console.log('handleSubmit: dstOk=', dstOk, ', dstData=', dstData);
    if (!dstOk) {
      // Generic error message.
      const errMsg = `Failed to find destination '${dest}'.`;
      // @ts-ignore: Property 'message' does not exist on type 'DestinationResult'.
      showErrorDestination(dstData.message);
      return;
    } else {
      formUtils.clearErrorDestination();
    }
    // The `name` and `countryName` fields contain the resolved names.
    // @ts-ignore: Property ... does not exist on type 'DestinationResult'.
    const { lon: lonStr, lat: latStr, name, countryName } = dstData;
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

    // Get the destination picture.
    const [picOk, picData] = await getPicture(name, countryName);
    console.log('handleSubmit: picOk=', picOk, ', picData=', picData);
    let actualPicData = picData;
    if (!picOk) {
      // This is not fatal; we simply display a placeholder.
      actualPicData = {
        imageUrl: imagePlaceholder,
      };
    }

    // We update the UI.
    updateUI(numDays, dstData, wthData, actualPicData);
  } finally {
    formUtils.enableSubmit();
  }
}
