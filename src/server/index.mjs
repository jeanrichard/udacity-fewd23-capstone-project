// @ts-check
'use strict';

// Node.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath } from 'node:url';

// `__dirname` is not available in ES6 modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const geoNamesUsername = process.env.GEONAMES_USERNAME || '';
const weatherBitApiKey = process.env.WEATHERBIT_API_KEY || '';
const envProperties = [
  ['GEONAMES_USERNAME', geoNamesUsername],
  ['WEATHERBIT_API_KEY', weatherBitApiKey]
];

/*------------------------------------------------------------------------------------------------
 * Utilities
 *------------------------------------------------------------------------------------------------*/

const DEFAULT_TIMEOUT_MS = 5_000; // 5 seconds.

/**
 * 
 * @param {*} obj 
 * @param {*} filename 
 */
function objectToFile(obj, filename) {
  // Could be made async for efficiency, but this is only used for testing.
  writeFileSync(filename, JSON.stringify(obj, null, 2));
}

/**
 * 
 * @param {*} filename 
 * @returns 
 */
function objectFromFile(filename) {
  // Could be made async for efficiency, but this is only used for testing.
  return JSON.parse(readFileSync(filename, { 'encoding': 'utf-8' }));
}

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

  console.log('getDestination: destination =', destination, ', username =', username);

  // We build the request URL.
  // (Since we take the 1st result anyway, we set `maxRows` to 1.)
  const reqUrl = geoSearchMakeUrl(destination, username, /*maxRows=*/ 1);
  console.log('getDestination: reqUrl =', reqUrl);

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
 * Integrating the WeatherBit API
 *------------------------------------------------------------------------------------------------*/

/**
 * Base URL of the WeatherBit Current Weather API.
 */
const WEATHEBIT_CURRENT_BASE_URL = 'https://api.weatherbit.io/v2.0/current';

/**
 * Base URL of the WeatherBit Weather Forecaasts API.
 */
const WEATHEBIT_FORECASTS_BASE_URL = 'https://api.weatherbit.io/v2.0/forecast/daily';

/**
 * Returns the URL to access the given icon.
 * @param {string} icon the name of the icon.
 * @returns as described above.
 */
function getIconUrl(icon) {
  return `https://cdn.weatherbit.io/static/img/icons/${icon}.png`
}

/**
 * Builds the request URL to FIXME
 * 
 * @returns {string} as described above.
 */
function getWeatherCurrentMakeUrl(lng, lat, apiKey) {
  // See https://www.weatherbit.io/api/weather-current.
  const reqUrlObj = new URL(WEATHEBIT_CURRENT_BASE_URL);
  reqUrlObj.search = new URLSearchParams([
    ['key', apiKey],
    ['lang', 'en'], // English.
    ['units', 'M'], // Metric units.
    ['lat', lat.toFixed(5)],
    ['lon', lng.toFixed(5)],
  ]).toString();
  return reqUrlObj.toString();
}

/**
 * Builds the request URL to FIXME.
 * 
 * @returns {string} as described above.
 */
function getWeatherForecastsMakeUrl(lng, lat, apiKey) {
  // See https://www.weatherbit.io/api/weather-forecast-16-day.
  // NOTE: We get only 7 days with the Free plan
  const reqUrlObj = new URL(WEATHEBIT_FORECASTS_BASE_URL);
  reqUrlObj.search = new URLSearchParams([
    ['key', apiKey],
    ['lang', 'en'], // English.
    ['units', 'M'], // Metric units.
    ['lat', lat.toFixed(5)],
    ['lon', lng.toFixed(5)],
  ]).toString();
  return reqUrlObj.toString();
}

/**
 * 
 * @param {*} lng 
 * @param {*} lat 
 * @param {*} apiKey 
 * @param {*} timeoutMs 
 * @returns {Promise<[number, any]>}
 */
