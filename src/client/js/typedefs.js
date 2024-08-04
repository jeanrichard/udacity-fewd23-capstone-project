// @ts-check
'use strict';

// WARNING: Copied from 'server/typedefs.mjs'. Should be kept in sync.

/**
 * Generic error.
 * @typedef {Object} ApiError
 * @property {string} message an error message.
 */

/*------------------------------------------------------------------------------------------------
 * Destination
 *------------------------------------------------------------------------------------------------*/

/**
 * Destination success.
 * @typedef {Object} DestinationSuccess
 * @property {string} lon the lon coordinate (decimal number), encoded as a string.
 * @property {string} lat the lat coordinate (decimal number), encoded as a string.
 * @property {string} name the resolved destination name.
 * @property {string} countryName the resolved destination country.
 */

/**
 * Destination result.
 * @typedef {ApiError|DestinationSuccess} DestinationResult
 */

/*------------------------------------------------------------------------------------------------
 * Weather
 *------------------------------------------------------------------------------------------------*/

/**
 * Weather description.
 * @typedef {Object} Weather
 * @property {string} desc the description of the weather.
 * @property {string} iconUrl the URL of an icon that represents the weather.
 */

/**
 * Weather success.
 * @typedef {Object} WeatherSuccess
 * @property {string} temp the expected temperature.
 * @property {string?} tempMin the min temperature.
 * @property {string?} tempMax the max temperature.
 * @property {Weather} weather the weather description.
 */

/**
 * Weather result.
 * @typedef {ApiError|WeatherSuccess} WeatherResult
 */

/*------------------------------------------------------------------------------------------------
 * Picture
 *------------------------------------------------------------------------------------------------*/

/**
 * Picture success.
 * @typedef {Object} PictureSuccess
 * @property {string} imageUrl the URL of an image.
 */

/**
 * Picture result.
 * @typedef {ApiError|PictureSuccess} PictureResult
 */

export { }
