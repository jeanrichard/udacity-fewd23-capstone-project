// @ts-check
'use strict';

// Project.
import * as typedefs from '../types/typedefs';

/**
 * @typedef {Array<typedefs.Trip>} TripList
 */

/** @type {Map<string, typedefs.Trip>} */
const trips = new Map();

/**
 * Returns the trip collection used by the frontend.
 *
 * @returns {Map<string, typedefs.Trip>} as described above.
 */
export function getTrips() {
  return trips;
}

/**
 * Replaces the trip collection used by the frontend.
 *
 * @param {TripList} newTrips - The new trips.
 */
export function replaceTrips(newTrips) {
  trips.clear();
  for (const trip of newTrips) {
    trips.set(trip.tripId, trip);
  }
}
