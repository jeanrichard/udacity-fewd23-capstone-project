// @ts-check
'use strict';

// Node.
import { cwd } from 'node:process';
import { randomUUID } from 'node:crypto';

// 3rd party - Express and related dependencies.
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { checkExact, checkSchema, matchedData, validationResult } from 'express-validator';

// Project.
import * as typedefs from './types/typedefs.mjs';
import * as utils from './utilities/utils.mjs';
import { getDestination, getDestinationTest } from './routes/search/get-destination.mjs';
import { getWeather, getWeatherTest } from './routes/search/get-weather.mjs';
import { getPicture, getPictureTest } from './routes/search/get-picture.mjs';

// Import validation middlewares.

// Search.
import { validateGetDestination } from './middleware/search/validate-get-destination.mjs';
import { validateGetWeather } from './middleware/search/validate-get-weather.mjs';
import { validateGetPicture } from './middleware/search/validate-get-picture.mjs';

// Trips.
import { validateCreateTrip } from './middleware/trips/validate-create-trip.mjs';
import { validateDeleteTrip } from './middleware/trips/validate-delete-trip.mjs';

/*------------------------------------------------------------------------------------------------
 * Environment variables
 *------------------------------------------------------------------------------------------------*/

dotenv.config();
const geoNamesUsername = process.env.GEONAMES_USERNAME || '';
const weatherBitApiKey = process.env.WEATHERBIT_API_KEY || '';
const pixabayApiKey = process.env.PIXABAY_API_KEY || '';
// As a list of pairs.
const envProperties = [
  ['GEONAMES_USERNAME', geoNamesUsername],
  ['WEATHERBIT_API_KEY', weatherBitApiKey],
  ['PIXABAY_API_KEY', pixabayApiKey],
];

/** @type {Map<string, typedefs.Trip>} */
const mockDataStore = new Map();

/*------------------------------------------------------------------------------------------------
 * Handlers for destination
 *------------------------------------------------------------------------------------------------*/

/**
 * Handles a request to find a destination.
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
    console.log('handleGetDestination: resStatus=', resStatus, 'resData=', resData);
    res.status(resStatus).send(resData);
  }
  // Required for POST.
  res.end();
}

/**
 * (E2E testing) Behaves exactly like 'handleGetDestination' but returns canned data.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleGetDestinationTest(req, res) {
  console.log('handleGetDestinationTest: req.body =', req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(400).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const [resStatus, resData] = getDestinationTest();
    console.log('handleGetDestinationTest: resStatus=', resStatus, 'resData=', resData);
    res.status(resStatus).send(resData);
  }
  // Required for POST.
  res.end();
}

/*------------------------------------------------------------------------------------------------
 * Handlers for weather
 *------------------------------------------------------------------------------------------------*/

/**
 * Handles a request to get the weather for a given location.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleGetWeather(req, res) {
  console.log(`handleGetWeather: req.body=${req.body}`);

  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(utils.STATUS_CODE_FAILED_VALIDATION).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const reqData = matchedData(req);
    const [resStatus, resData] = await getWeather(
      reqData.lon,
      reqData.lat,
      reqData.numDays,
      weatherBitApiKey,
    );
    console.log('handleGetWeather: resStatus=', resStatus, 'resData=', resData);
    res.status(resStatus).send(resData);
  }
  // Required for POST.
  res.end();
}

/**
 * (E2E testing) Behaves exactly like 'handleGetWeather' but returns canned data.
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
    const [resStatus, resData] = await getWeatherTest(reqData.numDays);
    console.log('handleGetWeatherTest: resStatus=', resStatus, 'resData=', resData);
    res.status(resStatus).send(resData);
  }
  // Required for POST.
  res.end();
}

/*------------------------------------------------------------------------------------------------
 * Handlers for picture
 *------------------------------------------------------------------------------------------------*/

