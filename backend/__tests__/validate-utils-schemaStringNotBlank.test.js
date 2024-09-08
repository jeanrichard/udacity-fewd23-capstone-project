// @ts-check
'use strict';

// 3rd party.
import { describe, expect, it } from '@jest/globals';
import { checkSchema, validationResult } from 'express-validator';

// Project.
import { schemaStringNotBlank } from '../src/utilities/validate-utils.mjs';

describe('schemaStringNotBlank validation schema', () => {

  it.each([
    ["text", { max: undefined }],
    ["text", { max: 8 }],
    ["  text  ", { max: undefined }],
    ["  text  ", { max: 8 }],
  ])("should validate '%s' with %s", async (value, options) => {
    // Arrange.
    const req = {
      body: {
        value,
      }
    };

    // Act.
    
    // Run the schema validation.
    const schema = checkSchema({ value: schemaStringNotBlank(options) });
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
    [123, { max: undefined }],
    ["", { max: undefined }],
    ["  ", { max: undefined }],
    ["  text  ", { max: 6 }],
  ])("should not validate '%s' with %s", async (value, options) => {
    // Arrange.
    const req = {
      body: {
        value,
      }
    };

    // Act.
    
    // Run the schema validation.
    const schema = checkSchema({ value: schemaStringNotBlank(options) });
    await schema.run(req);

    // Assert.

    // Check the validation results.
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });
});
