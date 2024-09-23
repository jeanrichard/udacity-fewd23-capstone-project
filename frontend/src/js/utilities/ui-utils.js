// @ts-check
'use strict';

/**
 * Disables a button.
 *
 * @param {HTMLButtonElement} button - The button.
 */
export function helpDisableButton(button) {
  button.disabled = true;
}

/**
 * Enables a button.
 *
 * @param {HTMLButtonElement} button - The button.
 */
export function helpEnableButton(button) {
  button.disabled = false;
}

/**
 * Updates an element to show an informative message.
 *
 * @param {HTMLElement} errorElt - The element.
 * @param {string} message - The message.
 */
export function helpShowInfo(errorElt, message) {
  errorElt.textContent = message;
  errorElt.classList.toggle('text-msg--info', /*force=*/ true);
}

/**
 * Updates an element to clear an informative message.
 *
 * @param {HTMLElement} errorElt - The element.
 */
export function helpClearInfo(errorElt) {
  errorElt.textContent = '';
  errorElt.classList.toggle('text-msg--info', /*force=*/ false);
}

/**
 * Updates an element to show an error message.
 *
 * @param {HTMLElement} errorElt - The element.
 * @param {string} message - The message.
 */
export function helpShowError(errorElt, message) {
  errorElt.textContent = message;
  errorElt.classList.toggle('text-msg--error', /*force=*/ true);
}

/**
 * Updates an element to clear an error message.
 *
 * @param {HTMLElement} errorElt - The element.
 */
export function helpClearError(errorElt) {
  errorElt.textContent = '';
  errorElt.classList.toggle('text-msg--error', /*force=*/ false);
}

/**
 * Sets the `textContent` on the child element of a given element.
 *
 * Note: Fails if there is not such child elemment.
 *
 * @param {HTMLElement} element - The element.
 * @param {string} selectors - The selectors to select the child element.
 * @param {string} text - The text to set.
 */
export function setText(element, selectors, text) {
  const elt = element.querySelector(selectors);
  // @ts-ignore: Object is possibly 'null'.
  elt.textContent = text;
}

/**
 * Sets the `textContent` on the child element of a given element.
 *
 * Note: Does nothing if there is not such child elemment.
 *
 * @param {HTMLElement} element - The element.
 * @param {string} selectors - The selectors to select the child element.
 * @param {string} text - The text to set.
 */
export function setTextOptional(element, selectors, text) {
  const elt = element.querySelector(selectors);
  if (elt !== null) {
    elt.textContent = text;
  }
}
