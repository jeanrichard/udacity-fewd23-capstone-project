// @ts-check
'use strict';

// 3rd party.
import { checkSchema } from 'express-validator';

// Project.
import { schemaStringNotBlank } from '../common/validator-utils.mjs';

// Validation schema for a request to find a destination.
const schemaGetDestination = {
  query: schemaStringNotBlank({ max: 256 }),
};

/**
 * Builds the validation chain for a request to find a destination.
 *
 * @returns {Array<import('express-validator').ValidationChain>} As described above.
 */
export function validateGetDestination() {
  return checkSchema(schemaGetDestination, ['body']);
}
