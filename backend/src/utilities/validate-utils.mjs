// @ts-check
'use strict';

/**
 * Tests if a value is a number within a given (closed) range.
 *
 * @param {any} value - The value to check.
 * @param {Object} options - The range options.
 * @param {number} [options.min] - The lower bound of the range (inclusive).
 * @param {number} [options.max] - The upper bound of the range (inclusive).
 *
 * @returns {boolean} Returns `true` if the test succeeds; otherwise, returns `false`.
 */
export function _isNumberInRange(value, { min, max }) {
  // Check if the value is a number.
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false;
  }
  // Check if the value falls within the range.
  return (min === undefined || min <= value) && (max === undefined || value <= max);
}

/**
 * Tests if a value is an integer within a given (closed) range.
 *
 * @param {any} value - The value to check.
 * @param {Object} options - The range options.
 * @param {number} [options.min] - The lower bound of the range (inclusive).
 * @param {number} [options.max] - The upper bound of the range (inclusive).
 *
 * @returns {boolean} Returns `true` if the test succeeds; otherwise, returns `false`.
 */
export function _isIntegerInRange(value, { min, max }) {
  // Check if the value is an integer.
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    return false;
  }
  // Check if the value falls within the range.
  return (min === undefined || min <= value) && (max === undefined || value <= max);
}

/**
 * Tests if a value is a boolean.
 *
 * @param {any} value - The value to check.
 *
 * @returns {boolean} Returns `true` if the test succeeds; otherwise, returns `false`.
 */
export function _isBoolean(value) {
  return typeof value === 'boolean';
}

/**
 * Returns a validation schema to ensure that a value is a number within a given (closed) range.
 *
 * @param {Object} options - The range options.
 * @param {number} [options.min] - The lower bound of the range (inclusive).
 * @param {number} [options.max] - The upper bound of the range (inclusive).
 *
 * @returns {object} As described above.
 */
export function schemaNumberInRange({ min, max }) {
  const minStr = (min === undefined) ? '' : `${min}`;
  const maxStr = (max === undefined) ? '' : `${max}`;
  return {
    custom: {
      options: (/** @type {any} */ value) => _isNumberInRange(value, { min, max }),
      errorMessage: `must be a number in range [${minStr}, ${maxStr}]`,
    },
  };
}

/**
 * Returns a validation schema to ensure that a value is an integer within a given (closed) range.
 *
 * @param {Object} options - The range options.
 * @param {number} [options.min] - The lower bound of the range (inclusive).
 * @param {number} [options.max] - The upper bound of the range (inclusive).
 *
 * @returns {object} as described above.
 */
export function schemaIntegerInRange({ min, max }) {
  const minStr = (min === undefined) ? '' : `${min}`;
  const maxStr = (max === undefined) ? '' : `${max}`;
  return {
    custom: {
      options: (/** @type {any} */ value) => _isIntegerInRange(value, { min, max }),
      errorMessage: `must be an integer in range [${minStr}, ${maxStr}]`,
    },
  };
}

/**
 * Returns a validation schema to ensure that a value is a boolean.
 *
 * @returns {object} as described above.
 */
export function schemaBoolean() {
  return {
    custom: {
      options: _isBoolean,
      errorMessage: 'must be a boolean',
    },
  };
}

/**
 * Returns a validation schema to ensure that a value is a string, that its length does not exceed
 * `max` characters, and that it does not consist only of white-space characters.
 * 
 * @param {Object} options - The range options.
 * @param {number} [options.min] - The lower bound of the range (inclusive).
 * @param {number} [options.max] - The upper bound of the range (inclusive).
 *
 * @returns {object} as described above.
 *
 */
export function schemaStringNotBlank({ max = 256 }) {
  return {
    isString: {
      errorMessage: 'must be a string',
    },
    isLength: {
      options: { max },
      errorMessage: `length must not exceed ${max} character(s)`,
    },
    isEmpty: {
      negated: true,
      options: { ignore_whitespace: true },
      errorMessage: 'must not be empty or contain only whitespace characters',
    },
    trim: true,
  };
}
