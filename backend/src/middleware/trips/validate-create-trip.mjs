// @ts-check
'use strict';

// 3rd party.
import { checkSchema } from 'express-validator';

// Project.
import {
  schemaBoolean,
  schemaIntegerInRange,
  schemaNumberInRange,
  schemaStringNotBlank,
} from '../common/validator-utils.mjs';

// Schema for a (value) temperature.
const schemaValTemp = schemaNumberInRange({ min: -90.0, max: +60.0 });

// Schema for a (value) timestamp.
const schemaValTimestamp = schemaIntegerInRange({ min: 0 });

// White-list of WeatherBit hostnames.
const VALID_WEATHERBIT_HOSTNAMES = new Set(['cdn.weatherbit.io']);

// White-list of Pixabay hostnames.
const VALID_PIXABAY_HOSTNAMES = new Set(['pixabay.com', 'cdn.pixabay.com']);

// Schema for a `Destination` object (see 'types/typedefs.mjs').
const schemaObjDestination = {
  lon: schemaNumberInRange({ min: -180.0, max: +180.0 }),
  lat: schemaNumberInRange({ min: -90.0, max: +90.0 }),
  name: {
    ...schemaStringNotBlank({ max: 256 }),
    escape: true,
  },
  countryName: {
    ...schemaStringNotBlank({ max: 256 }),
    escape: true,
  },
};

// Schema for a `Weather` object (see 'types/typedefs.mjs').
const schemaObjWeather = {
  isCurrent: schemaBoolean(),
  temp: schemaValTemp,
  tempMin: {
    ...schemaValTemp,
    optional: true,
  },
  tempMax: {
    ...schemaValTemp,
    optional: true,
  },
  'desc.desc': {
    ...schemaStringNotBlank({ max: 256 }),
    escape: true,
  },
  'desc.iconUrl': {
    isURL: {
      errorMessage: 'must be a valid URL',
    },
    custom: {
      options: (value) => {
        const hostname = new URL(value).hostname;
        return VALID_WEATHERBIT_HOSTNAMES.has(hostname);
      },
      errorMessage: 'must be an approved URL',
    },
  },
};

// Schema for a `Picture` object (see 'types/typedefs.mjs').
const schemaObjPicture = {
  imageUrl: {
    isURL: {
      errorMessage: 'must be a valid URL',
    },
    custom: {
      options: (value) => {
        const hostname = new URL(value).hostname;
        return VALID_PIXABAY_HOSTNAMES.has(hostname);
      },
      errorMessage: 'must be an approved URL',
    },
  },
};

// Trip.
const schemaObjTrip = {
  destination: {
    isObject: true,
    custom: {
      options: (/** @type { object }*/ value) => {
        return checkSchema(schemaObjDestination).run({ body: value });
      },
    },
  },
  dateDeparting: schemaValTimestamp,
  dateReturning: schemaValTimestamp,
  weather: {
    isObject: true,
    custom: {
      options: (/** @type { object }*/ value) => {
        return checkSchema(schemaObjWeather).run({ body: value });
      },
    },
  },
  picture: {
    isObject: true,
    custom: {
      options: (/** @type { object }*/ value) => {
        return checkSchema(schemaObjPicture).run({ body: value });
      },
    },
  },
};

/**
 * Builds the validation chain for a request to create a trip.
 *
 * @returns {Array<import('express-validator').ValidationChain>} As described above.
 */
export function validateCreateTrip() {
  return checkSchema(schemaObjTrip, ['body']);
}
