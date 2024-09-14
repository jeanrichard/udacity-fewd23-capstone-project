// @ts-check
'use strict';

// 3rd party - Express.
import express from 'express';
import { matchedData, validationResult } from 'express-validator';

// Project.
import logger from '../../config/logger.mjs';
import * as pictureService from '../../services/search/picture-service.mjs';
import * as utils from '../../utilities/utils.mjs';

/*------------------------------------------------------------------------------------------------
 * Handlers
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns a function to handle a request to find a picture for a location.
 *
 * @param {string} apiKey - The API key to use with the Pixabay API.
 * @returns {(req: express.Request, res: express.Response) => Promise<void>} A function that handles
 *   a request and sends a response.
 */
export function makeHandleGetPicture(apiKey) {
  return async function handleGetPicture(req, res) {
    const fn = 'handleGetPicture';
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
      [resStatus, resData] = await pictureService.getPicture(
        reqData.name,
        reqData.countryName,
        apiKey,
      );
    }
    logger.info('exiting', { fn, resStatus, resData });
    // The `end` seems required for POST.
    res.status(resStatus).send(resData).end();
  };
}

/**
 * (E2E Testing) Behaves like the function returned by 'makeHandleGetPicture',
 * but returns canned data.
 *
 * @param {express.Request} req - The request.
 * @param {express.Response} res - The response.
 */
export async function handleGetPictureTest(req, res) {
  const fn = 'handleGetPictureTest';
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
    [resStatus, resData] = await pictureService.getPictureTest();
  }
  // The `end()` seems required with POST.
  res.status(resStatus).send(resData).end();
}
