// @ts-check
'use strict';

// 3rd Party.
import * as luxon from 'luxon';

/*------------------------------------------------------------------------------------------------
 * Constants
 *------------------------------------------------------------------------------------------------*/

/**
 * Defautl timeout (ms) for `fetch` calls.
 * @type {number}
 */
const DEFAULT_TIMEOUT_MS = 5_000; // 5 seconds.

/*------------------------------------------------------------------------------------------------
 * Utilities
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns the number of remaining days until a given date.
 * @param {luxon.DateTime} date the given date.
 * @param {luxon.DateTime} now the current date.
 * @return {number} the number of the days as an integer.
 */
export function getNumRemainingDays(date, now) {
  const dateSod = date.startOf('day');
  const nowSod = now.startOf('day');
  return Math.ceil(dateSod.diff(nowSod, 'days').days);
}

/**
 * Behaves similar to `fetch` but enforces a strict timeout and returns a pair
 * (response, deserialized-JSON).
 * @param {string | URL | globalThis.Request} input same as `fetch`.
 * @param {RequestInit} [init] same as `fetch`.
 * @param {number} timeoutMs the timeout (milliseconds).
 * @returns {Promise<[Response, any]>} as described above.
 */
async function timedFetch(input, init, timeoutMs = DEFAULT_TIMEOUT_MS) {
  // We want strict timeouts on all API calls.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(`timeout ${timeoutMs} (ms)`);
  }, timeoutMs);
  try {
    const initWithSignal = { ...init, signal: controller.signal };
    // This may throw.
    const res = await fetch(input, initWithSignal);
    // At this point: we received status and headers.
    let resData = null;
    try {
      // This may throw.
      resData = await res.json();
      // At this point: we received and deserialized the body as JSON.
    } catch {}
    return [res, resData];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Sends a POST request, and returns a pair (response, deserialized-JSON).
 *
 * May throw the same exceptions as 'fetch'.
 *
 * @param {string} url the URL to use.
 * @param {any} data the data to send (will be serialized to JSON).
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[Response, any]>} as described above.
 */
export async function postData(url, data = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  /** @type {RequestInit} */
  const init = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    // Serialize to JSON to match 'Content-Type' header.
    body: JSON.stringify(data),
  };
  return timedFetch(url, init, timeoutMs);
}

/**
 * Sends a GET request, and returns a pair (response, deserialized-JSON).
 *
 * May throw the same exceptions as 'fetch'.
 *
 * @param {string} url the URL to use.
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[Response, any]>} as described above.
 */
export async function simpleGet(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  /** @type {RequestInit} */
  const init = {
    method: 'GET',
    credentials: 'same-origin',
  };
  return timedFetch(url, init, timeoutMs);
}

/**
 * Sends a DELETE request, and returns a pair (response, deserialized-JSON).
 *
 * May throw the same exceptions as 'fetch'.
 *
 * @param {string} url the URL to use.
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[Response, any]>} as described above.
 */
export async function simpleDelete(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  /** @type {RequestInit} */
  const init = {
    method: 'DELETE',
    credentials: 'same-origin',
  };
  return timedFetch(url, init, timeoutMs);
}
