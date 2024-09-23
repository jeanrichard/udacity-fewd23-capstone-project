// @ts-check
'use strict';

// 3rd Party.
import * as luxon from 'luxon';

// Project.
import {
  getDestination,
  getWeather,
  getPicture,
  createTrip,
  deleteTrip,
} from '../utilities/api-utils';
import { getTrips } from '../store/trip-store';
import { addTrip } from '../trips/trips';
import * as formUtils from './search-form-utils';
import * as typedefs from '../types/typedefs';
import * as utils from '../utilities/utils';

/*------------------------------------------------------------------------------------------------
 * Performing input validation
 *------------------------------------------------------------------------------------------------*/

/**
 * Validates the inputs provided by the user and shows errors where needed.
 *
 * If one or more inputs are invalid, returns a tuple `[false, null, null, null]`. Otherwise,
 * returns atuple `[true, dest, dateDeparting, dateReturning]`.
 *
 * @param {string} destStr - The destination query.
 * @param {string} dateDepartingStr - The date departing (in ISO format).
 * @param {string} dateReturningStr - The date returning (in ISO format).
 * @param {luxon.DateTime} now - The current date.
 * @return {[boolean, null|string, null|luxon.DateTime, null|luxon.DateTime]} as described above.
 */
function validateInputs(destStr, dateDepartingStr, dateReturningStr, now) {
  // We validate as many input fields as possible in one pass.

  // We validate the destination query.
  const [destIsValid, errOrDest] = formUtils.validateDestination(destStr);
  if (!destIsValid) {
    /** @type {string} */
    const destErrMsg = errOrDest;
    formUtils.showErrorDestination(destErrMsg);
  } else {
    formUtils.clearErrorDestination();
  }
  /** @type {string} */
  const dest = errOrDest;

  // We calidate the date departing.
  const maxDate = now.plus({ years: formUtils.MAX_YEARS_FROM_NOW });
  // We forbid planning a trip for the current day.
  const minDate = now.plus({ days: 1 });
  const [dateDepIsValid, errOrDateDep] = formUtils.validateDate(dateDepartingStr, {
    dateMin: minDate,
    dateMax: maxDate,
  });
  if (!dateDepIsValid) {
    /** @type {string} */
    // @ts-ignore: Type 'string | ...' is not assignable to ... .
    const dateErrMsg = errOrDateDep;
    formUtils.showErrorDateDeparting(dateErrMsg);
  } else {
    formUtils.clearErrorDateDeparting();
  }
  /** @type {luxon.DateTime} */
  // @ts-ignore: Type 'string | ...' is not assignable to ... .
  const dateDep = errOrDateDep;

  // Validate the date returning.
  const [dateRetIsValid, errOrDateRet] = formUtils.validateDate(dateReturningStr, {
    dateMin: dateDep,
    dateMax: maxDate,
  });
  if (!dateRetIsValid) {
    /** @type {string} */
    // @ts-ignore: Type 'string | ...' is not assignable to ... .
    const dateErrMsg = errOrDateRet;
    formUtils.showErrorDateReturning(dateErrMsg);
  } else {
    formUtils.clearErrorDateReturning();
  }
  /** @type {luxon.DateTime} */
  // @ts-ignore: Type 'string | ...' is not assignable to ... .
  const dateRet = errOrDateRet;

  const isValid = destIsValid && dateDepIsValid && dateRetIsValid;
  if (!isValid) {
    return [isValid, null, null, null];
  } else {
    return [isValid, dest, dateDep, dateRet];
  }
}

/*------------------------------------------------------------------------------------------------
 * Handling events
 *------------------------------------------------------------------------------------------------*/

/**
 * Handles the submit event:
 * 1) Validates inputs. (Displays an alert and stops if invalid.)
 * 2) Contact the backend API to find the destination, get the weather, and find a picture.
 * 3) Updates the UI.
 *
 * Note: We disable the submit button while handling the event to prevent the user from triggering
 * multiple concurrent requests.
 *
 * @param {SubmitEvent} event the submit event.
 */
