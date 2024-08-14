// @ts-check
'use strict';

// Node.
import path from 'node:path';

// Project.
import * as utils from './utils.mjs';
import * as typedefs from './typedefs.mjs';

/*------------------------------------------------------------------------------------------------
 * Integrating the GeoNames API
 *------------------------------------------------------------------------------------------------*/

/**
 * Base URL of the GeoNames Search API.
 */
// const GEONAMES_SEARCH_API_BASE_URL = 'http://api.geonames.org/searchJSON';
// https://forum.geonames.org/gforum/posts/list/35422.page
const GEONAMES_SEARCH_API_BASE_URL = 'https://secure.geonames.org/searchJSON';

/**
 * Builds the request URL to find the destination.
 *
 * See the {@link https://www.geonames.org/export/geonames-search.html |GeoNames Search API documentation}.
 *
 * @param {string} q the query.
 * @param {string} username the username to use with the API.
 * @param {number} maxRows the maximum number of rows to return.
 * @returns {string} as described above.
 */
function getDestinationMakeUrl(q, username, maxRows = 10) {
  const reqUrlObj = new URL(GEONAMES_SEARCH_API_BASE_URL);
  reqUrlObj.search = new URLSearchParams([
    ['username', username],
    ['q', q],
    ['maxRows', maxRows.toString()],
    ['featureClass', 'H'],
    ['featureClass', 'L'],
    ['featureClass', 'P'],
    ['featureClass', 'S'],
    ['featureClass', 'T'],
    ['featureClass', 'V'],
    ['lang', 'en'], // English.
    ['type', 'json'], // Return JSON.
    ['fuzzy', '0.9'],
  ]).toString();
  return reqUrlObj.toString();
}

/**
 * Checks response data and returns a suitable result object.
 *
 * @param {any} resData data sent by the GeoNames Search API.
 * @returns {[number, typedefs.DestinationResult]} a pair (http-status, error-or-result).
 */
function checkAndExtractDestination(resData) {
  // We check the response.
  if (!resData.geonames.length) {
    const errMsg = 'No destination found. Please check your spelling and try again.';
    return [404, { message: errMsg }];
  }

  // We extract the result.
  const record = resData.geonames[0];
  return [
    200,
    {
      lon: record.lng,
      lat: record.lat,
      name: record.name,
      countryName: record.countryName,
    },
  ];
}

/**
 * Uses the GeoNames Search API to find the destination.
 *
 * @param {string} dest the query.
 * @param {string} username the username to authenticate with the API.
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[number, typedefs.DestinationResult]>} a pair (http-status, error-or-result).
 */
export async function getDestination(dest, username, timeoutMs = utils.DEFAULT_TIMEOUT_MS) {
  console.log('getDestination: dest =', dest, ', username =', /*username*/ 'redacted');

  // Generic error message.
  const errMsg = `Failed to find destination for query '${dest}'.`;

  // We build the request URL.
  // (Since we take the 1st result, we set `maxRows` to 1.)
  const reqUrl = getDestinationMakeUrl(dest, username, /*maxRows=*/ 1);
  // console.log('getDestination: reqUrl =', reqUrl); // Careful: URL contains credentials.

  // We send the request to the API.
  try {
    // This may throw.
    const [res, resData] = await utils.getData(reqUrl, timeoutMs);
    console.log('getDestination: res.status=', res.status, ', resData=', /*resData*/ 'omitted');

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      // We map all errors to 500.
      return [500, { message: errMsg }];
    }

    // We check the response and extract the result.
    return checkAndExtractDestination(resData);
  } catch (err) {
    console.log('getDestination: err:', err);
    if (err.name == 'AbortError') {
      return [503, { message: errMsg }];
    } else {
      // Map all other errors to 500.
      return [500, { message: errMsg }];
    }
  }
}

/*------------------------------------------------------------------------------------------------
 * Canned data for E2E testing
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns a canned response.
 *
 * @returns {[number, typedefs.DestinationResult]} a pair (http-status, error-or-result).
 */
export function getDestinationTest() {
  console.log('getDestinationTest');

  const cannedFilename = 'canned/lamboing-geonames.json';
  const cannedPath = path.resolve(utils.__dirname, cannedFilename);
  // We read a canned response.
  const resData = utils.objectFromFile(cannedPath);
  // We check the response and extract the result.
  return checkAndExtractDestination(resData);
}
