// @ts-check
'use strict';

// 3rd Party.
import * as luxon from 'luxon';

// Project.
import * as typedefs from './typedefs';
import imagePlaceholder from '../images/no-image-available_1024x1024.png';

/*------------------------------------------------------------------------------------------------
 * Utilities
 *------------------------------------------------------------------------------------------------*/

const DEFAULT_TIMEOUT_MS = 5_000; // 5 seconds.

/**
 * Sends a POST request, and returns a pair (response, JSON).
 * May throw the same exceptions as 'fetch'.
 * @param {string} url the URL to use.
 * @param {any} data the data to send (will be serialized to JSON).
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[Response, any]>} as described above.
 */
export async function postData(url, data = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  // We want strict timeouts on all API calls.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('postData: Aborting fetch...');
    controller.abort();
  }, timeoutMs);
  try {
    // This may throw.
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      // Serialize to JSON to match 'Content-Type' header.
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    // At this point: we received status and headers.
    let resData = null;
    try {
      // This may throw.
      resData = await res.json();
      // At this point: we received and deserialized the body as JSON.
    } catch { }
    return [res, resData];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Returns the submit button.
 * Convenience function to get the right type hint.
 * @returns {HTMLInputElement} as described above.
 */
function getSubmitButton() {
  /** @type {HTMLInputElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  return document.querySelector('#submit-btn');
}

/**
 * Disables the submit button.
 */
function disableSubmit() {
  getSubmitButton().disabled = true;
}

/**
 * Enables the submit button.
 */
function enableSubmit() {
  getSubmitButton().disabled = false;
}

/** Number of milliseconds in a day (24 hours). */
const NUM_MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns the number of remaining days until a given date in the future.
 * @param {string} dateStr the date.
 */
function getNumRemainingDays(dateStr) {
  // We get the current date and time.
  const now = new Date();
  const date = new Date(dateStr);
  const differenceMs = date.getTime() - now.getTime();
  return Math.ceil(differenceMs / NUM_MS_PER_DAY);
}

/**
 * 
 * @param {HTMLElement} errorElt 
 * @param {string} message 
 */
function helpShowError(errorElt, message) {
  // Update content and style.
  errorElt.textContent = message;
  errorElt.classList.toggle('error-msg--active', /*force=*/ true);
}

/**
 * 
 * @param {HTMLElement} errorElt 
 */
function helpClearError(errorElt) {
  // Update content and style.
  errorElt.textContent = '';
  errorElt.classList.toggle('error-msg--active', /*force=*/ false);
}

function showErrorDestination(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpShowError(document.getElementById('destination-error'), message);
}

function clearErrorDestination(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpClearError(document.getElementById('destination-error'));
}

function showErrorDate(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpShowError(document.getElementById('date-error'), message);
}

function clearErrorDate(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpClearError(document.getElementById('date-error'));
}

function showErrorSubmit(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpShowError(document.getElementById('submit-error'), message);
}

function clearErrorSubmit(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpClearError(document.getElementById('submit-error'));
}

/*------------------------------------------------------------------------------------------------
 * Main part
 *------------------------------------------------------------------------------------------------*/

/**
 * The result of a ....
 * @typedef {Object} Trip
 */

const MAX_YEARS_FROM_NOW = 100;

/**
 * Base URL of our backend API:
 */
const BACKEND_API_BASE_URL = 'http://localhost:3000';

/**
 * API endpoint to search for a destination.
 */
// const GET_DESTINATION_ENDPOINT = `${BACKEND_API_BASE_URL}/getDestination`;
const GET_DESTINATION_ENDPOINT = `${BACKEND_API_BASE_URL}/test/getDestination`;

/**
 * API endpoint to retrieve the weather forecast for a given location.
 */
// const GET_WEATHER_ENDPOINT = `${BACKEND_API_BASE_URL}/getWeather`;
const GET_WEATHER_ENDPOINT = `${BACKEND_API_BASE_URL}/test/getWeather`;

/**
 * API endpoint to retrieve a picture for a given location.
 */
const GET_PICTURE_ENDPOINT = `${BACKEND_API_BASE_URL}/getPicture`;
// const GET_PICTURE_ENDPOINT = `${BACKEND_API_BASE_URL}/test/getPicture`;

/**
 *
 * @param {string} destination
 * @param {string} date
 */
function validateInputs(destination, date) {
  // We validate as many input fields as possible in one pass.

  // Validate destination input field.
  let destinationIsValid = true;
  let destinationMsg = '';
  if (destination.trim() === '') {
    destinationIsValid = false;
    destinationMsg = 'Destination cannot be emtpy. Please, enter a destination.';
  }
  if (!destinationIsValid) {
    showErrorDestination(destinationMsg);
  } else {
    clearErrorDestination();
  }

  // Cannot be empty and cannot be in the past and cannot be more than 100 years in the future.
  let dateIsValid = true;
  let dateMsg = '';
  if (date.trim() === '') {
    dateIsValid = false;
    dateMsg = 'Date cannot be empty. Please, enter a date.';
  } else {
    const nowObj = luxon.DateTime.now();
    const dateObj = luxon.DateTime.fromISO(date);
    if (dateObj < nowObj) {
      dateIsValid = false;
      dateMsg = 'Date cannot be in the past. Please, enter a valid date.';
    } else if (dateObj > nowObj.plus({ years: MAX_YEARS_FROM_NOW })) {
      dateIsValid = false;
      dateMsg = `Date cannot be more than ${MAX_YEARS_FROM_NOW} year(s) from now. Please, enter a valid date.`;
    }
  }
  if (!dateIsValid) {
    showErrorDate(dateMsg);
  } else {
    clearErrorDate();
  }

  return destinationIsValid && dateIsValid;
}

/**
 * Updates the UI.
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
 * Searches for a destination.
 * Returns either `[true, resData]` or `[false, message]`.
 * @param {string} destination the destination to search for.
 * @return {Promise<[boolean, any]>} FIXME
 */
async function getDestination(destination) {
  // As an improvement, if `(err.name == 'AbortError')` we could retry with some backoff strategy.

  // Generic error message.
  const defaultErrMsg = `Failed to find destination.`;

  try {
    const endpoint = GET_DESTINATION_ENDPOINT;
    console.log('getDestination: endpoint:', endpoint);

    const [res, resData] = await postData(endpoint, { query: destination });
    console.log('getDestination: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const errMsg = (resData?.message) ? resData.message : defaultErrMsg;
      return [false, { message: errMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('getDestination: err:', err);
    // If we are here, it is probably an issue with the API.
    return [false, {
      message: 'Failed to find destination: an unexpected error happened. Please, try again later.'
    }];
  }
}

/**
 * FIXME
 * 
 * @param {number} lon the lon coordinate.
 * @param {number} lat the lat coordinate.
 * @param {number} numDays the desired number of days in the future.
 * @return {Promise<[boolean, typedefs.WeatherResult]>}} xxx
 */
async function getWeather(lon, lat, numDays) {
  // Generic error message.
  const errMsg = `Failed to get weather forecast for given location in ${numDays} day(s).`;

  try {
    const endpoint = GET_WEATHER_ENDPOINT;
    console.log('getWeather: endpoint:', endpoint);

    const [res, resData] = await postData(endpoint, { lon, lat, numDays });
    console.log('getWeather: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      return [false, { message: errMsg }];
    }

    return [true, resData];
  } catch (err) {
    // As an improvement, if `(err.name == 'AbortError')` we could retry with some backoff strategy.
    console.log('getWeather: err:', err);
    return [false, { message: errMsg }];
  }
}

async function getPicture(name, countryName) {
  // Generic error message.
  const errMsg = 'Failed to find picture for given location.';

  try {
    const endpoint = GET_PICTURE_ENDPOINT;
    console.log('getPicture: endpoint:', endpoint);

    const [res, resData] = await postData(endpoint, { name, countryName });
    console.log('getPicture: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      return [false, { message: errMsg }];
    }

    return [true, resData];
  } catch (err) {
    // As an improvement, if `(err.name == 'AbortError')` we could retry with some backoff strategy.
    console.log('getPicture: err:', err);
    return [false, { message: errMsg }];
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

  // This is the way to report form validation errors despite `preventDeafult`.
  // /** @type{HTMLFormElement} */
  // // @ts-ignore: Object is possibly 'null'.
  // const formElt = document.getElementById('input-form')
  // formElt.reportValidity();

  // We retrieve the destination.
  /** @type {string} */
  // @ts-ignore: Object is possibly 'null'.
  const destination = document.getElementById('destination').value;

  // We retrieve the date.
  /** @type {string} */
  // @ts-ignore: Object is possibly 'null'.
  const date = document.getElementById('date').value;

  try {
    // Disable submit button until response or error.
    disableSubmit();

    if (!validateInputs(destination, date)) {
      // Abort.
      console.log('handleSubmit: inputs failed validation, aborting.');
      return;
    }

    // Compute the number of days remaining.
    const numDays = getNumRemainingDays(date);

    // Find the destination.
    const [dstOk, dstData] = await getDestination(destination);
    console.log('handleSubmit: dstOk=', dstOk, ', dstData=', dstData);
    if (!dstOk) {
      // Generic error message.
      const errMsg = `Failed to find destination '${destination}'.`;
      showErrorDestination(dstData.message);
      return;
    } else {
      clearErrorDestination();
    }
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
      clearErrorSubmit();
    }

    // Get the destination picture.
    // FIXME Use name resolved by GeoNames instead of query.
    const [picOk, picData] = await getPicture(name, countryName);
    console.log('handleSubmit: picOk=', picOk, ', picData=', picData);
    let actualPicData = picData;
    if (!picOk) {
      // This is not fatal; we will simply display a placeholder.
      // return;
      actualPicData = {
        imageUrl: imagePlaceholder,
      };
    }

    // We update the UI.
    updateUI(numDays, dstData, wthData, actualPicData);
  } finally {
    enableSubmit();
  }

  enableSubmit();
}
