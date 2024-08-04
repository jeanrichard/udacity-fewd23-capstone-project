// @ts-check
'use strict';

// Node.
import path from 'node:path';

// Project.
import * as utils from './utils.mjs';
import * as typedefs from './typedefs.mjs';

/*------------------------------------------------------------------------------------------------
 * Utilities
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns the URL to access a given icon.
 * @param {string} icon the name of the icon.
 * @returns as described above.
 */
function getIconUrl(icon) {
  return `https://cdn.weatherbit.io/static/img/icons/${icon}.png`;
}

/*------------------------------------------------------------------------------------------------
 * Integrating the Current Weather API
 *------------------------------------------------------------------------------------------------*/

/**
 * Base URL of the WeatherBit Current Weather API.
 */
const WEATHEBIT_CURRENT_BASE_URL = 'https://api.weatherbit.io/v2.0/current';

/**
 * Builds the request URL to get the current weather for a given location.
 * 
 * See the {@link https://www.weatherbit.io/api/weather-current |Current Weather API documentation}.
 * 
 * @param {number} lon the lon coordinate.
 * @param {number} lat the lat coordinate.
 * @param {string} apiKey the API key to use with the API.
 * @returns {string} as described above.
 */
function getWeatherCurrentMakeUrl(lon, lat, apiKey) {
  const reqUrlObj = new URL(WEATHEBIT_CURRENT_BASE_URL);
  reqUrlObj.search = new URLSearchParams([
    ['key', apiKey],
    ['lang', 'en'], // English.
    ['units', 'M'], // Metric units.
    ['lat', lat.toFixed(5)],
    ['lon', lon.toFixed(5)],
  ]).toString();
  return reqUrlObj.toString();
}

/**
 * Checks response data and returns a suitable result object.
 * 
 * @param {any} resData data sent by the WeatherBit Current Weather API.
 * @returns {[number, typedefs.WeatherResult]} a pair (http-status, error-or-result).
 */
function checkAndExtractWeatherCurrent(resData) {
  // We check the response.
  if (resData.data === null || resData.data.length === 0) {
    // This should not be possible.
    const errMsg = 'No current weather available for given location.';
    return [404, { message: errMsg }];
  }

  // We extract the result.
  const record = resData.data[0];
  return [
    200,
    {
      temp: record.temp,
      tempMin: null,
      tempMax: null,
      weather: {
        desc: record.weather.description,
        iconUrl: getIconUrl(record.weather.icon),
      },
    },
  ];
}

/**
 * Returns the current weather for a given location.
 * 
 * @param {number} lng the lon coordinate.
 * @param {number} lat the lat coordinate.
 * @param {string} apiKey the API key to use with the API.
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[number, typedefs.WeatherResult]>}  a pair (http-status, error-or-result).
 */
async function getWeatherCurrent(lng, lat, apiKey, timeoutMs = utils.DEFAULT_TIMEOUT_MS) {
  console.log('getWeatherCurrent: lng=', lng, 'lat=', lat, 'apiKey=', /*apiKey*/ 'redacted');

  // Generic error message.
  const errMsg = 'Failed to get current weather for given location.';

  const reqUrl = getWeatherCurrentMakeUrl(lng, lat, apiKey);
  // console.log('getWeatherCurrent: reqUrl=', reqUrl); // Careful: URL contains credentials.

  // We send the request to the API.
  try {
    // This may throw.
    const [res, resData] = await utils.getData(reqUrl, timeoutMs);
    console.log('getWeatherCurrent: res.status =', res.status, ', resData =', /*resData*/ 'omitted');

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      // We map all errors to 500.
      return [500, { message: errMsg }];
    }

    // We check the response and extract the result.
    return checkAndExtractWeatherCurrent(resData);
  } catch (err) {
    console.log('getWeatherCurrent: err =', err);
    if (err.name == 'AbortError') {
      return [503, { message: errMsg }];
    } else {
      // We map all other errors to 500.
      return [500, { message: errMsg }];
    }
  }
}

/*------------------------------------------------------------------------------------------------
 * Integrating the Weather Forecasts API
 *------------------------------------------------------------------------------------------------*/

/**
 * Base URL of the WeatherBit Weather Forecasts API.
 */
const WEATHEBIT_FORECASTS_BASE_URL = 'https://api.weatherbit.io/v2.0/forecast/daily';

/**
 * Builds the request URL to get the weather forecast for a given location.
 * 
 * See the {@link https://www.weatherbit.io/api/weather-forecast-16-day |Weather Forecast API documentation}.
 *
 * @param {number} lon the lon coordinate.
 * @param {number} lat the lat coordinate.
 * @param {string} apiKey the API key to use with the API.
 * @returns {string} as described above.
 */
