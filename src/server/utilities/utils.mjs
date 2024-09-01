// @ts-check
'use strict';

// Node.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// `__dirname` is not available in ES6 modules.
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

/*------------------------------------------------------------------------------------------------
 * Constants
 *------------------------------------------------------------------------------------------------*/

/**
 * Default timeout (in milliseconds) for `fetch` calls.
 * @type {number}
 */
export const DEFAULT_TIMEOUT_MS = 5_000; // 5 seconds.

/**
 * The HTTP response status code if a request failed validation.
 * @type {number}
 */
export const STATUS_CODE_FAILED_VALIDATION = 422; // Unprocessable Content.

/*------------------------------------------------------------------------------------------------
 * Utilities for canned data
 *------------------------------------------------------------------------------------------------*/

export function getRootDir() {
  return path.resolve(__dirname, '..');
}

/**
 * A helper function to write an object to a JSON file.
 *
 * @param {any} obj the object.
 * @param {string} filename the path to the JSON file.
 */
export function objectToFile(obj, filename) {
  // Could be made async for efficiency, but this is only used for testing.
  writeFileSync(filename, JSON.stringify(obj, null, 2), { encoding: 'utf-8' });
}

/**
 * A helper function to read an object from a JSON file.
 *
 * @param {string} filename the path to the JSON file.
 * @returns {any} the object.
 */
export function objectFromFile(filename) {
  // Could be made async for efficiency, but this is only used for testing.
  return JSON.parse(readFileSync(filename, { encoding: 'utf-8' }));
}

/*------------------------------------------------------------------------------------------------
 * Utilities for `fetch`
 *------------------------------------------------------------------------------------------------*/

/**
 * Behaves similar to `fetch` but enforces a strict timeout and returns a pair
 * (response, deserialized-JSON).
 *
 * @param {string | URL | globalThis.Request} input same as `fetch`.
 * @param {RequestInit} [init] same as `fetch`.
 * @param {number} timeoutMs the timeout (in milliseconds).
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
 * Sends a GET request, and returns a pair (response, deserialized-JSON).
 *
 * May throw the same exceptions as 'fetch'.
 *
 * @param {string} url the URL to use.
 * @param {number} timeoutMs the timeout (in milliseconds, optional).
 * @returns {Promise<[Response, any]>} as described above.
 */
export async function timedGet(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  /** @type {RequestInit} */
  const init = {
    method: 'GET',
    credentials: 'same-origin',
  };
  return timedFetch(url, init, timeoutMs);
}
