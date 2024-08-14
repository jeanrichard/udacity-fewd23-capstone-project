// @ts-check
'use strict';

// 3rd party.
import * as luxon from 'luxon';

/*------------------------------------------------------------------------------------------------
 * Utilities to validate inputs
 *------------------------------------------------------------------------------------------------*/

/**
 * The maximum number of years in the future a trip can be.
 */
export const MAX_YEARS_FROM_NOW = 20;

/**
 * Validates the destination provided by the user.
 *
 * @param {string} destStr the query.
 * @returns {[boolean, string|string]} a pair (isValid, error-or-result).
 */
export function validateDestination(destStr) {
  const destTrimmed = destStr.trim();
  if (destTrimmed === '') {
    const errMsg = 'Destination cannot be empty. Please, enter a destination.';
    return [false, errMsg];
  } else {
    const result = destTrimmed;
    return [true, result];
  }
}

/**
 * Validates the date provided by the user.
 *
 * @param {string} dateStr the date (in ISO format).
 * @param {luxon.DateTime?} dateMin the min date (inclusive).
 * @param {luxon.DateTime?} dateMax the max date (inclusive).
 * @returns {[boolean, string|luxon.DateTime]} a pair (isValid, error-or-result).
 */
export function validateDate(dateStr, dateMin, dateMax) {
  const dateTrimmed = dateStr.trim();
  if (dateTrimmed === '') {
    const errMsg = 'Date cannot be empty. Please, enter a date.';
    return [false, errMsg];
  } else {
    const date = luxon.DateTime.fromISO(dateTrimmed);
    // See https://github.com/moment/luxon/blob/master/docs/validity.md.
    if (!date.isValid) {
      const errMsg = 'Date is invalid. Please, enter a valid date.';
      return [false, errMsg];
    } else if (dateMin !== null && date < dateMin) {
      const errMsg = `Date cannot be before ${dateMin.toLocaleString()}. Please, enter a valid date.`;
      return [false, errMsg];
    } else if (dateMax !== null && date > dateMax) {
      const errMsg = `Date cannot be after ${dateMax.toLocaleString()}. Please, enter a valid date.`;
      return [false, errMsg];
    } else {
      const result = date;
      return [true, result];
    }
  }
}

/*------------------------------------------------------------------------------------------------
 * Utilities to interact with the UI
 *------------------------------------------------------------------------------------------------*/

/**
 * Returns the submit button.
 * Convenience function to get the right type hint.
 *
 * @returns {HTMLInputElement} as described above.
 */
function getSubmitButton() {
  /** @type {HTMLInputElement} */
  // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
  return document.querySelector('#submit-btn');
}

/**
 * Disables the submit button.
 */
export function disableSubmit() {
  getSubmitButton().disabled = true;
}

/**
 * Enables the submit button.
 */
export function enableSubmit() {
  getSubmitButton().disabled = false;
}

/**
 * Updates an element to show an error message.
 *
 * @param {HTMLElement} errorElt the element.
 * @param {string} message the message.
 */
function helpShowError(errorElt, message) {
  errorElt.textContent = message;
  errorElt.classList.toggle('text-msg--error', /*force=*/ true);
}

/**
 * Updates an element to clear an error message.
 * @param {HTMLElement} errorElt the element.
 */
function helpClearError(errorElt) {
  errorElt.textContent = '';
  errorElt.classList.toggle('text-msg--error', /*force=*/ false);
}

/**
 * Shows an error message related to the destination field.
 * @param {string} message the message.
 */
export function showErrorDestination(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpShowError(document.getElementById('destination-error'), message);
}

/**
 * Clears an error message related to the destination field.
 */
export function clearErrorDestination() {
  // @ts-ignore: Object is possibly 'null'.
  helpClearError(document.getElementById('destination-error'));
}

/**
 * Shows an error message related to the date field.
 * @param {string} message the message.
 */
export function showErrorDateDeparting(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpShowError(document.getElementById('date-departing-error'), message);
}

/**
 * Clears an error message related to the date field.
 */
export function clearErrorDateDeparting() {
  // @ts-ignore: Object is possibly 'null'.
  helpClearError(document.getElementById('date-departing-error'));
}

/**
 * Shows an error message related to the date field.
 * @param {string} message the message.
 */
export function showErrorDateReturning(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpShowError(document.getElementById('date-returning-error'), message);
}

/**
 * Clears an error message related to the date field.
 */
export function clearErrorDateReturning() {
  // @ts-ignore: Object is possibly 'null'.
  helpClearError(document.getElementById('date-returning-error'));
}

/**
 * Shows an error message related to the processing of the overall form.
 * @param {string} message the message.
 */
export function showErrorSubmit(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpShowError(document.getElementById('submit-error'), message);
}

/**
 * Clears an error message related to the processing of the overall form.
 */
export function clearErrorSubmit() {
  // @ts-ignore: Object is possibly 'null'.
  helpClearError(document.getElementById('submit-error'));
}
