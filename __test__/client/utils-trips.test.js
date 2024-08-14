/** @jest-environment jsdom */
// @ts-check
'use strict';

// 3rd party.
import * as luxon from 'luxon';

import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import { afterEach, beforeEach, describe, expect, jest, it } from '@jest/globals';

import { WEATHER_KIND_CURRENT, WEATHER_KIND_FORECAST, IMAGE_DESC, tripEltFromObj } from '../../src/client/js/utils-trip.js';

/**
 * Returns a subset of 'index.html' useful for the test.
 * @returns {string} as described above.
 */
function makeTripSnippet() {
  return `
  <article class="trip">
    <div class="trip__image"></div>
    <header class="trip__header">
      <h3>
        My trip to <span class="name"></span>, <span class="country-name"></span>, departing
        <span class="date-departing"></span>
      </h3>
    </header>
    <div class="trip__content">
      <div class="trip__details">
        <p>
          My trip to <span class="name"></span>, <span class="country-name"></span>, is
          <span class="num-days"></span> day(s) away.
        </p>
        <p>Departing: <span class="date-departing"></span></p>
        <p>Returning: <span class="date-returning"></span></p>
      </div>
      <div class="trip__weather" data-weather-kind="current">
        <div class="trip__weather-current">
          <p class="trip__weather-about">Current weather is:</p>
          <p class="trip__weather-temp"><span class="temp"></span>&deg;C</p>
          <p class="trip__weather-desc"></p>
          <div class="trip__weather-icon"></div>
        </div>
        <div class="trip__weather-forecast">
          <p class="trip__weather-about">Typical weather for then is:</p>
          <p class="trip__weather-temp">
            <span class="temp"></span>&deg;C (min: <span class="temp-min"></span>&deg;C, max:
            <span class="temp-max"></span>&deg;C)
          </p>
          <p class="trip__weather-desc"></p>
          <div class="trip__weather-icon"></div>
        </div>
      </div>
      <div class="trip__buttons">
        <button class="trip__btn trip__btn-save" title="Save trip" type="submit">Save</button>
        <button class="trip__btn trip__btn-remove" title="Remove trip" type="submit">
          Remove
        </button>
      </div>
    </div>
  </article>
  `;
}

function makeTripObjCurrent(dateDeparting, dateReturning) {
  return {
    destination: {
      lon: "7.13476",
      lat: "47.11682",
      name: 'Lamboing',
      countryName: 'Switzerland',
    },
    dateDeparting: dateDeparting.toMillis(),
    dateReturning: dateReturning.toMillis(),
    weather: {
      isCurrent: true,
      temp: "17.1",
      tempMin: null,
      tempMax: null,
      desc: {
        desc: "Overcast clouds",
        iconUrl: "https://cdn.weatherbit.io/static/img/icons/c04d.png",
      }
    },
    picture: {
      imageUrl: "https://cdn.pixabay.com/photo/2023/11/25/15/45/mountains-8411954_150.jpg"
    }
  };
}

function makeTripObjForecast(dateDeparting, dateReturning) {
  return {
    destination: {
      lon: "7.13476",
      lat: "47.11682",
      name: 'Lamboing',
      countryName: 'Switzerland',
    },
    dateDeparting: dateDeparting.toMillis(),
    dateReturning: dateReturning.toMillis(),
    weather: {
      isCurrent: false,
      temp: "16.1",
      tempMin: "14.5",
      tempMax: "18.1",
      desc: {
        desc: "Broken clouds",
        iconUrl: "https://cdn.weatherbit.io/static/img/icons/c03d.png",
      }
    },
    picture: {
      imageUrl: "https://cdn.pixabay.com/photo/2023/11/25/15/45/mountains-8411954_150.jpg"
    }
  };
}

