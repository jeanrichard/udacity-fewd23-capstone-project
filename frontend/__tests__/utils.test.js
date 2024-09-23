// @ts-check
'use strict';

// 3rd party.
import * as luxon from 'luxon';

import { describe, expect, it } from '@jest/globals';
import { getNumRemainingDays } from '../src/js/utilities/utils';

describe("Testing 'getNumRemainingDays'", () => {
  it('is a function', () => {
    expect(getNumRemainingDays).toEqual(expect.any(Function));
  });

  const nowStr = '2024-08-08T12:00:00';

  it.each([
    // date, now, expected
    ['2024-08-06T12:00:00', nowStr, -2],
    ['2024-08-07T12:00:00', nowStr, -1],
    ['2024-08-08T00:00:00', nowStr, 0],
    ['2024-08-08T06:00:00', nowStr, 0],
    ['2024-08-08T12:00:00', nowStr, 0],
    ['2024-08-08T18:00:00', nowStr, 0],
    ['2024-08-08T23:59:59', nowStr, 0],
    ['2024-08-08T24:00:00', nowStr, 1],
    ['2024-08-09T12:00:00', nowStr, 1],
    ['2024-08-10T12:00:00', nowStr, 2],
  ])('date=%s, now=%s', (dateStr, nowStr, expected) => {
    const date = luxon.DateTime.fromISO(dateStr);
    const now = luxon.DateTime.fromISO(nowStr);
    expect(getNumRemainingDays(date, now)).toBe(expected);
  });
});
