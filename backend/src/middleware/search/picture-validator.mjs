// @ts-check
'use strict';

// 3rd party.
import { checkSchema } from 'express-validator';

// Project.
import { schemaStringNotBlank } from '../common/validator-utils.mjs';

// Validation schema for a request to find a picture for a location.
const schemaGetPicture = {
  name: schemaStringNotBlank({ max: 256 }),
  countryName: schemaStringNotBlank({ max: 256 }),
};

/**
 * Builds the validation chain for a request to find a picture for a location.
 *
 * @returns {Array<import('express-validator').ValidationChain>} As described above.
 */
export function validateGetPicture() {
  return checkSchema(schemaGetPicture, ['body']);
}
