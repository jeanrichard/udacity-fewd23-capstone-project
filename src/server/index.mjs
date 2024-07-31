// @ts-check
'use strict';

// Node.
import { cwd } from 'node:process';

// Express and other dependencies.
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { body, matchedData, validationResult } from 'express-validator';

// import { CANNED_ANALYSIS } from './mock-api.mjs';

/*------------------------------------------------------------------------------------------------
 * Environment variables
 *------------------------------------------------------------------------------------------------*/

dotenv.config();
const geoSearchUsername = process.env.GEONAMES_USERNAME || '';

/*------------------------------------------------------------------------------------------------
 * Utilities
 *------------------------------------------------------------------------------------------------*/

const DEFAULT_TIMEOUT_MS = 5_000; // 5 seconds.

/**
 * Retrieves a resource using GET, and returns a pair (response, deserialized JSON).
 *
 * @param {string} url the URL to use.
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[Response, any]>} as described above.
 */
async function getData(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  // We want strict timeouts on all API calls.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('getData: Aborting fetch...');
    controller.abort();
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

/*------------------------------------------------------------------------------------------------
 * Integrating the GeoNames API
 *------------------------------------------------------------------------------------------------*/

// See the documentation of the GeoNames Search Web-service:
// https://www.geonames.org/export/geonames-search.html.

/**
 * The result of a GeoNames search query.
 * @typedef {Object} GeoNamesSearchResult
 * @property {string} FIXME
 */

/**
 * Base URL of the GeoNames Search API (not versioned).
 */
// const GEONAMES_SEARCH_API_BASE_URL = 'http://api.geonames.org/searchJSON';
// https://forum.geonames.org/gforum/posts/list/35422.page
const GEONAMES_SEARCH_API_BASE_URL = 'https://secure.geonames.org/searchJSON';

/**
 * Builds the request URL to do a geo-search.
 *
 * @param {string} q the query.
 * @param {string} username the username to use.
 * @param {number} maxRows the maximum number of rows to return.
 * @returns {string} as described above.
 */
function geoSearchMakeUrl(q, username, maxRows = 20) {
  const reqUrlObj = new URL(GEONAMES_SEARCH_API_BASE_URL);
  reqUrlObj.search = new URLSearchParams([
    ['username', username],
    ['q', q],
    ['maxRows', maxRows.toString()], // FIXME Make it configurable.
    ['featureClass', 'H'],
    ['featureClass', 'L'],
    ['featureClass', 'P'],
    ['featureClass', 'S'],
    ['featureClass', 'T'],
    ['featureClass', 'V'],
    ['lang', 'en'], // We only support English for the moment. We could support other languages (i18n).
    ['type', 'json'], // Return JSON.
    ['fuzzy', '0.9'],
  ]).toString();
  return reqUrlObj.toString();
}

/**
 * Uses the GeoNames Search API to find a location.
 *
 * @param {string} destination the destination query.
 * @param {string} username the username to use with the API.
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[number, any]>} see the documentation of the
 * {@link https://learn.meaningcloud.com/developer/sentiment-analysis/2.1/doc |Sentiment Analysis API}.
 */
async function getDestination(destination, username, timeoutMs = DEFAULT_TIMEOUT_MS) {
  // Generic error message.
  const errMsg = `Failed to find destination '${destination}'.`;

  // We build the request URL.
  // (Since we take the 1st result anyway, we set `maxRows` to 1.)
  const reqUrl = geoSearchMakeUrl(destination, username, /*maxRows=*/ 1);
  console.log(`getDestination: destination='${destination}'`);

  // We send the request to the API.
  try {
    // This may throw.
    const [res, resData] = await getData(reqUrl, timeoutMs);
    console.log('getDestination: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      // We map all errors to 500.
      return [500, { message: errMsg }];
    }

    // We check the response.
    if (!resData.geonames.length) {
      const errMsg = "No destination found. Please check your spelling and try again.";
      return [404, { message: errMsg }];
    }

    const { lng, lat, name, countryName } = resData.geonames[0];
    return [200, { lng, lat, name, countryName }];
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
 * Handlers
 *------------------------------------------------------------------------------------------------*/

/**
 * Handles a request for a geo-search.
 * Note: We return a '400 - Bad Request' if the request fails validation.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleGetDestination(req, res) {
  console.log(`handleGeoSearch: req.body=${req.body}`);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(400).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const reqData = matchedData(req);
    const [resStatus, resData] = await getDestination(reqData.query, geoSearchUsername);
    res.status(resStatus).send(resData);
  }
  // Required for POST.
  res.end();
}

/**
 * (Testing) Behaves exactly like 'handleGeoSearch' but returns canned data.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleGetDestinationTest(req, res) {
  console.log(`handleGeoSearchTest: req.body=${req.body}`);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(400).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    // TODO
    // res.send(CANNED_GEOSEARCH_RESULT);
  }
  // Required for POST.
  res.end();
}

/*------------------------------------------------------------------------------------------------
 * Main part
 *------------------------------------------------------------------------------------------------*/

/** The port to listen on. */
const PORT = 3000;

/** The runtime environment: 'production' or 'development'. */
const runenv = process.env.NODE_ENV || 'development';

/* Express application. */

const app = express();

/* Middlewares. */

// Automatically parse POST requests with
// Content-Type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// Automatically parse POST requests with
// Content-Type: application/json
app.use(express.json());

// Tell the browser to allow cross-origin requests for all origins.
app.use(cors());

// Enable serving static content.
app.use(express.static('./dist'));

/* Routes. */

app.get('/', function (_req, res) {
  // Assumption: server run from parent directory of 'dist'.
  res.sendFile('dist/index.html');
});

/**
 * Builds the validation chain to use for the 'analyze-sentiment' end-point.
 * @returns {import('express-validator').ValidationChain} as described above.
 */
function validateGetDestination() {
  return body('query')
    .isLength({
      min: 1,
      max: 256
    })
    .trim()
    .withMessage('must be a valid location query');
}

app.post('/getDestination', [validateGetDestination()], handleGetDestination);

// We only add test endpoints in development.
if (runenv === 'development') {
  console.log('Adding test endpoints...');
  app.post('/test/getDestination', [validateGetDestination()], handleGetDestinationTest);
}

/* Server. */

// Start the server.
const server = app.listen(PORT, () => {
  console.log(`Express app running on localhost: ${PORT}`);
  console.log(`Express app cwd: ${cwd()}`);

  // Validate the configuration.
  if (geoSearchUsername === '') {
    console.log(
      [
        'ERROR:',
        "Environment variable 'GEONAMES_USERNAME' is not set or empty.",
        'Stopping.',
      ].join(' '),
    );
    server.close();
  }
});

// Uncomment to print all properties of the server to the console.
// console.log(server);
