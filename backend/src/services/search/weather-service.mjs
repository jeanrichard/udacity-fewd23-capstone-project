// @ts-check
'use strict';

// 3rd party - Node.
import path from 'node:path';

// Project.
import logger, { sensitive } from '../../config/logger.mjs';
import * as utils from '../../utilities/utils.mjs';
import * as typedefs from '../../types/typedefs.mjs';

/*------------------------------------------------------------------------------------------------
 * Constants
 *------------------------------------------------------------------------------------------------*/

/**
 * Base URL of the WeatherBit | Current Weather API.
 */
const WEATHEBIT_CURRENT_BASE_URL = 'https://api.weatherbit.io/v2.0/current';

/**
 * Base URL of the WeatherBit | Weather Forecasts API.
 */
const WEATHEBIT_FORECASTS_BASE_URL = 'https://api.weatherbit.io/v2.0/forecast';

/*------------------------------------------------------------------------------------------------
 * Utilities
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns the URL to access a given icon.
 *
 * @param {string} icon - The name of the icon.
 * @returns {string} As described above.
 */
function getIconUrl(icon) {
  return `https://cdn.weatherbit.io/static/img/icons/${icon}.png`;
}

/**
 * Checks the data sent back by the Current Weather API and returns a suitable result object.
 *
 * @param {any} resData - The data sent back by the API.
 * @returns {[number, typedefs.WeatherResult]} A pair (http-status, error-or-result).
 */
function checkAndExtractWeatherCurrent(resData) {
  // We check the response.
  if (resData.data === null || resData.data.length === 0) {
    const errMsg = 'No current weather available for given location.';
    return [404, { message: errMsg }];
  }

  // We extract the result.
  const record = resData.data[0];
  return [
    200,
    {
      isCurrent: true,
      temp: record.temp,
      tempMin: null,
      tempMax: null,
      desc: {
        desc: record.weather.description,
        iconUrl: getIconUrl(record.weather.icon),
      },
    },
  ];
}

/**
 * Checks the data sent back by the Weather Forecasts API and returns a suitable result object.
 *
 * @param {any} resData - The data sent back by the API.
 * @returns {[number, typedefs.WeatherResult]} A pair (http-status, error-or-result).
 */
function checkAndExtractWeatherForecast(resData) {
  // We check the response.
  if (resData.data === null || resData.data.length === 0) {
    const errMsg = 'No weather forecast available for given location.';
    return [404, { message: errMsg }];
  }

  // We extract the result.
  // Note: We take the last record (furthest in the future).
  const record = resData.data[resData.data.length - 1];
  return [
    200,
    {
      isCurrent: false,
      temp: record.temp,
      tempMin: record.min_temp,
      tempMax: record.max_temp,
      desc: {
        desc: record.weather.description,
        iconUrl: getIconUrl(record.weather.icon),
      },
    },
  ];
}

/*------------------------------------------------------------------------------------------------
 * Integrating the Weather Bit | Current Weather API
 *------------------------------------------------------------------------------------------------*/

/**
 * Builds the request URL to get the current weather for a given location.
 *
 * @param {number} lon - The lon coordinate.
 * @param {number} lat - The lat coordinate.
 * @param {string} apiKey - The API key to use with the API.
 * @returns {string} As described above.
 * @see See the {@link https://www.weatherbit.io/api/weather-current |Current Weather API documentation}.
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
 * Uses the Current Weather API to get the current weather for a given location.
 *
 * @param {number} lon - The lon coordinate.
 * @param {number} lat - The lat coordinate.
 * @param {string} apiKey - The API key to use with the API.
 * @param {number} timeoutMs - The timeout (in milliseconds).
 * @returns {Promise<[number, typedefs.WeatherResult]>} A pair (http-status, error-or-result).
 */
async function getWeatherCurrent(lon, lat, apiKey, timeoutMs = utils.DEFAULT_TIMEOUT_MS) {
  const fn = 'getWeatherCurrent';

  // Generic error message.
  const errMsg = 'Failed to get current weather for given location.';

  const reqUrl = getWeatherCurrentMakeUrl(lon, lat, apiKey);
  logger.info('built request URL', { fn, reqUrl: sensitive(reqUrl) });

  // We send the request to the API.
  try {
    // This may throw.
    const [res, resData] = await utils.timedGet(reqUrl, timeoutMs);
    logger.info('got response from the Current Weather API', { fn, 'res.status': res.status });

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      // We map all errors to 500.
      return [500, { message: errMsg }];
    }

    // We check the response and extract the result.
    return checkAndExtractWeatherCurrent(resData);
  } catch (err) {
    logger.error('got an error', { fn, err });
    if (err.name == 'AbortError') {
      // It might be worth re-trying.
      return [503, { message: errMsg }];
    } else {
      // We map all other errors to 500.
      return [500, { message: errMsg }];
    }
  }
}