async function getWeatherCurrent(lng, lat, apiKey, timeoutMs = DEFAULT_TIMEOUT_MS) {
  // Generic error message.
  const errMsg = 'Failed to get current weather for given location.';

  console.log('getWeatherCurrent: lng=', lng, 'lat=', lat, 'apiKey=', /*apiKey*/ 'redacted');

  const reqUrl = getWeatherCurrentMakeUrl(lng, lat, apiKey);
  // console.log('getWeatherCurrent: reqUrl=', reqUrl); // Warning: contains credentials.

  // We send the request to the API.
  try {
    // This may throw.
    const [res, resData] = await getData(reqUrl, timeoutMs);
    console.log('getWeatherCurrent: res.status =', res.status, ', resData =', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      // We map all errors to 500.
      return [500, { message: errMsg }];
    }

    // We check the response.
    if (resData.data === null || resData.data.length === 0) {
      // This should not be possible.
      const errMsg = 'No current weather available for given location.';
      return [404, { message: errMsg }];
    }

    // Extract the needed fields and prepare the response.
    const record = resData.data[0];
    return [200, {
      temp: record.temp,
      weather: {
        desc: record.weather.description,
        iconUrl: getIconUrl(record.weather.icon)
      }
    }]
  } catch (err) {
    console.log('getWeatherCurrent: err =', err);
    if (err.name == 'AbortError') {
      return [503, { message: errMsg }];
    } else {
      // Map all other errors to 500.
      return [500, { message: errMsg }];
    }
  }
}

/**
 * 
 * @param {*} lng 
 * @param {*} lat 
 * @param {*} apiKey 
 * @param {*} timeoutMs 
 * @returns {Promise<[number, any]>}
 */
async function getWeatherForecasts(lng, lat, apiKey, timeoutMs = DEFAULT_TIMEOUT_MS) {
  // Generic error message.
  const errMsg = 'Failed to get weather forecasts for given location.';

  console.log('getWeatherForecasts: lng=', lng, 'lat=', lat, 'apiKey=', /*apiKey*/ 'redacted');

  const reqUrl = getWeatherForecastsMakeUrl(lng, lat, apiKey);
  // console.log('getWeatherForecasts: reqUrl=', reqUrl); // Warning: contains credentials.

  // We send the request to the API.
  try {
    // This may throw.
    const [res, resData] = await getData(reqUrl, timeoutMs);
    console.log('getWeatherForecasts: res.status =', res.status, ', resData =', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      // We map all errors to 500.
      return [500, { message: errMsg }];
    }

    // We check the response.
    if (resData.data === null || resData.data.length === 0) {
      // This should not be possible.
      const errMsg = 'No weather forecasts available for given location.';
      return [404, { message: errMsg }];
    }

    // Extract the needed fields and prepare the response.
    // We take the last one (furthest in the future).
    const record = resData.data[resData.data.length - 1];
    return [200, {
      temp: record.temp,
      tempLow: record.low_temp,
      tempHigh: record.high_temp,
      weather: {
        desc: record.weather.description,
        iconUrl: getIconUrl(record.weather.icon)
      }
    }]
  } catch (err) {
    console.log('getWeatherForecasts: err =', err);
    if (err.name == 'AbortError') {
      return [503, { message: errMsg }];
    } else {
      // Map all other errors to 500.
      return [500, { message: errMsg }];
    }
  }
}

/**
 * Uses the WeatherBit API to get a weather forecast.
 *
 * @param {string} apiKey the API key to use.
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[number, any]>} see the documentation of the
 * {@link https://learn.meaningcloud.com/developer/sentiment-analysis/2.1/doc |Sentiment Analysis API}.
 */
async function getWeather(lng, lat, numDays, apiKey, timeoutMs = DEFAULT_TIMEOUT_MS) {
  console.log('getWeather: lng=', lng, 'lat=', lat, 'numDays=', numDays, 'apiKey=', /*apiKey*/ 'redacted');

  if (numDays <= 1) {
    return getWeatherCurrent(lng, lat, apiKey, timeoutMs);
  } else {
    return getWeatherForecasts(lng, lat, apiKey, timeoutMs);
  }
}

/*------------------------------------------------------------------------------------------------
 * Handlers
 *------------------------------------------------------------------------------------------------*/

