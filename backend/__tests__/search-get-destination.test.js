// @ts-check
'use strict';

// 3rd party.
import { describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';

// Project.
import { app } from '../src/index.mjs';

// Mock __filename and __dirname.
jest.mock('../src/utilities/path-utils.mjs', () => ({
  __filename: '/mock/path/to/file.mjs',
  __dirname: '/mock/path/to',
}));

describe('POST /search/destination', () => {

  it('should return a JSON object when a valid query is sent', async () => {
    // Arrange: Define the request body.
    const postData = { query: 'Lamboing' };

    // Act: Send a POST request with supertest.
    const response = await request(app)
      .post('/search/destination')
      .set('Accept', 'application/json') // Set the request headers for JSON
      .send(postData);

    // Assert: Validate the response.
    expect(response.statusCode).toBe(200); // Expect a successful response
    expect(response.headers['content-type']).toMatch(/json/); // Response should be JSON

    // Example: Check if the response body contains the expected properties.
    expect(response.body).toHaveProperty('result'); // Assuming the response contains 'result'
    expect(typeof response.body.result).toBe('object'); // Assuming the result is an object
  });

  it('should return 400 for invalid request data', async () => {
    // Act: Send an invalid request without the 'query' property
    const response = await request(app)
      .post('/search/destination')
      .set('Accept', 'application/json')
      .send({}); // Empty request body

    // Assert: Expect a 400 Bad Request or a similar status code
    expect(response.statusCode).toBe(400);
  });
});
