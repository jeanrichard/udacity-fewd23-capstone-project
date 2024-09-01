// @ts-check
'use strict';

// 3rd  party.
import { checkSchema } from 'express-validator';

// Project.
import { schemaNumberInRange, schemaIntegerInRange } from '../../utilities/validate-utils.mjs';

// Validation schema for a request to find the weather for a location.
const schemaGetWeather = {
  lon: schemaNumberInRange({ min: -180.0, max: +180.0 }),
  lat: schemaNumberInRange({ min: -90.0, max: +90.0 }),
  numDays: schemaIntegerInRange({ min: 0 }),
};

/**
 * Builds the validation chain for a request to find the weather for a location.
 *
 * @returns {Array<import('express-validator').ValidationChain>} As described above.
 */
export function validateGetWeather() {
  return checkSchema(schemaGetWeather, ['body']);
}