/**
 * Handles a request FIXME.
 * Note: We return a '400 - Bad Request' if the request fails validation.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleGetDestination(req, res) {
  console.log('handleGetDestination: req.body =', req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(400).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const reqData = matchedData(req);
    const [resStatus, resData] = await getDestination(reqData.query, geoNamesUsername);
    res.status(resStatus).send(resData);
  }
  // Required for POST.
  res.end();
}

/**
 * (Testing) Behaves exactly like 'handleGeoSearch' but returns canned data.
 *g
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleGetDestinationTest(req, res) {
  console.log('handleGeoSearchTest: req.body =', req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(400).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const filename = 'canned/lamboing-geonames.json';
    const resData = objectFromFile(path.resolve(__dirname, filename));
    console.log('handleGetDestinationTest: resData=', resData, 'type=', typeof resData);
    const record = resData.geonames[0];
    const resObj = {
      lng: record.lng,
      lat: record.lat,
      name: record.name,
      countryName: record.countryName
    };
    res.status(200).send(resObj);
  }
  // Required for POST.
  res.end();
}

/**
 * Handles a request FIXME.
 * Note: We return a '400 - Bad Request' if the request fails validation.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleGetWeather(req, res) {
  console.log(`handleGetWeather: req.body=${req.body}`);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(400).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const reqData = matchedData(req);
    const [resStatus, resData] = await getWeather(reqData.lng, reqData.lat, reqData.numDays, weatherBitApiKey);
    res.status(resStatus).send(resData);
  }
  // Required for POST.
  res.end();
}

/**
 * (Testing) Behaves exactly like 'handleGetWeather' but returns canned data.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleGetWeatherTest(req, res) {
  console.log('handleGetWeatherTest: req.body=', req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(400).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const reqData = matchedData(req);
    const numDays = reqData.numDays;

    if (numDays <= 1) {
      const filename = 'canned/lamboing-weatherbit-current.json';
      const resData = objectFromFile(path.resolve(__dirname, filename));
      console.log('handleGetWeatherTest: cannedData=', resData, 'type=', typeof resData);
      const record = resData.data[0];
      const resObj = {
        temp: record.temp,
        weather: {
          desc: record.weather.description,
          iconUrl: getIconUrl(record.weather.icon)
        }
      };
      res.status(200).send(resObj);
    } else {
      const filename = 'canned/lamboing-weatherbit-forecasts.json';
      const resData = objectFromFile(path.resolve(__dirname, filename));
      console.log('handleGetWeatherTest: cannedData=', resData, 'type=', typeof resData);
      // We take the last one (furthest in the future).
      const record = resData.data[resData.data.length - 1];
      const resObj = {
        temp: record.temp,
        tempLow: record.low_temp,
        tempHigh: record.high_temp,
        weather: {
          desc: record.weather.description,
          iconUrl: getIconUrl(record.weather.icon)
        }
      };
      res.status(200).send(resObj);
    }
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
 * Builds the validation chain to use for the 'getDestination' end-point.
 * @returns {Array<import('express-validator').ValidationChain>} as described above.
 */
function validateGetDestination() {
  return [
    body('query')
      .isLength({
        min: 1,
        max: 256
      })
      .trim()
      .withMessage('must be a valid location query')
  ];
}

app.post('/getDestination', validateGetDestination(), handleGetDestination);

/**
 * Builds the validation chain to use for the 'getWeather' end-point.
 * @returns {Array<import('express-validator').ValidationChain>} as described above.
 */
function validateGetWeather() {
  return [
    body('lng')
      .isFloat({
        min: -180.0,
        max: +180.0
      })
      .toFloat()
      .withMessage('must be a floating point number in range [-180, 180]'),
    body('lat')
      .isFloat({
        min: -90.0,
        max: +90.0
      })
      .toFloat()
      .withMessage('must be a floating point number in range [-90, 90]'),
    body('numDays')
      .isInt({
        min: 0
      })
      .toInt()
      .withMessage('must be a non-negative integer')
  ];
}

app.post('/getWeather', validateGetWeather(), handleGetWeather);

// We only add test endpoints in development.
if (runenv === 'development') {
  console.log('Adding test endpoints...');
  app.post('/test/getDestination', validateGetDestination(), handleGetDestinationTest);
  app.post('/test/getWeather', validateGetWeather(), handleGetWeatherTest);
}

/* Server. */

// Start the server.
const server = app.listen(PORT, () => {
  console.log(`Express app running on localhost: ${PORT}`);
  console.log(`Express app cwd: ${cwd()}`);
  console.log(`Express app parent directory: ${__dirname}`);

  // Validate the configuration.
  let closeServer = false;
  for (const [name, value] of envProperties) {
    if (value === '') {
      console.log(
        [
          'ERROR:',
          `Environment variable '${name}' is not set or empty.`,
          'Stopping.',
        ].join(' '),
      );
      closeServer = true;
    }
  }
  if (closeServer) {
    server.close();
  }
});

// Uncomment to print all properties of the server to the console.
// console.log(server);
