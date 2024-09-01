// @ts-check
'use strict';

// 3rd party.
import { checkSchema } from 'express-validator';

// Validation schema for a request to delete a trip given by its `tripId`.
const schemaDeleteTrip = {
  tripId: {
    isUUID: {
      errorMessage: 'must be a valid trip ID',
    },
  },
};

/**
 * Builds the validation chain for a request to delete a trip given by its `tripId`.
 *
 * @returns {Array<import('express-validator').ValidationChain>} As described above.
 */
export function validateDeleteTrip() {
  return checkSchema(schemaDeleteTrip, ['params']);
}
