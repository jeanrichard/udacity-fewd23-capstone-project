// @ts-check
'use strict';

// 3rd party - Node.
import { randomUUID } from 'node:crypto';

// 3rd party - Express and related dependencies.
import express from 'express';
import { matchedData, validationResult } from 'express-validator';

// Project.
import logger from '../../config/logger.mjs';
import * as tripService from '../../services/trips/trips-service.mjs';
import * as typedefs from '../../types/typedefs.mjs';
import * as utils from '../../utilities/utils.mjs';

/*------------------------------------------------------------------------------------------------
 * Mock data store
 *------------------------------------------------------------------------------------------------*/

/** @type {Map<string, typedefs.Trip>} */
const mockDataStore = new Map();

/*------------------------------------------------------------------------------------------------
 * Handlers
 *------------------------------------------------------------------------------------------------*/

/**
 * Handles a request to GET all trips.
 *
 * @param {express.Request} _req - The request.
 * @param {express.Response} res - The response.
 */
export async function handleGetTrips(_req, res) {
  const fn = 'handleGetTrips';
  logger.info('entering', { fn });
  const [resStatus, resData] = await tripService.getTrips();
  logger.info('exiting', { fn, resStatus, resData });
  res.status(resStatus).send(resData).end();
}

/**
 * Handles a request to DELETE a trip given by its `tripId`.
 *
 * @param {express.Request} req - The request.
 * @param {express.Response} res - The response.
 */
export async function handleDeleteTrip(req, res) {
  const fn = 'handleDeleteTrip';
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
    [resStatus, resData] = await tripService.removeTrip(reqData.tripId);
  }
  logger.info('exiting', { fn, resStatus, resData });
  // The `end()` seems required with POST.
  res.status(resStatus).send(resData).end();
}

/**
 * Handles a request to create a trip.
 *
 * @param {express.Request} req - The request.
 * @param {express.Response} res - The response.
 */
export async function handlePostTrip(req, res) {
  const fn = 'handlePostTrip';
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
    /** @type {typedefs.Trip} */
    // @ts-ignore: Type 'Record<string, any>' is missing the following properties ... .
    const trip = reqData;
    [resStatus, resData] = await tripService.addTrip(trip);
  }
  logger.info('exiting', { fn, resStatus, resData });
  // The `end()` seems required with POST.
  res.status(resStatus).send(resData).end();
}
