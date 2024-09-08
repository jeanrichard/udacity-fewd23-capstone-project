// @ts-check
'use strict';

// 3rd party.
import { describe, expect, it } from '@jest/globals';
import { checkSchema, validationResult } from 'express-validator';

// Project.
import { schemaIntegerInRange } from '../src/utilities/validate-utils.mjs';

describe('schemaIntegerInRange validation schema', () => {

  it.each([
    [123, { min: undefined, max: undefined }],
    [123, { min: undefined, max: 124 }],
    [124, { min: undefined, max: 124 }],
    [123, { min: 122, max: undefined }],
    [122, { min: 122, max: undefined }],
    [123, { min: 122, max: 124 }],
  ])('should validate %s with range %s', async (value, options) => {
    // Arrange.
    const req = {
      body: {
        value,
      }
    };

    // Act.
    
    // Run the schema validation.
    const schema = checkSchema({ value: schemaIntegerInRange(options) });
    await schema.run(req);

    // Assert.

    // Check the validation results.
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      console.log(errors);
    }
    expect(errors.isEmpty()).toBe(true);
  });

  it.each([
    [123.45, { min: 122, max: 124 }],
    ["123", { min: 122, max: 124 }],
    [125, { min: undefined, max: 124 }],
    [121, { min: 122, max: undefined }],
    [121, { min: 122, max: 124 }],
    [125, { min: 122, max: 124 }],
  ])('should not validate %s with range %s', async (value, options) => {
    // Arrange.
    const req = {
      body: {
        value,
      }
    };

    // Act.
    
    // Run the schema validation.
    const schema = checkSchema({ value: schemaIntegerInRange(options) });
    await schema.run(req);

    // Assert.

    // Check the validation results.
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });
});
