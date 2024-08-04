// @ts-check
'use strict';

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
  errorElt.classList.toggle('error-msg--active', /*force=*/ true);
}

/**
 * Updates an element to clear an error message.
 * @param {HTMLElement} errorElt the element.
 */
function helpClearError(errorElt) {
  errorElt.textContent = '';
  errorElt.classList.toggle('error-msg--active', /*force=*/ false);
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
export function showErrorDate(message) {
  // @ts-ignore: Object is possibly 'null'.
  helpShowError(document.getElementById('date-error'), message);
}

/**
 * Clears an error message related to the date field.
 */
export function clearErrorDate() {
  // @ts-ignore: Object is possibly 'null'.
  helpClearError(document.getElementById('date-error'));
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
