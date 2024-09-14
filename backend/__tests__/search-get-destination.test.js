// @ts-check
'use strict';

// 3rd party.
import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';

// Project.
import { createApp } from '../src/app.mjs';
import config from '../src/config/config.mjs';

// We mock __filename and __dirname.
// (When running the tests, the current working directory seems to be the 'backend' directory.)
jest.mock('../src/utilities/path-utils.mjs', () => ({
  __filename: 'src/utilities/path-utils.mjs',
  __dirname: 'src/utilities',
}));

describe('POST /search/destination', () => {
  let app;

  // Create a new app instance before each test.
  beforeEach(() => {
    app = createApp(config);
  });

  afterEach(() => {
    // Make the app instance GC-able.
    app = undefined;
  });

  it('should return a JSON object when a valid request is sent', async () => {
    // Arrange: Define the request body.
    const postData = { query: 'Lamboing' };

    // Act: Send a POST request with supertest.
    const response = await request(app)
      .post('/search/test/destination')
      .set('Accept', 'application/json') // Set the request headers for JSON.
      .send(postData);

    // Assert: Validate the response.

    // Response should be 200 OK.
    expect(response.statusCode).toBe(200);
    // Response should be JSON.
    expect(response.headers['content-type']).toMatch(/json/);
    // The body should be an object.
    expect(typeof response.body).toBe('object');
    expect(response.body).toEqual({
      lon: '7.13476',
      lat: '47.11682',
      name: 'Lamboing',
      countryName: 'Switzerland',
    });
  });

  it('should return a 422 when an invalid request is sent', async () => {
    // Arrange: Define the request body.
    const postData = {}; // Missing 'query' property.

    // Act: Send a POST request with supertest.
    const response = await request(app)
      .post('/search/test/destination')
      .set('Accept', 'application/json') // Set the request headers for JSON.
      .send(postData);

    // Assert: Validate the response.

    // Response should be 422 Unprocessable Content.
    expect(response.statusCode).toBe(422);
  });
});