/*------------------------------------------------------------------------------------------------
 * Integrating the Weather Bit | Weather Forecasts API
 *------------------------------------------------------------------------------------------------*/

/**
 * Builds the request URL to get the weather forecast for a given location.
 *
 * @param {number} lon - The lon coordinate.
 * @param {number} lat - The lat coordinate.
 * @param {string} apiKey - The API key to use with the API.
 * @returns {string} As described above.
 * @see See the {@link https://www.weatherbit.io/api/weather-forecast-16-day |Weather Forecast API documentation}.
 */
function getWeatherForecastMakeUrl(lon, lat, apiKey) {
  const reqUrlObj = new URL(`${WEATHEBIT_FORECASTS_BASE_URL}/daily`);
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
 * Uses the Weather Forecasts API to get the weather forecast for a given location.
 *
 * @param {number} lon - The lon coordinate.
 * @param {number} lat - The lat coordinate.
 * @param {string} apiKey - The API key to use with the API.
 * @param {number} timeoutMs - The timeout (in milliseconds).
 * @returns {Promise<[number, typedefs.WeatherResult]>} A pair (http-status, error-or-result).
 */
async function getWeatherForecast(lon, lat, apiKey, timeoutMs = utils.DEFAULT_TIMEOUT_MS) {
  const fn = 'getWeatherForecast';

  // Generic error message.
  const errMsg = 'Failed to get weather forecast for given location.';

  const reqUrl = getWeatherForecastMakeUrl(lon, lat, apiKey);
  logger.info('built request URL', { fn, reqUrl: sensitive(reqUrl) });

  // We send the request to the API.
  try {
    // This may throw.
    const [res, resData] = await utils.timedGet(reqUrl, timeoutMs);
    logger.info('got response from the Weather Forecasts API', { fn, 'res.status': res.status });

    // We check the HTTP status code.
    if (!res.ok || resData === null) {
      // We map all errors to 500.
      return [500, { message: errMsg }];
    }

    // We check the response and extract the result.
    return checkAndExtractWeatherForecast(resData);
  } catch (err) {
    logger.error('got an error', { fn, err });
    if (err.name == 'AbortError') {
      // It might be worth re-trying.
      return [503, { message: errMsg }];
    } else {
      // We map all other errors to 500.
      return [500, { message: errMsg }];
    }
  }
}

/*------------------------------------------------------------------------------------------------
 * Integrating the WeatherBit APIs
 *------------------------------------------------------------------------------------------------*/

/**
 * Uses the WeatherBit APIs to get the weather for a given location.
 *
 * Returns the current weather if `numDays` is ≤ 1; returns the weather forecast otherwise.
 *
 * Note: We get only 7 days in the future with the Free plan.
 *
 * @param {number} lon - The lon coordinate.
 * @param {number} lat - The lat coordinate.
 * @param {number} numDays - The desired number of days in the future.
 * @param {string} apiKey - The API key to use with the API.
 * @param {number} timeoutMs - The timeout (in milliseconds).
 * @returns {Promise<[number, typedefs.WeatherResult]>} A pair (http-status, error-or-result).
 */
export async function getWeather(lon, lat, numDays, apiKey, timeoutMs = utils.DEFAULT_TIMEOUT_MS) {
  if (numDays <= 1) {
    return getWeatherCurrent(lon, lat, apiKey, timeoutMs);
  } else {
    return getWeatherForecast(lon, lat, apiKey, timeoutMs);
  }
}

/*------------------------------------------------------------------------------------------------
 * Mocking the WeatherBit APIs for E2E testing
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns a canned response.
 *
 * @param {number} numDays - The desired number of days in the future.
 * @returns {[number, typedefs.WeatherResult]} A pair (http-status, error-or-result).
 */
export function getWeatherTest(numDays) {
  const fn = 'getWeatherTest';

  // Generic error message.
  const errMsg = 'Failed to get canned weather forecast data.';

  try {
    if (numDays <= 1) {
      const cannedFilename = 'src/canned-data/lamboing-weatherbit-current.json';
      const cannedPath = path.resolve(utils.getRootDir(), cannedFilename);
      // We read a canned response.
      const resData = utils.objectFromFile(cannedPath);
      // We check the response and extract the result.
      return checkAndExtractWeatherCurrent(resData);
    } else {
      const cannedFilename = 'src/canned-data/lamboing-weatherbit-forecasts.json';
      const cannedPath = path.resolve(utils.getRootDir(), cannedFilename);
      // We read a canned response.
      const resData = utils.objectFromFile(cannedPath);
      // We check the response and extract the result.
      return checkAndExtractWeatherForecast(resData);
    }
  } catch (err) {
    logger.error('got an error', { fn, err });
    // We map all other errors to 500.
    return [500, { message: errMsg }];
  }
}