function getWeatherForecastMakeUrl(lon, lat, apiKey) {
  const reqUrlObj = new URL(WEATHEBIT_FORECASTS_BASE_URL);
  reqUrlObj.search = new URLSearchParams([
    ['key', apiKey],
    ['lang', 'en'], // English.
    ['units', 'M'], // Metric units.
    ['lat', lat.toFixed(5)],
    ['lon', lon.toFixed(5)],
  ]).toString();
  return reqUrlObj.toString();
}

/**
 * Checks response data and returns a suitable result object.
 * 
 * @param {any} resData data sent by the WeatherBit Weather Forecasts API.
 * @returns {[number, typedefs.WeatherResult]} a pair (http-status, error-or-result).
 */
function checkAndExtractWeatherForecast(resData) {
  // We check the response.
  if (resData.data === null || resData.data.length === 0) {
    // This should not be possible.
    const errMsg = 'No weather forecast available for given location.';
    return [404, { message: errMsg }];
  }

  // We extract the result.
  // We take the last record (furthest in the future).
  const record = resData.data[resData.data.length - 1];
  return [
    200,
    {
      temp: record.temp,
      tempMin: record.min_temp,
      tempMax: record.max_temp,
      weather: {
        desc: record.weather.description,
        iconUrl: getIconUrl(record.weather.icon),
      },
    },
  ];
}

/**
 * Returns the weather forecast for a given location.
 * 
 * Note: We get only 7 days in the future with the Free plan.
 * 
 * @param {number} lng the lon coordinate.
 * @param {number} lat the lat coordinate.
 * @param {string} apiKey the API key to use with the API.
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[number, typedefs.WeatherResult]>}  a pair (http-status, error-or-result).
 */
async function getWeatherForecast(lng, lat, apiKey, timeoutMs = utils.DEFAULT_TIMEOUT_MS) {
  console.log('getWeatherForecast: lng=', lng, 'lat=', lat, 'apiKey=', /*apiKey*/ 'redacted');

  // Generic error message.
  const errMsg = 'Failed to get weather forecast for given location.';

  const reqUrl = getWeatherForecastMakeUrl(lng, lat, apiKey);
  // console.log('getWeatherForecasts: reqUrl=', reqUrl); // Careful: URL contains credentials.

  // We send the request to the API.
  try {
    // This may throw.
    const [res, resData] = await utils.getData(reqUrl, timeoutMs);
    console.log('getWeatherForecast: res.status =', res.status, ', resData =', /*resData*/ 'omitted');

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      // We map all errors to 500.
      return [500, { message: errMsg }];
    }

    // We check the response and extract the result.
    return checkAndExtractWeatherForecast(resData);
  } catch (err) {
    console.log('getWeatherForecast: err =', err);
    if (err.name == 'AbortError') {
      return [503, { message: errMsg }];
    } else {
      // We map all other errors to 500.
      return [500, { message: errMsg }];
    }
  }
}

/*------------------------------------------------------------------------------------------------
 * Integrating the WeatherBit API
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns the current weather if `numDays` is ≤ 1; returns the weather forecast otherwise.
 * 
 * Note: We get only 7 days in the future with the Free plan.
 *
 * @param {number} lng the lon coordinate.
 * @param {number} lat the lat coordinate.
 * @param {number} numDays the desired number of days in the future.
 * @param {string} apiKey the API key to use with the API.
 * @param {number} timeoutMs the timeout, in ms (optional).
 * @returns {Promise<[number, typedefs.WeatherResult]>}  a pair (http-status, error-or-result).
 */
export async function getWeather(lng, lat, numDays, apiKey, timeoutMs = utils.DEFAULT_TIMEOUT_MS) {
  console.log(
    'getWeather: lng=',
    lng,
    'lat=',
    lat,
    'numDays=',
    numDays,
    'apiKey=',
    /*apiKey*/ 'redacted',
  );

  if (numDays <= 1) {
    return getWeatherCurrent(lng, lat, apiKey, timeoutMs);
  } else {
    return getWeatherForecast(lng, lat, apiKey, timeoutMs);
  }
}

/*------------------------------------------------------------------------------------------------
 * Canned data for E2E testing
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns a canned response.
 *
 * @param {number} numDays the desired number of days in the future.
 * @returns {[number, typedefs.WeatherResult]} a pair (http-status, error-or-result).
 */
export function getWeatherTest(numDays) {
  console.log('getWeatherTest: numDays=', numDays);
  if (numDays <= 1) {
    const cannedFilename = 'canned/lamboing-weatherbit-current.json';
    const cannedPath = path.resolve(utils.__dirname, cannedFilename);
    // We read a canned response.
    const resData = utils.objectFromFile(cannedPath);
    // We check the response and extract the result.
    return checkAndExtractWeatherCurrent(resData);
  } else {
    const cannedFilename = 'canned/lamboing-weatherbit-forecasts.json';
    const cannedPath = path.resolve(utils.__dirname, cannedFilename);
    // We read a canned response.
    const resData = utils.objectFromFile(cannedPath);
    // We check the response and extract the result.
    return checkAndExtractWeatherForecast(resData);
  }
}
