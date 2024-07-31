// @ts-check
'use strict';

import { isValidDate } from './date-checker';

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

/*------------------------------------------------------------------------------------------------
 * Main part
 *------------------------------------------------------------------------------------------------*/

/**
 * The result of a ....
 * @typedef {Object} Trip
 */

/**
 * Base URL of our backend API:
 */
const BACKEND_API_BASE_URL = 'http://localhost:3000';

/**
 * Endpoint for sentiment analysis.
 */
const GET_DESTINATION_ENDPOINT = `${BACKEND_API_BASE_URL}/getDestination`;
// const GET_DESTINATION_ENDPOINT = `${BACKEND_API_BASE_URL}/test/getDestination`;

/**
 * Updates the UI.
 *
 * @param {Trip} trip
 */
function displayResults(trip) {
  // Retrieve the template and clone it.
  /** @type{ HTMLTemplateElement } */
  // @ts-ignore: Type 'HTMLTemplateElement | null' is not assignable ... .
  const tripTemplate = document.querySelector('#trip-template');
  /** @type {DocumentFragment} */
  // @ts-ignoreType: Type 'Node' is missing the following properties ... .
  const tripFragment = tripTemplate.content.cloneNode(/*deep=*/ true);

  // @ts-ignore: Object is possibly 'null'.
  tripFragment.querySelector('location').textContent = "fixme";

  // Insert the fragment.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLElement | null' is not assignable ... .
  const parent = document.querySelector('#trips');
  parent.replaceChildren(trip); // FIXME Multiple trips.
}

/**
 * Searches for a destination (currently using the GeoNames service).
 * Returns either `[true, resData]` or `[false, message]`.
 * @param {string} destination the destination to search for.
 */
async function getDestination(destination) {
  // As an improvement, if `(err.name == 'AbortError')` we could retry with some backoff strategy.

  // Generic error message.
  const errMsg = `Failed to find destination '${destination}.`;

  try {
    const endpoint = GET_DESTINATION_ENDPOINT;
    console.log('getDestination: endpoint:', endpoint);

    const [res, resData] = await postData(endpoint, { query: destination });
    console.log('getDestination: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      return [false, { message: errMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('getDestination: err:', err);
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

  // We retrieve the destination.
  /** @type {string} */
  // @ts-ignore: Object is possibly 'null'.
  const destination = document.getElementById('destination').value;

  // We retrieve the date.
  /** @type {string} */
  // @ts-ignore: Object is possibly 'null'.
  const date = document.getElementById('date').value;

  console.log('date =', date, 'type =');

  try {
    const [ok, resData] = await getDestination(destination);
    console.log('after getDestination: ok=', ok, ', resData=', resData);

    if (!ok) {
      // FIXME Need to display error.
      return;
    }

    const { lng, lat, name, countryName } = resData;
    console.log('after getDestination: lng=', lng, ', lat=', lat, ', name=', name, ', countryName=', countryName);
  }
  finally { }

  // FIXME This needs to be updated.

  // // We retrieve the URL.
  // // @ts-ignore: Object is possibly 'null'.
  // let targetUrl = document.getElementById('target-url').value;
  // if (!isValidUrl(targetUrl)) {
  //   alert('Please, enter a valid URL and try again.');
  //   return;
  // }

  // // Generic error message.
  // const errMsg = `Failed to analyze page at URL='${targetUrl}'.`;

  // try {
  //   // Disable submit button until response or error.
  //   disableSubmit();

  //   const endpoint = SENTIMENT_ANALYSIS_ENDPOINT;
  //   console.log('handleSubmit: endpoint:', endpoint);

  //   const [res, resData] = await postData(endpoint, { url: targetUrl });
  //   console.log('handleSubmit: res.status, resData:', res.status, resData);

  //   // We check the HTTP status code and the data.
  //   if (!res.ok || resData === null) {
  //     // Not a 2xx status.
  //     const buffer = [resData?.message || errMsg];
  //     if (res.status === 503) {
  //       buffer.push('Hint: The service may be overloaded, try again later.');
  //     }
  //     alert(buffer.join(' '));
  //     return;
  //   }

  //   displayResults(resData);
  // } catch (err) {
  //   console.log('handleSubmit: err:', err);
  //   alert(errMsg);
  // } finally {
  //   enableSubmit();
  // }
}
