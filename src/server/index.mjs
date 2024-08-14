// @ts-check
'use strict';

// Node.
import { cwd } from 'node:process';
import { randomUUID } from 'node:crypto';

// 3rd party - Express and related dependencies.
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { body, checkSchema, matchedData, param, validationResult } from 'express-validator';

// Project.
import * as typedefs from './typedefs.mjs';
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

/** @type {Map<string, typedefs.Trip>} */
const mockDataStore = new Map();

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
 * Handlers for trips
 *------------------------------------------------------------------------------------------------*/

/**
 * Handles a request to GET all trips.
 *
 * Note: We return a '400 - Bad Request' if the request fails validation.
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
 * Builds the validation chain for a request to DELETE a trip given by its `tripId`.
 * 
 * @returns {Array<import('express-validator').ValidationChain>} as described above.
 */
function validateDeleteTrip() {
  return [
    param('tripId').isUUID().withMessage('must be a valid trip ID'),
  ];
}

/**
 * Handles a request to DELETE a trip given by its `tripId`.
 *
 * Note: We return a '400 - Bad Request' if the request fails validation.
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

const validateObjDestination = {
  lon: {
    isFloat: {
      options: {
        min: -180.0,
        max: +180.0,
        errorMessage: 'must be a floating point number in range [-180, +180]',
      },
    },
  },
  lat: {
    isFloat: {
      options: {
        min: -90.0,
        max: +90.0,
      },
      errorMessage: 'must contain a floating point number in range [-90,+ 90]',
    },
  },
  name: {
    trim: true,
    escape: true,
    notEmpty: { 
      errorMessage: 'must not be empty',
    },
  },
  countryName: {
    trim: true,
    escape: true,
    notEmpty: { 
      errorMessage: 'must not be empty',
    },
  },
};

const validateBareValTemp = {
  isFloat: {
    options: {
      min: -90.0,
      max: +60.0,
    },
    errorMesage: 'must contain a floating point number in range [-90, +60]',
  },
};

const validateObjWeather = {
  isCurrent: {
    isBoolean: {
      options: { strict: true },
    },
    errorMessage: 'must be a boolean value',
  },
  temp: validateBareValTemp,
  tempMin: {
    ...validateBareValTemp,
    optional: true,
  },
  tempMax: {
    ...validateBareValTemp,
    optional: true,
  },
  'desc.desc': {
    isLength: {
      options: { min: 1, max: 256, },
    },
  },
  'desc.iconUrl': {
    isURL: true,
  }
};

const validateObjPicture = {
  imageUrl: {
    isURL: true,
  },
};

/** Could also use a custom validator. */
const validateBareValDateTimestamp = {
  isInt: {
    options: { min: 0, },
  },
};

const validateObjTrip = {
  tripId: {
    isUUID: true,
  },
  destination: {
    isObject: true,
    custom: {
      options: (/** @type { Object }*/ value) => {
        return checkSchema(validateObjDestination).run({ body: value });
      },
    },
  },
  dateDeparting: validateBareValDateTimestamp,
  dateReturning: validateBareValDateTimestamp,
  weather: {
    isObject: true,
    custom: {
      options: (/** @type { Object }*/ value) => {
        return checkSchema(validateObjWeather).run({ body: value });
      },
    },
  }, 
  picture: {
    isObject: true,
    custom: {
      options: (/** @type { Object }*/ value) => {
        return checkSchema(validateObjPicture).run({ body: value });
      },
    },
  },
};


/**
 * Builds the validation chain for a request to DELETE a trip given by its `tripId`.
 * 
 * @returns {Array<import('express-validator').ValidationChain>} as described above.
 */
function validatePostTrip() {
  return checkSchema(validateObjTrip);
}

/*
 * Handles a request to DELETE a trip given by its `tripId`.
 *
 * Note: We return a '422 - Unprocessable Content' if the request fails validation.
 *
 * @param {express.Request} req the request.
 * @param {express.Response} res the response.
 */
async function handlePostTrip(req, res) {
 console.log('handlePostTrip: req.body=', req.body);
 const result = validationResult(req);
 if (!result.isEmpty()) {
   // There are validation errors.
   res.status(422).send({
     message: 'Invalid argument(s).',
     errors: result.array(),
   });
 } else {
   const reqData = matchedData(req);
   /** @type {typedefs.Trip} */
   // @ts-ignore: Type 'Record<string, any>' is missing the following properties ... .
   const tripObj = reqData;
   const done = mockDataStore.set(tripObj.tripId, tripObj);
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

app.post('/search/destination', validateGetDestination(), handleGetDestination);
app.post('/search/weather', validateGetWeather(), handleGetWeather);
app.post('/search/picture', validateGetPicture(), handleGetPicture);
app.get('/trips', handleGetTrips);
app.post('/trips', validatePostTrip(), handlePostTrip);
app.delete('/trips/:tripId', validateDeleteTrip(), handleDeleteTrip);

// We only add test endpoints in development.
if (runenv === 'development') {
  console.log('Adding test endpoints for search...');
  app.post('/test/search/destination', validateGetDestination(), handleGetDestinationTest);
  app.post('/test/search/weather', validateGetWeather(), handleGetWeatherTest);
  app.post('/test/search/picture', validateGetPicture(), handleGetPictureTest);
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
