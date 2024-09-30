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
 * Base URL of the Pixabay API.
 */
const PIXABAY_API_BASE_URL = 'https://pixabay.com/api/';

/*------------------------------------------------------------------------------------------------
 * Utilities
 *------------------------------------------------------------------------------------------------*/

/**
 * Checks the data sent back by the Pixabay API and returns a suitable result object.
 *
 * @param {any} resData - The data sent back by the API.
 * @returns {[number, typedefs.PictureResult]} A pair (http-status, error-or-result).
 */
function checkAndExtractPicture(resData) {
  // We check the response.
  if (!resData.hits.length) {
    const errMsg = 'No picture available for given location.';
    return [404, { message: errMsg }];
  }

  // We extract the result.
  const record = resData.hits[0];
  return [
    200,
    {
      imageUrl: record.webformatURL,
    },
  ];
}

/*------------------------------------------------------------------------------------------------
 * Integrating the Pixabay API
 *------------------------------------------------------------------------------------------------*/

/**
 * Builds the request URL to find a picture for a given location.
 *
 * @param {string} q - The query.
 * @param {string} apiKey - The API key to use with the API.
 * @returns {string} As described above.
 * @see See the {@link https://pixabay.com/service/about/api/ |Pixabay API documentation}.
 */
function getPictureMakeUrl(q, apiKey) {
  const reqUrlObj = new URL(PIXABAY_API_BASE_URL);
  reqUrlObj.search = new URLSearchParams([
    ['key', apiKey],
    ['q', q],
    ['lang', 'en'], // English.
    ['image_type', 'photo'],
    ['safesearch', 'true'], // Only images suitable for all ages.
    ['order', 'popular'],
    ['per_page', '5'], // Default is 20.
  ]).toString();
  return reqUrlObj.toString();
}

/**
 * Uses the Pixabay API to find a picture for a given location.
 *
 * @param {string} name - The destination name.
 * @param {string} countryName - The destination country name.
 * @param {string} apiKey - The API key to use with the API.
 * @param {number} timeoutMs - The timeout (in milliseconds).
 * @returns {Promise<[number, typedefs.PictureResult]>} A pair (http-status, error-or-result).
 */
export async function getPicture(name, countryName, apiKey, timeoutMs = utils.DEFAULT_TIMEOUT_MS) {
  const fn = 'getPicture';

  // Generic error message.
  const errMsg = `Failed to find picture for given location.`;

  // We build the request URL.
  const q = `${name} ${countryName}`;
  const reqUrl = getPictureMakeUrl(q, apiKey);
  logger.info('built request URL', { fn, reqUrl: sensitive(reqUrl) });

  // We send the request to the API.
  try {
    // This may throw.
    const [res, resData] = await utils.timedGet(reqUrl, timeoutMs);
    logger.info('got response from the Pixabay API', { fn, 'res.status': res.status });

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      // We map all errors to 500.
      return [500, { message: errMsg }];
    }

    // We check the response and extract the result.
    return checkAndExtractPicture(resData);
  } catch (err) {
    logger.error('got an error', { fn, err });
    if (err.name == 'AbortError') {
      // It might be worth re-trying.
      return [503, { message: errMsg }];
    } else {
      // We map all other errors to 500.
      return [500, { message: errMsg }];
    }
  }
}

/*------------------------------------------------------------------------------------------------
 * Mocking the Pixabay API for E2E testing
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns a canned response.
 *
 * @returns {[number, typedefs.PictureResult]} A pair (http-status, error-or-result).
 */
export function getPictureTest() {
  const fn = 'getPictureTest';

  // Generic error message.
  const errMsg = 'Failed to find canned picture data.';

  try {
    const cannedFilename = 'src/canned/lamboing-pixabay.json';
    const cannedPath = path.resolve(utils.getRootDir(), cannedFilename);
    // We read a canned response.
    const resData = utils.objectFromFile(cannedPath);
    // We check the response and extract the result.
    return checkAndExtractPicture(resData);
  } catch (err) {
    logger.error('got an error', { fn, err });
    // We map all other errors to 500.
    return [500, { message: errMsg }];
  }
}
