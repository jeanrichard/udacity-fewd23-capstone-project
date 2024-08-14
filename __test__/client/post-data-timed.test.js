// @ts-check
'use strict';

// 3rd party.
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

// Project.
import { postData } from '../../src/client/js/utils.js';

describe('Testing functionality to POST a request and return a pair (response, JSON) in the face of fetch timeouts', () => {
  beforeEach(() => {
    // Fetch.
    // @ts-ignore: Property 'resetMocks' does not exist on type ... .
    fetch.resetMocks();
    // @ts-ignore: Property 'doMock' does not exist on type ... .
    fetch.doMock();
    // Timers.
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Timers.
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    // Mocks.
    jest.clearAllMocks();
  });

  it("throws a DOMException with name 'AbortError' if 'fetch' is aborted", async () => {
    // @ts-ignore: Property 'mockAbortOnce' does not exist on type ... .
    fetch.mockAbortOnce();
    await expect(postData('https://example.com/')).rejects.toThrow('The operation was aborted.');
  });

  it("throws a DOMException with name 'AbortError' if the timeout is exceeded", async () => {
    // @ts-ignore: Property 'mockResponseOnce' does not exist on type ... .
    fetch.mockResponseOnce(async () => {
      jest.advanceTimersByTime(/*msTorun=*/ 20);
      return '';
    });
    await expect(postData('https://example.com/', /*data=*/ {}, /*timeoutMs=*/ 10)).rejects.toThrow(
      'The operation was aborted.',
    );
  });
});
