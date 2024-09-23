// @ts-check
'use strict';

// 3rd party.
import * as luxon from 'luxon';
import { describe, expect, it } from '@jest/globals';

// Project.
import { validateDate, validateDestination } from '../src/js/search-form/search-form-utils';

/*------------------------------------------------------------------------------------------------
 * Utilities to validate inputs
 *------------------------------------------------------------------------------------------------*/

describe("Testing 'validateDestination'", () => {
  it('is a function', () => {
    expect(validateDestination).toEqual(expect.any(Function));
  });

  it('detects when the destination is empty', () => {
    // Arrange.
    const destStr = '';
    // Act.
    const [isValid, value] = validateDestination(destStr);
    // Assert.
    expect(isValid).toBe(false);
    expect(value).toEqual(expect.any(String));
    expect(value).toMatch(/^Please, enter a destination/);
  });

  it('detects when the destination is blank', () => {
    // Arrange.
    const destStr = '  '; // Only whitespaces.
    // Act.
    const [isValid, value] = validateDestination(destStr);
    // Assert.
    expect(isValid).toBe(false);
    expect(value).toEqual(expect.any(String));
    expect(value).toMatch(/^Please, enter a destination/);
  });

  it('return the result when valid', () => {
    // Arrange.
    const destStr = '  some-destination  ';
    // Act.
    const [isValid, value] = validateDestination(destStr);
    // Assert.
    expect(isValid).toBe(true);
    expect(value).toEqual(expect.any(String));
    expect(value).toBe('some-destination');
  });
});

describe("Testing 'validateDate'", () => {
  it('is a function', () => {
    expect(validateDate).toEqual(expect.any(Function));
  });

  const now = luxon.DateTime.fromISO('2024-08-08T12:00:00');

  it('detects when the date is empty', () => {
    // Arrange.
    const dateStrUt = '';
    // Act.
    const [isValid, value] = validateDate(dateStrUt, {});
    // Assert.
    expect(isValid).toBe(false);
    expect(value).toEqual(expect.any(String));
    expect(value).toMatch(/^Please, enter a date/);
  });

  it('detects when the date is blank', () => {
    // Arrange.
    const dateStrUt = '   '; // Only whitespaces.
    // Act.
    const [isValid, value] = validateDate(dateStrUt, {});
    // Assert.
    expect(isValid).toBe(false);
    expect(value).toEqual(expect.any(String));
    expect(value).toMatch(/^Please, enter a date/);
  });

  const nowStr = '2024-08-08T12:00:00';

  it('detects when the date is invalid', () => {
    // Arrange.
    const dateStrUt = '  2024-Aug-08  ';
    // Act.
    const [isValid, value] = validateDate(dateStrUt, {});
    // Assert.
    expect(isValid).toBe(false);
    expect(value).toEqual(expect.any(String));
    expect(value).toMatch(/^Invalid date/);
  });

  it('detects when the date is in the past', () => {
    // Arrange.
    const dateStrUt = now.minus({ days: 1 }).toISODate() || ''; // For typing.
    // Act.
    const [isValid, value] = validateDate(dateStrUt, { dateMin: now });
    // Assert.
    expect(isValid).toBe(false);
    expect(value).toEqual(expect.any(String));
    expect(value).toMatch(/^Invalid date: date cannot be before/);
  });

  it('detects when the date is too many years in the future', () => {
    // Arrange.
    const dateStrUt = now.plus({ days: 1 }).toISODate() || ''; // For typing.
    // Act.
    const [isValid, value] = validateDate(dateStrUt, { dateMax: now });
    // Assert.
    expect(isValid).toBe(false);
    expect(value).toEqual(expect.any(String));
    expect(value).toMatch(/^Invalid date: date cannot be after/);
  });
});
