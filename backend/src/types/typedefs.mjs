// @ts-check
'use strict';

/**
 * Generic error.
 * @typedef {Object} ApiError
 * @property {string} message an error message.
 */

/*------------------------------------------------------------------------------------------------
 * Destination
 *------------------------------------------------------------------------------------------------*/

/**
 * Destination.
 * @typedef {Object} Destination
 * @property {string} lon the lon coordinate (decimal number, encoded as a string).
 * @property {string} lat the lat coordinate (decimal number, encoded as a string).
 * @property {string} name the resolved destination name.
 * @property {string} countryName the resolved destination country.
 */

/**
 * Destination result.
 * @typedef {ApiError|Destination} DestinationResult
 */

/*------------------------------------------------------------------------------------------------
 * Weather
 *------------------------------------------------------------------------------------------------*/

/**
 * Weather description.
 * @typedef {Object} WeatherDesc
 * @property {string} desc the description of the weather.
 * @property {string} iconUrl the URL of an icon that represents the weather.
 */

/**
 * Weather.
 * @typedef {Object} Weather
 * @property {boolean} isCurrent `true` if current weather, `false` if forecasted weather.
 * @property {number} temp the current/expected temperature.
 * @property {number?} tempMin the min temperature (forecasted weather only).
 * @property {number?} tempMax the max temperature (forecasted weather only).
 * @property {WeatherDesc} desc the weather description.
 */

/**
 * Weather result.
 * @typedef {ApiError|Weather} WeatherResult
 */

/*------------------------------------------------------------------------------------------------
 * Picture
 *------------------------------------------------------------------------------------------------*/

/**
 * Picture.
 * @typedef {Object} Picture
 * @property {string} imageUrl the URL of an image.
 */

/**
 * Picture result.
 * @typedef {ApiError|Picture} PictureResult
 */

/*------------------------------------------------------------------------------------------------
 * Trip
 *------------------------------------------------------------------------------------------------*/

/**
 * Trip.
 * @typedef {Object} Trip
 * @property {string} tripId the trip ID.
 * @property {Destination} destination the destination.
 * @property {number} dateDeparting the departing date (in milliseconds since the Unix epoch).
 * @property {number} dateReturning the returning date (in milliseconds since the Unix epoch).
 * @property {Weather} weather the weather information.
 * @property {Picture} picture the picture selected for the destination.
 */

export {};
