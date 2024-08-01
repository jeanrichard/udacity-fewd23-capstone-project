// @ts-check
'use strict';

// Node.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// `__dirname` is not available in ES6 modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * A helper function to write an object to a JSON file.
 * @param {any} obj the object.
 * @param {string} filename the path to the JSON file.
 */
function objectToFile(obj, filename) {
  // Could be made async for efficiency, but this is only used for testing.
  writeFileSync(filename, JSON.stringify(obj, null, 2), { encoding: 'utf-8' });
}

/**
 * A helper function to read an object from a JSON file.
 * @param {string} filename the path to the JSON file.
 * @returns {any} the object.
 */
function objectFromFile(filename) {
  // Could be made async for efficiency, but this is only used for testing.
  return JSON.parse(readFileSync(filename, { encoding: 'utf-8' }));
}

/**
 * Retrieves a resource using GET, and returns a pair (response, deserialized JSON).
 * @param {string} url the URL to use.
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[Response, any]>} as described above.
 */
async function getData(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  // We want strict timeouts on all API calls.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('getData: Aborting fetch...');
    controller.abort('timeout');
  }, timeoutMs);
  try {
    // This may throw.
    const res = await fetch(url, { signal: controller.signal });
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

export {
  __filename,
  __dirname,
  DEFAULT_TIMEOUT_MS,
  objectToFile,
  objectFromFile,
  getData,
};
