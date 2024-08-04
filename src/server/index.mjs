// @ts-check
'use strict';

// Node.
import { cwd } from 'node:process';

// Express and other dependencies.
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { body, matchedData, validationResult } from 'express-validator';

// Project.
import * as utils from './utils.mjs';
import { getDestination, getDestinationTest } from './get-destination.mjs';
import { getWeather, getWeatherTest } from './get-weather.mjs';
import { getPicture, getPictureTest } from './get-picture.mjs';

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

/*------------------------------------------------------------------------------------------------
 * Handlers for destination
 *------------------------------------------------------------------------------------------------*/

/**
 * Builds the validation chain to use for the 'getDestination' end-point.
 * @returns {Array<import('express-validator').ValidationChain>} as described above.
 */
function validateGetDestination() {
  return [
    body('query')
      .isLength({
        min: 1,
        max: 256,
      })
      .trim()
      .withMessage('must be a valid location query'),
  ];
}

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
 * Builds the validation chain to use for the 'getWeather' end-point.
 * @returns {Array<import('express-validator').ValidationChain>} as described above.
 */
function validateGetWeather() {
  return [
    body('lon')
      .isFloat({
        min: -180.0,
        max: +180.0,
      })
      .toFloat()
      .withMessage('must be a floating point number in range [-180, 180]'),
    body('lat')
      .isFloat({
        min: -90.0,
        max: +90.0,
      })
      .toFloat()
      .withMessage('must be a floating point number in range [-90, 90]'),
    body('numDays')
      .isInt({
        min: 0,
      })
      .toInt()
      .withMessage('must be a non-negative integer'),
  ];
}

/**
 * Handles a request to get the weather for a given location.
 * 
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
 * Builds the validation chain to use for the 'getPicture' end-point.
 * @returns {Array<import('express-validator').ValidationChain>} as described above.
 */
function validateGetPicture() {
  return [
    body('name').isString().notEmpty().withMessage('must be a non-empty string'),
    body('countryName').isString().withMessage('must be a string'),
  ];
}

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

app.post('/getDestination', validateGetDestination(), handleGetDestination);
app.post('/getWeather', validateGetWeather(), handleGetWeather);
app.post('/getPicture', validateGetPicture(), handleGetPicture);

// We only add test endpoints in development.
if (runenv === 'development') {
  console.log('Adding test endpoints...');
  app.post('/test/getDestination', validateGetDestination(), handleGetDestinationTest);
  app.post('/test/getWeather', validateGetWeather(), handleGetWeatherTest);
  app.post('/test/getPicture', validateGetPicture(), handleGetPictureTest);
}

/* Server. */

// Start the server.
const server = app.listen(PORT, () => {
  console.log(`Express app running on localhost: ${PORT}`);
  console.log(`Express app cwd: ${cwd()}`);
  console.log(`Express app parent directory: ${utils.__dirname}`);

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
