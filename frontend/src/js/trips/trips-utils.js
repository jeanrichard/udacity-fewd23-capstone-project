// @ts-check
'use strict';

// 3rd Party.
import * as luxon from 'luxon';

// Project.
import * as uiUtils from '../utilities/ui-utils';
import { getNumRemainingDays } from '../utilities/utils';
import * as typedefs from '../types/typedefs';

// We export those for the unit tests.
export const _WEATHER_KIND_CURRENT = 'current';
export const _WEATHER_KIND_FORECAST = 'forecast';
export const _IMAGE_DESC = 'A picture chosen to represent your destination.';

/*------------------------------------------------------------------------------------------------
 * Utilities to interact with the trip UI
 *------------------------------------------------------------------------------------------------*/

/**
 * Enables the 'Save' button on a trip.
 *
 * @param {HTMLElement | DocumentFragment} tripElt - The trip HTML element.
 */
export function enableSaveButton(tripElt) {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpEnableButton(tripElt.querySelector('.trip__btn-save'));
}

/**
 * Diables the 'Save' button on a trip.
 *
 * @param {HTMLElement | DocumentFragment} tripElt - The trip HTML element.
 */
export function disableSaveButton(tripElt) {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpDisableButton(tripElt.querySelector('.trip__btn-save'));
}

/**
 * Shows an informative message.
 *
 * @param {HTMLElement | DocumentFragment} tripElt - The trip HTML element.
 * @param {string} message - The message.
 */
export function showInfo(tripElt, message) {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpShowInfo(tripElt.querySelector('.trip__error'), message);
}

/**
 * Clears an informative message.
 *
 * @param {HTMLElement | DocumentFragment} tripElt - The trip HTML element.
 */
export function clearInfo(tripElt) {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpClearInfo(tripElt.querySelector('.trip__error'));
}

/**
 * Shows an error message.
 *
 * @param {HTMLElement | DocumentFragment} tripElt - The trip HTML element.
 * @param {string} message - The message.
 */
export function showError(tripElt, message) {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpShowError(tripElt.querySelector('.trip__error'), message);
}

/**
 * Clears an error message.
 *
 * @param {HTMLElement | DocumentFragment} tripElt - The trip HTML element.
 */
export function clearError(tripElt) {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpClearError(tripElt.querySelector('.trip__error'));
}

/**
 * Splits a trip collection into 3 catgories (ongoing/pending/past).
 *
 * @param {Map<string, typedefs.Trip>} trips - The collection of trips to split.
 * @param {luxon.DateTime} now - The current date & time.
 * @return {[typedefs.TripList, typedefs.TripList, typedefs.TripList]} As described above.
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
    } else {
      // trip.dateReturning < nowMs
      past.push(trip);
    }
  }

  // 2. Sort each group.
  /** @type {function(typedefs.Trip, typedefs.Trip): number} */
  const chronoOrder = (t1, t2) => t1.dateDeparting - t2.dateDeparting;
  /** @type {function(typedefs.Trip, typedefs.Trip): number} */
  const reverseChronoOrder = (t1, t2) => -chronoOrder(t1, t2);

  ongoing.sort(chronoOrder);
  pending.sort(chronoOrder);
  past.sort(reverseChronoOrder);

  return [ongoing, pending, past];
}

/**
 * Populates an HTML fragment from a trip object.
 *
 * Note: This function is exported for the unit-tests.
 *
 * @param {HTMLElement} tripElt - The HTML fragment.
 * @param {typedefs.Trip} tripObj - The trip object.
 * @param {luxon.DateTime} now - The current date & time.
 */
export function _tripEltFromObj(tripElt, tripObj, now) {
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
  imageElt.innerHTML = `<img alt="${_IMAGE_DESC}" src="${pictureObj.imageUrl}">`;

  // Header.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  const headerElt = tripElt.querySelector('.trip__header');
  uiUtils.setText(headerElt, '.name', destinationObj.name);
  uiUtils.setText(headerElt, '.country-name', destinationObj.countryName);
  uiUtils.setText(headerElt, '.date-departing', dateDepartingStr);

  // Details.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  const detailsElt = tripElt.querySelector('.trip__details');
  uiUtils.setText(detailsElt, '.name', tripObj.destination.name);
  uiUtils.setText(detailsElt, '.country-name', tripObj.destination.countryName);
  uiUtils.setText(detailsElt, '.num-days', numDays.toString());
  uiUtils.setText(detailsElt, '.date-departing', dateDepartingStr);
  uiUtils.setText(detailsElt, '.date-returning', dateReturningStr);

  // Weather.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  const weatherUnionElt = tripElt.querySelector('.trip__weather');
  // Store kind as data attribute.
  const weatherKind = weatherObj.isCurrent ? _WEATHER_KIND_CURRENT : _WEATHER_KIND_FORECAST;
  weatherUnionElt.setAttribute('data-weather-kind', weatherKind);

  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  const weatherElt = tripObj.weather.isCurrent
    ? weatherUnionElt.querySelector('.trip__weather-current')
    : weatherUnionElt.querySelector('.trip__weather-forecast');

  uiUtils.setText(weatherElt, '.trip__weather-temp > .temp', weatherObj.temp);
  uiUtils.setTextOptional(weatherElt, '.trip__weather-temp > .temp-min', weatherObj.tempMin || '');
  uiUtils.setTextOptional(weatherElt, '.trip__weather-temp > .temp-max', weatherObj.tempMax || '');
  uiUtils.setText(weatherElt, '.trip__weather-desc', weatherObj.desc.desc);
  /** @type {HTMLElement} */
  // @ts-ignore: Object is possibly 'null'.
  const weatherIconElt = weatherElt.querySelector('.trip__weather-icon');
  weatherIconElt.innerHTML = `<img alt="${weatherObj.desc.desc}" src="${weatherObj.desc.iconUrl}">`;
}

/**
 * "Renders" a trip object to an HTML fragment.
 *
 * Note: This function is exported for the unit-tests.
 *
 * @param {typedefs.Trip} tripObj - The trip object.
 * @param {luxon.DateTime} now - The current date & time.
 * @return {DocumentFragment} as described above.
 */
export function _renderTrip(tripObj, now) {
  // We create a fragment based on the template.

  /** @type{ HTMLTemplateElement } */
  // @ts-ignore: Type 'HTMLTemplateElement | null' is not assignable ... .
  const tripTemplate = document.querySelector('#trip-template');
  /** @type {DocumentFragment} */
  // @ts-ignoreType: Type 'Node' is missing the following properties ... .
  const tripFragment = tripTemplate.content.cloneNode(/*deep=*/ true);

  // We populate the fragment.
  /** @type {HTMLElement} */
  // @ts-ignore: Type 'HTMLTemplateElement | null' is not assignable ... .
  const tripElt = tripFragment.querySelector('.trip');
  _tripEltFromObj(tripElt, tripObj, now);

  return tripFragment;
}
