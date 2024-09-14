// @ts-check
'use strict';

// 3rd party.
import { describe, expect, it } from '@jest/globals';
import { checkSchema, validationResult } from 'express-validator';

// Project.
import { schemaNumberInRange } from '../src/middleware/common/validator-utils.mjs';

describe('schemaNumberInRange validation schema', () => {
  it.each([
    [123.45, { min: undefined, max: undefined }],
    [123.45, { min: undefined, max: 123.5 }],
    [123.5, { min: undefined, max: 123.5 }],
    [123.45, { min: 123.4, max: undefined }],
    [123.4, { min: 123.4, max: undefined }],
    [123.45, { min: 123.4, max: 123.5 }],
  ])('should validate %s with range %s', async (value, options) => {
    // Arrange.
    const req = {
      body: {
        value,
      },
    };

    // Act: Run the schema validation.
    const schema = checkSchema({ value: schemaNumberInRange(options) });
    await schema.run(req);

    // Assert: Check the validation results.
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      console.log(errors);
    }
    expect(errors.isEmpty()).toBe(true);
  });

  it.each([
    [Number.NEGATIVE_INFINITY, { min: undefined, max: undefined }],
    [Number.NEGATIVE_INFINITY, { min: undefined, max: undefined }],
    [Number.NaN, { min: undefined, max: undefined }],
    ['123.45', { min: 123.4, max: 123.5 }],
    [123.55, { min: undefined, max: 123.5 }],
    [123.35, { min: 123.4, max: undefined }],
    [124.35, { min: 123.4, max: 123.5 }],
    [122.55, { min: 123.4, max: 123.5 }],
  ])('should not validate %s with range %s', async (value, options) => {
    // Arrange.
    const req = {
      body: {
        value,
      },
    };

    // Act: Run the schema validation.
    const schema = checkSchema({ value: schemaNumberInRange(options) });
    await schema.run(req);

    // Assert: Check the validation results.
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });
});
