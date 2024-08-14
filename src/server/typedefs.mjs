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
 * @property {string} lon the lon coordinate (decimal number), encoded as a string.
 * @property {string} lat the lat coordinate (decimal number), encoded as a string.
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
 * Weather.
 * @typedef {Object} WeatherDesc
 * @property {string} desc the description of the weather.
 * @property {string} iconUrl the URL of an icon that represents the weather.
 */

/**
 * Weather success.
 * @typedef {Object} Weather
 * @property {boolean} isCurrent `true` for the current weather, `false` for the forecasted weather.
 * @property {string} temp the current/expected temperature.
 * @property {string?} tempMin the min temperature (forecasted weather only).
 * @property {string?} tempMax the max temperature (forecasted weather only).
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
 * @property {number} dateDeparting the departing date.
 * @property {number} dateReturning the returning date.
 * @property {Weather} weather the weather information.
 * @property {Picture} picture the picture selected for the destination.
 */

export { };
