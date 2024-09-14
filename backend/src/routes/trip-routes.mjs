// @ts-check
'use strict';

// 3rd party - Express and related.
import express from 'express';
import { checkExact } from 'express-validator';

// Project.
import { validateCreateTrip } from '../middleware/trips/validate-create-trip.mjs';
import { validateDeleteTrip } from '../middleware/trips/validate-delete-trip.mjs';
import {
  handleGetTrips,
  handleDeleteTrip,
  handlePostTrip,
} from '../handlers/trips/trips-handlers.mjs';

/**
 * Create the routes for manipulating trips.
 *
 * @returns {express.Router} As described above.
 */
function makeTripRouter() {
  const router = express.Router();

  // We define the routes and associate them with their validators and handlers.
  router.get('/', handleGetTrips);
  router.post('/', checkExact(validateCreateTrip()), handlePostTrip);
  router.delete('/:tripId', checkExact(validateDeleteTrip()), handleDeleteTrip);
  return router;
}

export default makeTripRouter;
