// @ts-check
'use strict';

import * as express_validator from 'express-validator';

// /**
//  * Tests whether a value is a number.
//  *
//  * @param {any} value the value to test.
//  * @returns {boolean} `true` if the test succeeds; `false` otherwise.
//  */
// function isNumber(value) {
//   return (typeof value === 'number') && !isNaN(value);
// }

/**
 * Tests if a value is a number within a given (closed) range.
 *
 * @param {any} value - The value to check.
 * @param {Object} options - The range options.
 * @param {number} [options.min] - The min bound of the range (inclusive).
 * @param {number} [options.max] - The max bound of the range (inclusive).
 *
 * @returns {boolean} Returns `true` if the test succeeds; otherwise, returns `false`.
 */
export function isNumberInRange(value, { min, max }) {
  // Check if the value is a number.
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false;
  }
  const useMin = min || Number.NEGATIVE_INFINITY;
  const useMax = max || Number.POSITIVE_INFINITY;
  // Check if the value falls within the range.
  return useMin <= value && value <= useMax;
}

/**
 * Tests if a value is an integer within a given (closed) range.
 *
 * @param {any} value - The value to check.
 * @param {Object} options - The range options.
 * @param {number} [options.min] - The min bound of the range (inclusive).
 * @param {number} [options.max] - The max bound of the range (inclusive).
 *
 * @returns {boolean} Returns `true` if the test succeeds; otherwise, returns `false`.
 */
export function isIntegerInRange(value, { min, max }) {
  // Check if the value is an integer.
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    return false;
  }
  const useMin = min || Number.NEGATIVE_INFINITY;
  const useMax = max || Number.POSITIVE_INFINITY;
  // Check if the value falls within the range.
  return useMin <= value && value <= useMax;
}

/**
 * Tests if a value is a boolean.
 *
 * @param {any} value - The value to check.
 *
 * @returns {boolean} Returns `true` if the test succeeds; otherwise, returns `false`.
 */
function isBoolean(value) {
  return typeof value === 'boolean';
}

// /**
//  * Extends a validation chain to check that the value is a floating number in a given closed range.
//  *
//  * @param {express_validator.ValidationChain} chain the validation chain to extend.
//  * @param {number} [min] the min bound of the range.
//  * @param {number} [max] the max bound of the range.
//  * @returns {express_validator.ValidationChain} as described above.
//  */
// export function validateIntInRange(chain, min, max) {
//   const minStr = (min === undefined) ? '' : `${min}`;
//   const maxStr = (max === undefined) ? '' : `${max}`;
//   return chain
//     // Must be a number (NaN not allowed).
//     .custom(isNumber)
//     .withMessage('must be a number')
//     .bail()
//     // More precisely...
//     .isInt({
//       min: min,
//       max: max,
//     })
//     .withMessage(`must be an integer in range [${minStr}, ${maxStr}]`)
//     .toInt();
// }

// /**
//  * Extends a validation chain to check that the value is a floating number in a given closed range.
//  *
//  * @param {express_validator.ValidationChain} chain the validation chain to extend.
//  * @param {number} [min] the min bound of the range.
//  * @param {number} [max] the max bound of the range.
//  * @returns {express_validator.ValidationChain} as described above.
//  */
// export function validateFloatInRange(chain, min, max) {
//   const minStr = (min === undefined) ? '' : `${min}`;
//   const maxStr = (max === undefined) ? '' : `${max}`;
//   return chain
//     // Must be a number (NaN not allowed).
//     .custom(isNumber)
//     .withMessage('must be a number')
//     .bail()
//     // More precisely...
//     .isFloat({
//       min: min,
//       max: max,
//       locale: 'en-US', // Use '.' as the decimal separator.
//     })
//     .withMessage(`must be a floating point number in range [${minStr}, ${maxStr}]`)
//     .toFloat();
// }

// /**
//  * Extends a validation chain to check that the value is a non-blank string.
//  *
//  * @param {express_validator.ValidationChain} chain the validation chain to extend.
//  * @param {number} maxLength the max number of characters.
//  * @returns {express_validator.ValidationChain} as described above.
//  */
// export function validateStringNotBlank(chain, maxLength = 256) {
//   return chain
//     // Must be a string.
//     .isString()
//     .withMessage('must be a string')
//     .bail()
//     // More precisely...
//     .isLength({
//       max: maxLength,
//     })
//     .withMessage(`must be ${maxLength} character(s) or less`)
//     .trim()
//     .notEmpty()
//     .withMessage('must not be empty or contain only whitespace characters');
// }

/**
 * Returns a validation schem to check that a value is a number in a given closed range.
 *
 * @param {Object} options - The range options.
 * @param {number} [options.min] - The min bound of the range.
 * @param {number} [options.max] - The max bound of the range.
 *
 * @returns {object} As described above.
 */
export function schemaNumberInRange({ min, max }) {
  const minStr = min === undefined ? '' : `${min}`;
  const maxStr = max === undefined ? '' : `${max}`;
  return {
    custom: {
      options: (value) => isNumberInRange(value, { min, max }),
      errorMessage: `must be a number in range [${minStr}, ${maxStr}]`,
    },
  };
}

// // Helper function to validate numbers in a specified range
// function schemaNumberInRange({ min, max }) {
//   const minStr = (min === undefined) ? '' : `${min}`;
//   const maxStr = (max === undefined) ? '' : `${max}`;
//   return {
//     custom: {
//       options: (value) => typeof value === 'number' && !isNaN(value) && (min === undefined || value >= min) && (max === undefined || value <= max),
//       errorMessage: `must be a number in range [${minStr}, ${maxStr}]`,
//     },
//   };
// }

/**
 * Returns a validation schem to check that a value is an integer in a given closed range.
 *
 * @param {Object} options - The range options.
 * @param {number} [options.min] - The min bound of the range.
 * @param {number} [options.max] - The max bound of the range.
 *
 * @returns {object} as described above.
 */
export function schemaIntegerInRange({ min, max }) {
  const minStr = min === undefined ? '' : `${min}`;
  const maxStr = max === undefined ? '' : `${max}`;
  return {
    custom: {
      options: (value) => isIntegerInRange(value, { min, max }),
      errorMessage: `must be an integer in range [${minStr}, ${maxStr}]`,
    },
  };
}

/**
 * Returns a validation schema to check that a value is a boolean.
 *
 * @returns {object} as described above.
 */
export function schemaBoolean() {
  return {
    custom: {
      options: isBoolean,
      errorMessage: 'must be a boolean',
    },
  };
}

/**
 * Similar but returns a schema.
 *
 */
export function schemaStringNotBlank({ max = 256 }) {
  return {
    isString: {
      errorMessage: 'must be a string',
    },
    isLength: {
      options: { max: max },
      errorMessage: `must be ${max} character(s) or less`,
    },
    trim: true, // Automatically trims the value
    notEmpty: {
      errorMessage: 'must not be empty or contain only whitespace characters',
    },
  };
}
