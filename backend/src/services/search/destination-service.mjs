// @ts-check
'use strict';

// 3rd party - Node.
import path from 'node:path';

// Project.
import logger, { sensitive } from '../../config/logger.mjs';
import * as utils from '../../utilities/utils.mjs';
import * as typedefs from '../../types/typedefs.mjs';

/*------------------------------------------------------------------------------------------------
 * Constants
 *------------------------------------------------------------------------------------------------*/

/**
 * Base URL of the GeoNames Search API.
 *
 * @see https://forum.geonames.org/gforum/posts/list/35422.page.
 */
// const GEONAMES_SEARCH_API_BASE_URL = 'http://api.geonames.org/searchJSON';
const GEONAMES_SEARCH_API_BASE_URL = 'https://secure.geonames.org/searchJSON';

/*------------------------------------------------------------------------------------------------
 * Utilities
 *------------------------------------------------------------------------------------------------*/

/**
 * Checks the data sent back by the GeoNames Search API and returns a suitable result object.
 *
 * @param {any} resData - The data sent back by the API.
 * @returns {[number, typedefs.DestinationResult]} A pair (http-status, error-or-result).
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

/*------------------------------------------------------------------------------------------------
 * Integrating the GeoNames Search API
 *------------------------------------------------------------------------------------------------*/

/**
 * Builds the request URL to find a destination.
 *
 * @param {string} query - The query.
 * @param {string} username - The username to use with the GeoNames API.
 * @param {number} maxRows - The maximum number of rows to return.
 * @returns {string} As described above.
 * @see See the {@link https://www.geonames.org/export/geonames-search.html |GeoNames Search API documentation}.
 */
function getDestinationMakeUrl(query, username, maxRows = 1) {
  const reqUrlObj = new URL(GEONAMES_SEARCH_API_BASE_URL);
  reqUrlObj.search = new URLSearchParams([
    ['username', username],
    ['q', query],
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
 * Uses the GeoNames Search API to find a destination.
 *
 * @param {string} dest - The query.
 * @param {string} username - The username to authenticate with the API.
 * @param {number} timeoutMs - The timeout (in milliseconds).
 * @returns {Promise<[number, typedefs.DestinationResult]>} A pair (http-status, error-or-result).
 */
export async function getDestination(dest, username, timeoutMs = utils.DEFAULT_TIMEOUT_MS) {
  const fn = 'getDestination';

  // Generic error message.
  const errMsg = `Failed to find destination for query '${dest}'.`;

  // We build the request URL.
  // (Since we take the 1st result anyway, we set `maxRows` to 1.)
  const reqUrl = getDestinationMakeUrl(dest, username, /*maxRows=*/ 1);
  logger.info('built request URL', { fn, reqUrl: sensitive(reqUrl) });

  // We send the request to the API.
  try {
    // This may throw.
    const [res, resData] = await utils.timedGet(reqUrl, timeoutMs);
    logger.info('got response from the GeoNames Search API', { fn, 'res.status': res.status });

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      // We map all errors to 500.
      return [500, { message: errMsg }];
    }

    // We check the response and extract the result.
    return checkAndExtractDestination(resData);
  } catch (err) {
    logger.error('got an error', { fn, err });
    if (err.name == 'AbortError') {
      // It might be worth re-trying.
      return [503, { message: errMsg }];
    } else {
      // Map all other errors to 500.
      return [500, { message: errMsg }];
    }
  }
}

/*------------------------------------------------------------------------------------------------
 * Mocking the GeoNames Search API for E2E testing
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns a canned response.
 *
 * @returns {[number, typedefs.DestinationResult]} A pair (http-status, error-or-result).
 */
export function getDestinationTest() {
  const fn = 'getDestinationTest';

  // Generic error message.
  const errMsg = 'Failed to find canned destination data.';

  try {
    const cannedFilename = 'src/canned-data/lamboing-geonames.json';
    const cannedPath = path.resolve(utils.getRootDir(), cannedFilename);
    // We read a canned response.
    const resData = utils.objectFromFile(cannedPath);
    // We check the response and extract the result.
    return checkAndExtractDestination(resData);
  } catch (err) {
    logger.error('got an error', { fn, err });
    // We map all other errors to 500.
    return [500, { message: errMsg }];
  }
}