export async function handleSubmit(event) {
  console.log('::: Search form submitted :::');

  // We do no want to submit the form.
  event.preventDefault();

  // We retrieve the destination.
  /** @type {string} */
  // @ts-ignore: Object is possibly 'null'.
  const destStr = document.getElementById('destination').value;

  // We retrieve the date departing.
  /** @type {string} */
  // @ts-ignore: Object is possibly 'null'.
  const dateDepartingStr = document.getElementById('date-departing').value;

  // We retrieve the date returning.
  /** @type {string} */
  // @ts-ignore: Object is possibly 'null'.
  const dateReturningStr = document.getElementById('date-returning').value;

  try {
    // We disable the submit button until response or error to prevent concurrent requests.
    formUtils.disableSubmitButton();
    // We get the current date once to ensure consistency through the entire submit process.
    const now = luxon.DateTime.now().startOf('day');
    // We validate the form.
    const [isValid, destOpt, dateDepOpt, dateRetOpt] = validateInputs(
      destStr,
      dateDepartingStr,
      dateReturningStr,
      now,
    );
    if (!isValid) {
      // Abort.
      console.log('handleSubmit: form failed validation, aborting.');
      return;
    }

    // We know that the inputs are valid.
    /** @type {string} */
    // @ts-ignore: Type '... | null' is not assignable to ... .
    const dest = destOpt;
    /** @type {luxon.DateTime} */
    // @ts-ignore: Type '... | null' is not assignable to ... .
    const dateDep = dateDepOpt;
    /** @type {luxon.DateTime} */
    // @ts-ignore: Type '... | null' is not assignable to ... .
    const dateRet = dateRetOpt;

    // We compute the number of days remaining.
    const numDays = utils.getNumRemainingDays(dateDep, now);

    // We find the destination.
    const [dstOk, dstData] = await getDestination(destStr);
    console.debug('handleSubmit: dstOk=', dstOk, ', dstData=', dstData);
    if (!dstOk) {
      // @ts-ignore: Property 'message' does not exist on type 'DestinationResult'.
      formUtils.showErrorDestination(dstData.message);
      return;
    } else {
      formUtils.clearErrorDestination();
    }
    // The `name` and `countryName` fields contain the *resolved* names.
    /** @type { typedefs.Destination } */
    // @ts-ignore: Type 'DestinationResult' is not assignable ... .
    const destination = dstData;
    const { lon: lonStr, lat: latStr, name, countryName } = destination;
    const lon = parseFloat(lonStr);
    const lat = parseFloat(latStr);

    // We get the weather for the destination.
    const [wthOk, wthData] = await getWeather(lon, lat, numDays);
    console.debug('handleSubmit: wthOk=', wthOk, ', wthData=', wthData);
    if (!wthOk) {
      // @ts-ignore: Property 'message' does not exist on type 'WeatherResult'.
      formUtils.showErrorSubmit(wthData.message);
      return;
    } else {
      formUtils.clearErrorSubmit();
    }
    /** @type { typedefs.Weather } */
    // @ts-ignore: Type 'WeatherResult' is not assignable ... .
    const weather = wthData;

    // We find the picture for the destination
    const [picOk, picData] = await getPicture(name, countryName);
    console.log('handleSubmit: picOk=', picOk, ', picData=', picData);
    /** @type {typedefs.Picture} */
    let picture;
    if (!picOk) {
      // This is not fatal; we simply display a placeholder.
      picture = {
        imageUrl: 'https://api.iconify.design/material-symbols-light/hide-image-outline.svg',
      };
    } else {
      // @ts-ignore: Type 'PictureResult' is not assignable ... .
      picture = picData;
    }

    // We update the UI.
    addTrip(getTrips(), now, dateDep, dateRet, destination, weather, picture);
    formUtils.clearSearchForm();
  } finally {
    formUtils.enableSubmitButton();
  }
}
