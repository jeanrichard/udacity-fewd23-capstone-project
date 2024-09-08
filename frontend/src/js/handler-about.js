// @ts-check
'use strict';

/**
 * Handles a click event on the 'About' link.
 * @param {Event} event the click event.
 */
export function handleAbout(event) {
  console.log('::: About information requested :::');

  alert(
    [
      'Front End Web Developer Udacity Nanodegree 2023-2024',
      'Capstone Project: Travel Planner',
    ].join('\n'),
  );
}