/**
 * Handles a request to find a picture for a location.
 *
 * Note: We return a '400 - Bad Request' if the request fails validation.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleGetPicture(req, res) {
  console.log('handleGetPicture: req.body=', req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(400).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const reqData = matchedData(req);
    const [resStatus, resData] = await getPicture(reqData.name, reqData.countryName, pixabayApiKey);
    console.log('handleGetPicture: resStatus=', resStatus, ', resData=', resData);
    res.status(resStatus).send(resData);
  }
  // Required for POST.
  res.end();
}

/**
 * (E2E Testing) Behaves exactly like 'handleGetPicture' but returns canned data.
 *
 * Note: We return a '400 - Bad Request' if the request fails validation.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleGetPictureTest(req, res) {
  console.log('handleGetPictureTest: req.body=', req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(400).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const reqData = matchedData(req);
    const [resStatus, resData] = await getPictureTest();
    console.log('handleGetPictureTest: resStatus=', resStatus, ', resData=', resData);
    res.status(resStatus).send(resData);
  }
  // Required for POST.
  res.end();
}

/*------------------------------------------------------------------------------------------------
 * Handlers for trips
 *------------------------------------------------------------------------------------------------*/

/**
 * Handles a request to GET all trips.
 *
 * @param {express.Request} _req the request.
 * @param {express.Response} res the response.
 */
function handleGetTrips(_req, res) {
  console.log('handleGetTrips');
  const resStatus = 200;
  const trips = Array.from(mockDataStore.values());
  // Order trips by departing date, in reverse chronological order.
  const resData = trips.sort((t1, t2) => t1.dateDeparting - t2.dateDeparting);
  console.log('handleGetTrips: resStatus=', resStatus, ', resData=', resData);
  res.status(resStatus).send(trips).end();
}

/**
 * Handles a request to DELETE a trip given by its `tripId`.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handleDeleteTrip(req, res) {
  console.log('handleDeleteTrip: req.body=', req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(400).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const reqData = matchedData(req);
    const done = mockDataStore.delete(reqData.tripId);
    if (!done) {
      // Not found.
      const errMsg = 'Not found.';
      res.status(404).send({ message: errMsg });
    } else {
      res.status(200).send({ message: 'Success.' });
    }
  }
  res.end();
}

/**
 * Handles a request to create a trip.
 *
 * @param {express.Request} req - The request.
 * @param {express.Response} res - The response.
 */
async function handlePostTrip(req, res) {
  console.log('handlePostTrip: req.body=', req.body);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    res.status(utils.STATUS_CODE_FAILED_VALIDATION).send({
      message: 'Invalid argument(s).',
      errors: result.array(),
    });
  } else {
    const reqData = matchedData(req);
    /** @type {typedefs.Trip} */
    // @ts-ignore: Type 'Record<string, any>' is missing the following properties ... .
    const tripObj = reqData;
    // We generate the trip ID.
    const tripId = randomUUID();
    tripObj.tripId = tripId;
    const done = mockDataStore.set(tripId, tripObj);
    if (!done) {
      // Not found.
      const errMsg = 'Not found.';
      res.status(404).send({ message: errMsg });
    } else {
      res.status(200).send({ tripId: tripId, message: 'Success.' });
    }
  }
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

app.post('/search/destination', checkExact(validateGetDestination()), handleGetDestination);
app.post('/search/weather', checkExact(validateGetWeather()), handleGetWeather);
app.post('/search/picture', checkExact(validateGetPicture()), handleGetPicture);
app.get('/trips', handleGetTrips);
app.post('/trips', checkExact(validateCreateTrip()), handlePostTrip);
app.delete('/trips/:tripId', checkExact(validateDeleteTrip()), handleDeleteTrip);

// We only add test endpoints in development.
if (runenv === 'development') {
  console.log('Adding test endpoints for search...');
  app.post(
    '/test/search/destination',
    checkExact(validateGetDestination()),
    handleGetDestinationTest,
  );
  app.post('/test/search/weather', checkExact(validateGetWeather()), handleGetWeatherTest);
  app.post('/test/search/picture', checkExact(validateGetPicture()), handleGetPictureTest);
}

/* Server. */

// Start the server.
const server = app.listen(PORT, () => {
  console.log(`Express app running on localhost: ${PORT}`);
  console.log(`Express app cwd: ${cwd()}`);
  console.log(`Express app root directory: ${utils.getRootDir()}`);

  // Validate the configuration.
  let closeServer = false;
  for (const [name, value] of envProperties) {
    if (value === '') {
      console.log(`ERROR: Environment variable '${name}' is not set or empty.`);
      closeServer = true;
    }
  }
  if (closeServer) {
    console.log('ERROR: Stopping.');
    server.close();
  }
});

// Uncomment to print all properties of the server to the console.
// console.log(server);

// Export the app for testing.
export { app, server };