describe('Testing functionality to get an HTML trip from an object ', () => {

  it('populates an HTML trip fragment (weather: current)', () => {
    // Arrange.

    const dateDeparting = luxon.DateTime.fromISO('2024-08-16');
    const dateReturning = luxon.DateTime.fromISO('2024-08-17');

    // Setup the document body.
    const tripSnippet = makeTripSnippet();
    const tripObj = makeTripObjCurrent(dateDeparting, dateReturning);
    const now = luxon.DateTime.fromISO('2024-08-15');

    document.body.innerHTML = tripSnippet;
    /** @type {HTMLElement} */
    // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
    const tripElt = document.querySelector('.trip');
    expect(tripElt).not.toBeNull(); // We make sure that the test is properly configured.

    // Act.

    tripEltFromObj(tripElt, tripObj, now);
    // console.debug(document.body.innerHTML);

    // Assert.

    // Image.
    /** @type {HTMLImageElement} */
    // @ts-ignore Type 'HTMLImageElement | null' is not assignable ... .
    const imageElt = tripElt.querySelector('.trip__image img');
    expect(imageElt.alt).toBe(IMAGE_DESC);
    expect(imageElt.src).toBe(tripObj.picture.imageUrl);

    // Header.
    expect(tripElt.querySelector('.trip__header .name')?.textContent).toBe(tripObj.destination.name);
    expect(tripElt.querySelector('.trip__header .country-name')?.textContent).toBe(tripObj.destination.countryName);
    expect(tripElt.querySelector('.trip__header .date-departing')?.textContent).toBe(dateDeparting.toLocaleString());

    // Details.
    expect(tripElt.querySelector('.trip__details .name')?.textContent).toBe(tripObj.destination.name);
    expect(tripElt.querySelector('.trip__details .country-name')?.textContent).toBe(tripObj.destination.countryName);
    expect(tripElt.querySelector('.trip__details .num-days')?.textContent).toBe('1');
    expect(tripElt.querySelector('.trip__details .date-departing')?.textContent).toBe(dateDeparting.toLocaleString());
    expect(tripElt.querySelector('.trip__details .date-returning')?.textContent).toBe(dateReturning.toLocaleString());

    // Weather.
    expect(tripElt.querySelector('.trip__weather')?.getAttribute('data-weather-kind')).toBe(WEATHER_KIND_CURRENT);
    expect(tripElt.querySelector('.trip__weather-current .temp')?.textContent).toBe(tripObj.weather.temp);
    expect(tripElt.querySelector('.trip__weather-current .trip__weather-desc')?.textContent).toBe(tripObj.weather.desc.desc);

    /** @type {HTMLImageElement} */
    // @ts-ignore Type 'HTMLImageElement | null' is not assignable ... .
    const iconElt = tripElt.querySelector('.trip__weather-current .trip__weather-icon img');
    expect(iconElt.alt).toBe(tripObj.weather.desc.desc);
    expect(iconElt.src).toBe(tripObj.weather.desc.iconUrl);
  });

  it('populates an HTML trip fragment (weather: forecast)', () => {
    // Arrange.

    const dateDeparting = luxon.DateTime.fromISO('2024-08-16');
    const dateReturning = luxon.DateTime.fromISO('2024-08-17');

    // Setup the document body.
    const tripSnippet = makeTripSnippet();
    const tripObj = makeTripObjForecast(dateDeparting, dateReturning);
    const now = luxon.DateTime.fromISO('2024-08-15');

    document.body.innerHTML = tripSnippet;
    /** @type {HTMLElement} */
    // @ts-ignore: Type 'HTMLInputElement | null' is not assignable ... .
    const tripElt = document.querySelector('.trip');
    expect(tripElt).not.toBeNull(); // We make sure that the test is properly configured.

    // Act.
    tripEltFromObj(tripElt, tripObj, now);
    // console.debug(document.body.innerHTML);

    // Assert.

    // Weather.
    expect(tripElt.querySelector('.trip__weather')?.getAttribute('data-weather-kind')).toBe(WEATHER_KIND_FORECAST);
    expect(tripElt.querySelector('.trip__weather-forecast .temp')?.textContent).toBe(tripObj.weather.temp);
    expect(tripElt.querySelector('.trip__weather-forecast .temp-min')?.textContent).toBe(tripObj.weather.tempMin);
    expect(tripElt.querySelector('.trip__weather-forecast .temp-max')?.textContent).toBe(tripObj.weather.tempMax);
    expect(tripElt.querySelector('.trip__weather-forecast .trip__weather-desc')?.textContent).toBe(tripObj.weather.desc.desc);

    /** @type {HTMLImageElement} */
    // @ts-ignore Type 'HTMLImageElement | null' is not assignable ... .
    const iconElt = tripElt.querySelector('.trip__weather-forecast .trip__weather-icon img');
    expect(iconElt.alt).toBe(tripObj.weather.desc.desc);
    expect(iconElt.src).toBe(tripObj.weather.desc.iconUrl);
  });
});
