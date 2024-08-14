// @ts-check
'use strict';

import * as typedefs from './typedefs';

// 3rd Party.
import * as luxon from 'luxon';

// Project.
import { getNumRemainingDays } from './utils';

/** @type {Map<string, typedefs.Trip>} */
const trips = new Map();

export function getTrips() {
  return trips;
}

/**
 * 
 * @param {Array<typedefs.Trip>} data 
 */
export function loadTrips(data) {
  trips.clear();
  for (const trip of data) {
    trip.isSaved = true;
    trips.set(trip.tripId, trip);
  }
}

/**
 * @typedef {Array<typedefs.Trip>} TripList
 */

/**
 * Splits the trips into 3 groups:
 * - ongoing
 * - pending
 * - past
 * @param {Map<string, typedefs.Trip>} trips
 * @param {luxon.DateTime} now
 * @return {[TripList, TripList, TripList]}
 */
export function splitTrips(trips, now) {
  const nowMs = now.toMillis();
  const ongoing = [];
  const pending = [];
  const past = [];

  // 1. Divide the trips into groups.
  for (const trip of trips.values()) {
    if (trip.dateDeparting <= nowMs && nowMs <= trip.dateReturning) {
      ongoing.push(trip);
    } else if (nowMs < trip.dateDeparting) {
      pending.push(trip);
    } else { // trip.dateReturning < nowMs
      past.push(trip);
    }
  }

  // 2. Sort each group.
  /** @type {function(typedefs.Trip, typedefs.Trip): number} */
  const chronoOrder = (t1, t2) => (t1.dateDeparting - t2.dateDeparting);
  /** @type {function(typedefs.Trip, typedefs.Trip): number} */
  const reverseChronoOrder = (t1, t2) => -chronoOrder(t1, t2);

  ongoing.sort(chronoOrder);
  pending.sort(chronoOrder);
  past.sort(reverseChronoOrder);

  return [ongoing, pending, past];
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {string} selectors 
 * @param {string} text 
 */
function fill(element, selectors, text) {
  const elt = element.querySelector(selectors);
  // @ts-ignore: Object is possibly 'null'.
  elt.textContent = text;
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {string} selectors 
 * @param {string | null} text 
 */
function fillOptional(element, selectors, text) {
  const elt = element.querySelector(selectors);
  if (elt !== null) {
    elt.textContent = text;
  }
}

export const WEATHER_KIND_CURRENT = 'current';
export const WEATHER_KIND_FORECAST = 'forecast';

export const IMAGE_DESC = 'A picture chosen to represent your destination.';

/**
 * 
 * @param {HTMLElement} tripElt 
 * @param {typedefs.Trip} tripObj
 * @param {luxon.DateTime} now
 */
export function tripEltFromObj(tripElt, tripObj, now) {
  // Convenience.
  const destinationObj = tripObj.destination;
  const weatherObj = tripObj.weather;
  const pictureObj = tripObj.picture;

  // Convenience.
  const dateDeparting = luxon.DateTime.fromMillis(tripObj.dateDeparting);
  const dateReturning = luxon.DateTime.fromMillis(tripObj.dateReturning);
  const dateDepartingStr = dateDeparting.toLocaleString();
  const dateReturningStr = dateReturning.toLocaleString();

  // Compute transient pieces of information.
  const numDays = getNumRemainingDays(dateDeparting, now);

  // Trip.
  tripElt.setAttribute('data-trip-id', tripObj.tripId);

  // Image.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  const imageElt = tripElt.querySelector('.trip__image');
  imageElt.innerHTML =
    `<img alt="${IMAGE_DESC}" src="${pictureObj.imageUrl}">`;

  // Header.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  const headerElt = tripElt.querySelector('.trip__header');
  fill(headerElt, '.name', destinationObj.name);
  fill(headerElt, '.country-name', destinationObj.countryName);
  fill(headerElt, '.date-departing', dateDepartingStr);

  // Details.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  const detailsElt = tripElt.querySelector('.trip__details');
  fill(detailsElt, '.name', tripObj.destination.name);
  fill(detailsElt, '.country-name', tripObj.destination.countryName);
  fill(detailsElt, '.num-days', numDays.toString());
  fill(detailsElt, '.date-departing', dateDepartingStr);
  fill(detailsElt, '.date-returning', dateReturningStr);

  // Weather.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  const weatherUnionElt = tripElt.querySelector('.trip__weather');
  // Store kind as data attribute.
  const weatherKind = (weatherObj.isCurrent)
    ? WEATHER_KIND_CURRENT
    : WEATHER_KIND_FORECAST;
  weatherUnionElt.setAttribute('data-weather-kind', weatherKind);

  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  const weatherElt = (tripObj.weather.isCurrent)
    ? weatherUnionElt.querySelector('.trip__weather-current')
    : weatherUnionElt.querySelector('.trip__weather-forecast');

  fill(weatherElt, '.trip__weather-temp > .temp', weatherObj.temp);
  fillOptional(weatherElt, '.trip__weather-temp > .temp-min', weatherObj.tempMin);
  fillOptional(weatherElt, '.trip__weather-temp > .temp-max', weatherObj.tempMax);
  fill(weatherElt, '.trip__weather-desc', weatherObj.desc.desc);
  /** @type {HTMLElement} */
  // @ts-ignore: Object is possibly 'null'.
  const weatherIconElt = weatherElt.querySelector('.trip__weather-icon');
  weatherIconElt.innerHTML =
    `<img alt="${weatherObj.desc.desc}" src="${weatherObj.desc.iconUrl}">`;
}
