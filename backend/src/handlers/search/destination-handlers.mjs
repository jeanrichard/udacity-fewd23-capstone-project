// @ts-check
'use strict';

// 3rd party - Express.
import express from 'express';
import { matchedData, validationResult } from 'express-validator';

// Project.
import logger from '../../config/logger.mjs';
import * as destinationService from '../../services/search/destination-service.mjs';
import * as utils from '../../utilities/utils.mjs';

/*------------------------------------------------------------------------------------------------
 * Handlers
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns a function to handle a request to find a destination.
 *
 * @param {string} username - The username to use with the GeoNames API.
 * @returns {(req: express.Request, res: express.Response) => Promise<void>} A function that handles
 *   a request and sends a response.
 */
export function makeHandleGetDestination(username) {
  return async function handleGetDestination(req, res) {
    const fn = 'handleGetDestination';
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
      [resStatus, resData] = await destinationService.getDestination(reqData.query, username);
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
export async function handleGetDestinationTest(req, res) {
  const fn = 'handleGetDestinationTest';
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
    [resStatus, resData] = destinationService.getDestinationTest();
  }
  logger.info('exiting', { fn, resStatus, resData });
  // The `end()` seems required with POST.
  res.status(resStatus).send(resData).end();
}
