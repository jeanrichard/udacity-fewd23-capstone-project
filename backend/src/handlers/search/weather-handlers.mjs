// @ts-check
'use strict';

// 3rd party - Express.
import express from 'express';
import { matchedData, validationResult } from 'express-validator';

// Project.
import logger from '../../config/logger.mjs';
import * as weatherService from '../../services/search/weather-service.mjs';
import * as utils from '../../utilities/utils.mjs';

/*------------------------------------------------------------------------------------------------
 * Handlers
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns a function to handle a request to get the weather for a given location (current weather
 * or weather forecast).
 *
 * @param {string} apiKey - The API key to use with the WeatherBit API.
 * @returns {(req: express.Request, res: express.Response) => Promise<void>} A function that handles
 *   a request and sends a response.
 */
export function makeHandleGetWeather(apiKey) {
  return async function handleGetWeather(req, res) {
    const fn = 'handleGetWeather';
    logger.info('entering', { fn, 'req.body': req.body });
    let resStatus, resData;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      // There are validation errors.
      resStatus = utils.STATUS_CODE_FAILED_VALIDATION;
      resData = {
        message: 'Invalid argument(s).',
        errors: result.array(),
      };
    } else {
      const reqData = matchedData(req);
      [resStatus, resData] = await weatherService.getWeather(
        reqData.lon,
        reqData.lat,
        reqData.numDays,
        apiKey,
      );
    }
    logger.info('exiting', { fn, resStatus, resData });
    // The `end()` seems required with POST.
    res.status(resStatus).send(resData).end();
  };
}

/**
 * (E2E testing) Behaves like the function returned by 'makeHandleGetDestination',
 * but returns canned data.
 *
 * @param {express.Request} req - The request.
 * @param {express.Response} res - The response.
 */
export async function handleGetWeatherTest(req, res) {
  const fn = 'handleGetWeatherTest';
  logger.info('entering', { fn, 'req.body': req.body });
  let resStatus, resData;
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // There are validation errors.
    resStatus = utils.STATUS_CODE_FAILED_VALIDATION;
    resData = {
      message: 'Invalid argument(s).',
      errors: result.array(),
    };
  } else {
    const reqData = matchedData(req);
    [resStatus, resData] = await weatherService.getWeatherTest(reqData.numDays);
  }
  logger.info('exiting', { fn, resStatus, resData });
  // The `end()` seems required with POST.
  res.status(resStatus).send(resData).end();
}
