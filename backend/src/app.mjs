// @ts-check
'use strict';

// 3rd party - Express and related.
import cors from 'cors';
import express from 'express';

// Project.
import logger from './config/logger.mjs';
import makeSearchRouter from './routes/search-routes.mjs';
import makeTripRouter from './routes/trip-routes.mjs';

/*------------------------------------------------------------------------------------------------
 * Main part
 *------------------------------------------------------------------------------------------------*/

/**
 * Builds and returns the Express application.
 *
 * @param {object} config - The configuration.
 * @returns {express.Application} As described above.
 */
export function createApp(config) {
  /* The application. */
  const app = express();

  /* Middlewares. */

  // Automatically parse POST requests with
  // Content-Type: application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: false }));

  // Automatically parse POST requests with
  // Content-Type: application/json
  app.use(express.json());

  // Tell the browser to allow cross-origin requests for all origins.
  app.use(cors());

  // Enable serving static content.
  logger.info('setting path to static content', { distPath: config.distPath });
  app.use(express.static(config.distPath));

  /* Routes. */

  // Does not seem needed with `static` above.
  // app.get('/', function (_req, res) {
  //   path.resolve(config.distPath, 'index.html');
  // });

  // Endpoints for search.
  const searchRouter = makeSearchRouter(config);
  app.use('/search', searchRouter);

  // Endpoints for trips.
  const tripRouter = makeTripRouter();
  app.use('/trips', tripRouter);

  return app;
}

export default createApp;
