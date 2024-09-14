// @ts-check
'use strict';

// 3rd party - Node.
import process from 'node:process';

// 3rd party - Express and releated.
import express from 'express';
import { checkExact } from 'express-validator';

// Project.
import logger from '../config/logger.mjs';
import { validateGetDestination } from '../middleware/search/destination-validator.mjs';
import {
  makeHandleGetDestination,
  handleGetDestinationTest,
} from '../handlers/search/destination-handlers.mjs';
import { validateGetWeather } from '../middleware/search/weather-validator.mjs';
import {
  makeHandleGetWeather,
  handleGetWeatherTest,
} from '../handlers/search/weather-handlers.mjs';
import { validateGetPicture } from '../middleware/search/picture-validator.mjs';
import {
  makeHandleGetPicture,
  handleGetPictureTest,
} from '../handlers/search/picture-handlers.mjs';

//  We add or not some routes based on the environment.
const ENV = process.env.NODE_ENV || 'development';

/**
 * Create the routes for searching.
 *
 * @param {object} config - The configuration.
 * @returns {express.Router} As described above.
 */
function makeSearchRouter(config) {
  const router = express.Router();

  // We define the routes and associate them with their validators and handlers.
  router.post(
    '/destination',
    checkExact(validateGetDestination()),
    makeHandleGetDestination(config.geoNamesUsername),
  );
  router.post('/weather', checkExact(validateGetWeather()), makeHandleGetWeather(config.weatherBitApiKey));
  router.post('/picture', checkExact(validateGetPicture()), makeHandleGetPicture(config.pixabayApiKey));

  if (ENV !== 'production') {
    logger.info('adding test endpoints', { fn: 'makeSearchRouter', env: ENV });
    router.post(
      '/test/destination',
      checkExact(validateGetDestination()),
      handleGetDestinationTest,
    );
    router.post('/test/weather', checkExact(validateGetWeather()), handleGetWeatherTest);
    router.post('/test/picture', checkExact(validateGetPicture()), handleGetPictureTest);
  }
  return router;
}

export default makeSearchRouter;
