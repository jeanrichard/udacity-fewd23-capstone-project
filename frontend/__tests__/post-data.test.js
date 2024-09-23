// @ts-check
'use strict';

// 3rd party.
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

// Project.
import { timedPostData } from '../src/js/utilities/utils';

const MOCK_DATA = {
  value: 42,
};

describe('Testing functionality to POST a request and return a pair (response, JSON) in the face of fetch errors', () => {
  beforeEach(() => {
    // Fetch.
    // @ts-ignore: Property 'resetMocks' does not exist on type ... .
    fetch.resetMocks();
    // @ts-ignore: Property 'doMock' does not exist on type ... .
    fetch.doMock();
  });

  afterEach(() => {
    // Mocks.
    jest.clearAllMocks();
  });

  it('throws the exception thrown by fetch', async () => {
    // @ts-ignore: Property 'mockRejectOnce' does not exist on type ... .
    fetch.mockRejectOnce('network is down');

    expect.assertions(1); // We should go to the 'catch' block.
    try {
      await timedPostData('https//example.com/');
    } catch (err) {
      expect(err).toMatch('network is down');
    }
  });

  it('returns a pair (response, null) if the server does not send JSON', async () => {
    // @ts-ignore: Property 'mockRejectOnce' does not exist on type ... .
    fetch.mockResponseOnce('not-a-valid-JSON-string', 404);
    const [_res, resData] = await timedPostData('http://example.com/');
    expect(resData).toBeNull();
  });

  it('returns a pair (response, JSON) if the server sends JSON', async () => {
    /** @ts-ignore: Property 'mockRejectOnce' does not exist on type ... */
    fetch.mockResponseOnce(JSON.stringify(MOCK_DATA));
    const [_res, resData] = await timedPostData('http://example.com/');
    expect(resData).not.toBeNull();
    expect(resData).toStrictEqual(MOCK_DATA);
  });
});
