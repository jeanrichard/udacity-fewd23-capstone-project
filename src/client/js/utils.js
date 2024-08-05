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
 */
export function getNumRemainingDays(date, now) {
  return Math.ceil(date.diff(now, 'days').days);
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
  // We want strict timeouts on all API calls.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('postData: Aborting fetch...');
    controller.abort(`timeout ${timeoutMs} (ms)`);
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
