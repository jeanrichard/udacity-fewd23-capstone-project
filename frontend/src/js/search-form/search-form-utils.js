// @ts-check
'use strict';

// 3rd party.
import * as luxon from 'luxon';

// Project.
import * as uiUtils from '../utilities/ui-utils';

/*------------------------------------------------------------------------------------------------
 * Utilities to validate inputs
 *------------------------------------------------------------------------------------------------*/

/**
 * The maximum number of years in the future a trip can be.
 */
export const MAX_YEARS_FROM_NOW = 20;

/**
 * Validates the destination query provided by the user.
 *
 * @param {string} destStr - The destination query.
 * @returns {[boolean, string|string]} a pair (isValid, error-or-result).
 */
export function validateDestination(destStr) {
  const destTrimmed = destStr.trim();
  if (destTrimmed === '') {
    const errMsg = 'Please, enter a destination.';
    return [false, errMsg];
  } else {
    const result = destTrimmed;
    return [true, result];
  }
}

/**
 * Validates a date provided by the user.
 *
 * @param {string} dateStr - The date (in ISO format).
 * @param {Object} options - The range options.
 * @param {luxon.DateTime} [options.dateMin] - The lower bound of the range (inclusive).
 * @param {luxon.DateTime} [options.dateMax] - The upper bound of the range (inclusive).
 * @returns {[boolean, string|luxon.DateTime]} a pair (isValid, error-or-result).
 */
export function validateDate(dateStr, { dateMin, dateMax }) {
  const dateTrimmed = dateStr.trim();
  if (dateTrimmed === '') {
    const errMsg = 'Please, enter a date.';
    return [false, errMsg];
  } else {
    const date = luxon.DateTime.fromISO(dateTrimmed).startOf('day');
    // See https://github.com/moment/luxon/blob/master/docs/validity.md.
    if (!date.isValid) {
      const errMsg = 'Invalid date.';
      return [false, errMsg];
    } else if (dateMin !== undefined && date < dateMin) {
      const errMsg = `Invalid date: date cannot be before ${dateMin.toLocaleString()}.`;
      return [false, errMsg];
    } else if (dateMax !== undefined && date > dateMax) {
      const errMsg = `Invalid date: date cannot be after ${dateMax.toLocaleString()}.`;
      return [false, errMsg];
    } else {
      const result = date;
      return [true, result];
    }
  }
}

/*------------------------------------------------------------------------------------------------
 * Utilities to interact with the search form UI
 *------------------------------------------------------------------------------------------------*/

/**
 * Enables the 'Submit' button.
 */
export function enableSubmitButton() {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpEnableButton(document.getElementById('submit-btn'));
}

/**
 * Disables the 'Submit' button.
 */
export function disableSubmitButton() {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpDisableButton(document.getElementById('submit-btn'));
}

/**
 * Shows an error message related to the destination field.
 *
 * @param {string} message - The message.
 */
export function showErrorDestination(message) {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpShowError(document.getElementById('destination-error'), message);
}

/**
 * Clears an error message related to the destination field.
 */
export function clearErrorDestination() {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpClearError(document.getElementById('destination-error'));
}

/**
 * Shows an error message related to the date departing field.
 *
 * @param {string} message - The message.
 */
export function showErrorDateDeparting(message) {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpShowError(document.getElementById('date-departing-error'), message);
}

/**
 * Clears an error message related to the date departing field.
 */
export function clearErrorDateDeparting() {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpClearError(document.getElementById('date-departing-error'));
}

/**
 * Shows an error message related to the date returning field.
 *
 * @param {string} message - The message.
 */
export function showErrorDateReturning(message) {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpShowError(document.getElementById('date-returning-error'), message);
}

/**
 * Clears an error message related to the date returning field.
 */
export function clearErrorDateReturning() {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpClearError(document.getElementById('date-returning-error'));
}

/**
 * Shows an error message related to the processing of the overall form.
 *
 * @param {string} message - The message.
 */
export function showErrorSubmit(message) {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpShowError(document.getElementById('submit-error'), message);
}

/**
 * Clears an error message related to the processing of the overall form.
 */
export function clearErrorSubmit() {
  // @ts-ignore: Argument of type 'HTMLElement | null' is not assignable to ... .
  uiUtils.helpClearError(document.getElementById('submit-error'));
}

/**
 * Clears the search form.
 */
export function clearSearchForm() {
  /** @type {HTMLFormElement} */
  // @ts-ignore: Type 'HTMLFormElement | null' is not assignable to ... .
  const formElt = document.querySelector('#input-form');
  formElt.reset();
}
