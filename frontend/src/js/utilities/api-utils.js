// @ts-check
'use strict';

// Project.
import * as typedefs from '../types/typedefs';
import * as utils from './utils';

/*------------------------------------------------------------------------------------------------
 * Constants
 *------------------------------------------------------------------------------------------------*/

/**
 * Base URL of our backend API:
 */
const BACKEND_API_BASE_URL = 'http://localhost:3000';

/**
 * API endpoint to search for a destination.
 */
const SEARCH_DESTINATION_ENDPOINT = `${BACKEND_API_BASE_URL}/search/destination`;
// const SEARCH_DESTINATION_ENDPOINT = `${BACKEND_API_BASE_URL}/search/test/destination`;

/**
 * API endpoint to retrieve the weather for a given location, in given number of days.
 */
const SEARCH_WEATHER_ENDPOINT = `${BACKEND_API_BASE_URL}/search/weather`;
// const SEARCH_WEATHER_ENDPOINT = `${BACKEND_API_BASE_URL}/search/test/weather`;

/**
 * API endpoint to retrieve a picture for a given location.
 */
const SEARCH_PICTURE_ENDPOINT = `${BACKEND_API_BASE_URL}/search/picture`;
// const SEARCH_PICTURE_ENDPOINT = `${BACKEND_API_BASE_URL}/search/test/picture`;

/**
 * API endpoint to save a trip.
 */
const TRIPS_ENDPOINT = `${BACKEND_API_BASE_URL}/trips`;

/*------------------------------------------------------------------------------------------------
 * Destination
 *------------------------------------------------------------------------------------------------*/

/**
 * Uses the API to find a destination.
 *
 * @param {string} query - The query.
 * @return {Promise<[boolean, typedefs.DestinationResult]>} either `[true, data]` or `[false, error]`.
 */
export async function getDestination(query) {
  console.log('getDestination: query=', query);

  // Generic error message.
  const defaultErrMsg = `Failed to find destination for query '${query}'.`;

  try {
    const endpoint = SEARCH_DESTINATION_ENDPOINT;
    const [res, resData] = await utils.timedPostData(endpoint, { query: query });
    console.log('getDestination: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const errMsg = resData?.message ? resData.message : defaultErrMsg;
      return [false, { message: errMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('getDestination: err=', err);
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message: [defaultErrMsg, 'Please, try again later.'].join(' '),
      },
    ];
  }
}

/*------------------------------------------------------------------------------------------------
 * Weather
 *------------------------------------------------------------------------------------------------*/

/**
 * Uses the API to get the weather for a given location.
 *
 * @param {number} lon - The lon coordinate.
 * @param {number} lat - The lat coordinate.
 * @param {number} numDays - The desired number of days in the future.
 * @return {Promise<[boolean, typedefs.WeatherResult]>}} either `[true, data]` or `[false, error]`.
 */
export async function getWeather(lon, lat, numDays) {
  console.log('getWeather: lon=', lon, ', lat=', lat, ', numDays=', numDays);

  // Generic error message.
  const defaultErrMsg = `Failed to get weather for given location.`;

  try {
    const endpoint = SEARCH_WEATHER_ENDPOINT;
    const [res, resData] = await utils.timedPostData(endpoint, { lon, lat, numDays });
    console.log('getWeather: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const errMsg = resData?.message ? resData.message : defaultErrMsg;
      return [false, { message: errMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('getWeather: err=', err);
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message: [defaultErrMsg, 'Please, try again later.'].join(' '),
      },
    ];
  }
}

/*------------------------------------------------------------------------------------------------
 * Picture
 *------------------------------------------------------------------------------------------------*/

/**
 * Uses the API to find a picture for a given location.
 *
 * @param {string} name - The destination name.
 * @param {string} countryName - The destination country name.
 * @return {Promise<[boolean, typedefs.PictureResult]>} either `[true, data]` or `[false, error]`.
 */
export async function getPicture(name, countryName) {
  console.log('getPicture: name=', name, ', countryName=', countryName);

  // Generic error message.
  const defaultErrMsg = 'Failed to find picture for given location.';

  try {
    const endpoint = SEARCH_PICTURE_ENDPOINT;
    const [res, resData] = await utils.timedPostData(endpoint, { name, countryName });
    console.log('getPicture: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const errMsg = resData?.message ? resData.message : defaultErrMsg;
      return [false, { message: errMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('getPicture: err=', err);
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message: [defaultErrMsg, 'Please, try again later.'].join(' '),
      },
    ];
  }
}

/*------------------------------------------------------------------------------------------------
 * Trips
 *------------------------------------------------------------------------------------------------*/

/**
 * Uses the API to read all trips from the backend.
 *
 * @return {Promise<[boolean, typedefs.ApiError | Array<typedefs.Trip>]>} either `[true, data]` or
 * `[false, error]`.
 */
export async function readTrips() {
  console.log('loadTrips');

  // Generic error message.
  const defaultErrMsg = 'Failed to load trips.';

  try {
    const endpoint = TRIPS_ENDPOINT;
    const [res, resData] = await utils.timedGet(endpoint);
    console.log('readTrips: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const errMsg = resData?.message ? resData.message : defaultErrMsg;
      return [false, { message: errMsg }];
    }

    // We need to add a few properties.
    for (const trip of resData) {
      trip.isSaved = true;
    }

    return [true, resData];
  } catch (err) {
    console.log('loadTrips: err=', err);
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message: [defaultErrMsg, 'Please, try again later.'].join(' '),
      },
    ];
  }
}

/**
 * Uses the API to delete a given trip from the backend.
 *
 * @param {string} tripId - The ID of the trip to delete from the backend.
 * @return {Promise<[boolean, typedefs.PictureResult]>} either `[true, data]` or `[false, error]`.
 */
export async function deleteTrip(tripId) {
  console.log('deleteTrip: tripId =', tripId);

  // Generic error message.
  const defaultErrMsg = 'Failed to delete trip.';

  try {
    const url = `${TRIPS_ENDPOINT}/${tripId}`;
    const [res, resData] = await utils.timedDelete(url);
    console.log('deleteTrip: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const errMsg = resData?.message ? resData.message : defaultErrMsg;
      return [false, { message: errMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('deleteTrip: err=', err);
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message: [defaultErrMsg, 'Please, try again later.'].join(' '),
      },
    ];
  }
}

/**
 * Uses the API to create a trip in the backend.
 *
 * @param {typedefs.Trip} trip - The trip to create in the backend.
 */
export async function createTrip(trip) {
  console.log('createTrip: trip=', trip);

  // Generic error message.
  const defaultErrMsg = `Failed to create trip. Please, try again later.`;

  try {
    const url = `${TRIPS_ENDPOINT}`;

    // We need to drop a few properties.
    const { tripId, isSaved, ...tripToSend } = trip;

    const [res, resData] = await utils.timedPostData(url, tripToSend);
    console.log('createTrip: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const finalErrMsg = resData?.message ? resData.message : defaultErrMsg;
      return [false, { message: finalErrMsg }];
    }

    return [true, resData];
  } catch (err) {
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message: [defaultErrMsg, 'Please, try again later.'].join(' '),
      },
    ];
  }
}
