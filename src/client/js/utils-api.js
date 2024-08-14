// @ts-check
'use strict';

// Project.
import * as utils from './utils';
import * as typedefs from './typedefs';

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
// const SEARCH_DESTINATION_ENDPOINT = `${BACKEND_API_BASE_URL}/test/search/destination`;

/**
 * API endpoint to retrieve the weather for a given location, in given number of days.
 */
// const SEARCH_WEATHER_ENDPOINT = `${BACKEND_API_BASE_URL}/search/weather`;
const SEARCH_WEATHER_ENDPOINT = `${BACKEND_API_BASE_URL}/test/search/weather`;

/**
 * API endpoint to retrieve a picture for a given location.
 */
const SEARCH_PICTURE_ENDPOINT = `${BACKEND_API_BASE_URL}/search/picture`;
// const SEARCH_PICTURE_ENDPOINT = `${BACKEND_API_BASE_URL}/test/search/picture`;

/**
 * API endpoint to save a trip.
 */
const TRIPS_ENDPOINT = `${BACKEND_API_BASE_URL}/trips`;

/*------------------------------------------------------------------------------------------------
 * Destination
 *------------------------------------------------------------------------------------------------*/

/**
 * Uses the API to find the destination.
 *
 * @param {string} dest the query.
 * @return {Promise<[boolean, typedefs.DestinationResult]>} either `[true, data]` or `[false, error]`.
 */
export async function getDestination(dest) {
  console.log('getDestination: dest =', dest);

  // Generic error message.
  const errMsg = `Failed to find destination for query '${dest}'.`;

  try {
    const endpoint = SEARCH_DESTINATION_ENDPOINT;
    console.log('getDestination: endpoint:', endpoint);

    const [res, resData] = await utils.postData(endpoint, { query: dest });
    console.log('getDestination: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const finalErrMsg = resData?.message ? resData.message : errMsg;
      return [false, { message: finalErrMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('getDestination: err:', err);
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message:
          'Failed to find destination: an unexpected error happened. Please, try again later.',
      },
    ];
  }
}

/*------------------------------------------------------------------------------------------------
 * Weather
 *------------------------------------------------------------------------------------------------*/

/**
 * Uses the API to get the weather.
 *
 * @param {number} lon the lon coordinate.
 * @param {number} lat the lat coordinate.
 * @param {number} numDays the desired number of days in the future.
 * @return {Promise<[boolean, typedefs.WeatherResult]>}} either `[true, data]` or `[false, error]`.
 */
export async function getWeather(lon, lat, numDays) {
  console.log('getWeather: lon=', lon, ', lat=', lat, ', numDays=', numDays);

  // Generic error message.
  const errMsg = `Failed to get weather for given location.`;

  try {
    const endpoint = SEARCH_WEATHER_ENDPOINT;
    console.log('getWeather: endpoint:', endpoint);

    const [res, resData] = await utils.postData(endpoint, { lon, lat, numDays });
    console.log('getWeather: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      return [false, { message: errMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('getWeather: err:', err);
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message: `Failed to get weather for given location: an unexpected error happened. Please, try again later.`,
      },
    ];
  }
}

/*------------------------------------------------------------------------------------------------
 * Picture
 *------------------------------------------------------------------------------------------------*/

/**
 * Uses the API to find a picture.
 *
 * @param {string} name the destination name.
 * @param {string} countryName the destination country name.
 * @return {Promise<[boolean, typedefs.PictureResult]>} either `[true, data]` or `[false, error]`.
 */
export async function getPicture(name, countryName) {
  console.log('getPicture: name=', name, ', countryName=', countryName);

  // Generic error message.
  const errMsg = 'Failed to find picture for given location.';

  try {
    const endpoint = SEARCH_PICTURE_ENDPOINT;
    console.log('getPicture: endpoint:', endpoint);

    const [res, resData] = await utils.postData(endpoint, { name, countryName });
    console.log('getPicture: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      return [false, { message: errMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('getPicture: err:', err);
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message: `Failed to find picture for given location: an unexpected error happened. Please, try again later.`,
      },
    ];
  }
}

/*------------------------------------------------------------------------------------------------
 * Trips
 *------------------------------------------------------------------------------------------------*/

export async function readTrips() {
  console.log('readTrips');

  // Generic error message.
  const errMsg = `Failed to read trips.`;

  try {
    const url = TRIPS_ENDPOINT;
    console.log('readTrips: url:', url);

    const [res, resData] = await utils.simpleGet(url);
    console.log('readTrips: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const finalErrMsg = resData?.message ? resData.message : errMsg;
      return [false, { message: finalErrMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('getTrips: err:', err);
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message: [errMsg, 'Please, try again later.'].join(' '),
      },
    ];
  }
}

/**
 * 
 * @param {string} tripId 
 */
export async function deleteTrip(tripId) {
  console.log('deleteTrip: tripId =', tripId);

  // Generic error message.
  const errMsg = `Failed to delete trip.`;

  try {
    const url = `${TRIPS_ENDPOINT}/${tripId}`;
    console.log('deleteTrip: url:', url);

    const [res, resData] = await utils.simpleDelete(url);
    console.log('deleteTrip: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const finalErrMsg = resData?.message ? resData.message : errMsg;
      return [false, { message: finalErrMsg }];
    }

    return [true, resData];
  } catch (err) {
    console.log('deleteTrip: err:', err);
    // If we are here, it is probably an issue with the API.
    return [
      false,
      {
        message: [errMsg, 'Please, try again later.'].join(' '),
      },
    ];
  }
}

/**
 * 
 * @param {string} tripId
 * @param {typedefs.Trip} tripObj
 */
export async function saveTrip(tripId, tripObj) {
  console.log('saveTrip: tripId =', tripId);

  // Generic error message.
  const errMsg = `Failed to save trip. Please, try again later.`;

  try {
    const url = `${TRIPS_ENDPOINT}`;
    console.log('saveTrip: url:', url);

    const [res, resData] = await utils.postData(url, tripObj);
    console.log('saveTrip: res.status=', res.status, ', resData=', resData);

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      const finalErrMsg = resData?.message ? resData.message : errMsg;
      return [false, { message: finalErrMsg }];
    }

    return [true, resData];
  } catch (err) {
    // If we are here, it is probably an issue with the API.
    console.log('saveTrip: err:', err);
    return [false, errMsg];
  }
}
