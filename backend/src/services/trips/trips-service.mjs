// @ts-check
'use strict';

// 3rd party - Node.
import { randomUUID } from 'node:crypto';

// Project.
import * as typedefs from '../../types/typedefs.mjs';

/*------------------------------------------------------------------------------------------------
 * Mock data store
 *------------------------------------------------------------------------------------------------*/

/** @type {Map<string, typedefs.Trip>} */
const mockDataStore = new Map();

/*------------------------------------------------------------------------------------------------
 * Service
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns all trips in the mock data store.
 *
 * @returns {Promise<[number, Array<typedefs.Trip>]>} A pair (http-status, result).
 */
export async function getTrips() {
  // We retrieve all trips.
  const trips = Array.from(mockDataStore.values());
  // We order them by departing date, in reverse chronological order.
  trips.sort((t1, t2) => t1.dateDeparting - t2.dateDeparting);

  // Send status and response.
  const resStatus = 200;
  const resData = trips;
  return [resStatus, resData];
}

/**
 * Remvoves a trip from the mock data store.
 *
 * @param {string} tripId - The ID of the trip to remove.
 * @returns {Promise<[number, object]>} A pair (http-status, error-or-result).
 */
export async function removeTrip(tripId) {
  let resStatus, resData;

  // We  attempt to remove the trip.
  const done = mockDataStore.delete(tripId);

  // Send status and response.
  if (!done) {
    // Not found.
    resStatus = 404;
    resData = { message: 'Not found.' };
  } else {
    resStatus = 200;
    resData = { message: 'Success.' };
  }
  return [resStatus, resData];
}

/**
 * Adds a trip to the mock data store.
 *
 * @param {typedefs.Trip} trip - The trip to add.
 * @returns {Promise<[number, object]>} A pair (http-status, result).
 */
export async function addTrip(trip) {
  // We generate the trip ID.
  const tripId = randomUUID();
  trip.tripId = tripId;

  // We add the trip.
  mockDataStore.set(tripId, trip);

  // Send status and response.
  const resStatus = 200;
  const resData = { tripId: tripId, message: 'Success.' };
  return [resStatus, resData];
}
