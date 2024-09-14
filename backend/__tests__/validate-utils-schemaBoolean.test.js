// @ts-check
'use strict';

// 3rd party.
import { describe, expect, it } from '@jest/globals';
import { checkSchema, validationResult } from 'express-validator';

// Project.
import { schemaBoolean } from '../src/middleware/common/validator-utils.mjs';

describe('schemaBoolean validation schema', () => {
  it.each([true, false])('should validate %s', async (value) => {
    // Arrange.
    const req = {
      body: {
        value,
      },
    };

    // Act: Run the schema validation.
    const schema = checkSchema({ value: schemaBoolean() });
    await schema.run(req);

    // Assert: Check the validation results.
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      console.log(errors);
    }
    expect(errors.isEmpty()).toBe(true);
  });

  it.each([1, 0, 'true', 'false', 'yes', 'no'])('should not validate %s', async (value) => {
    // Arrange.
    const req = {
      body: {
        value,
      },
    };

    // Act: Run the schema validation.
    const schema = checkSchema({ value: schemaBoolean() });
    await schema.run(req);

    // Assert: Check the validation results.
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });
});
