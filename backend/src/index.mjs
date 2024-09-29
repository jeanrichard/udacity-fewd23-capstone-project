// @ts-check
'use strict';

// 3rd party - Node.
import { cwd, exit } from 'node:process';
import { fileURLToPath } from 'node:url';

// 3rd party - Express and related.
import dotenv from 'dotenv';

// Project.
import config from './config/config.mjs';
import logger from './config/logger.mjs';
import { createApp } from './app.mjs';

/*------------------------------------------------------------------------------------------------
 * Environment variables
 *------------------------------------------------------------------------------------------------*/

dotenv.config();
const geoNamesUsername = process.env.GEONAMES_USERNAME || '';
const weatherBitApiKey = process.env.WEATHERBIT_API_KEY || '';
const pixabayApiKey = process.env.PIXABAY_API_KEY || '';
// As a list of pairs.
const envProperties = [
  ['GEONAMES_USERNAME', geoNamesUsername],
  ['WEATHERBIT_API_KEY', weatherBitApiKey],
  ['PIXABAY_API_KEY', pixabayApiKey],
];

/*------------------------------------------------------------------------------------------------
 * Main part
 *------------------------------------------------------------------------------------------------*/

const __filename = fileURLToPath(import.meta.url);

if (__filename === process.argv[1]) {
  // We make sure that the credentials are defined.

  // As a list of pairs.
  const credentialPairs = [
    ['GEONAMES_USERNAME', config.geoNamesUsername],
    ['WEATHERBIT_API_KEY', config.weatherBitApiKey],
    ['PIXABAY_API_KEY', config.pixabayApiKey],
  ];

  let credentialsAreDefined = true;
  for (const [name, value] of credentialPairs) {
    if (value === '') {
      logger.error(`environment variable not set or empty`, { name });
      credentialsAreDefined = false;
    }
  }

  if (!credentialsAreDefined) {
    logger.error('aborting');
    exit(2);
  }

  // Build the app.
  const app = createApp(config);

  /* Server. */

  // Start the server.
  const server = app.listen(config.port, () => {
    logger.info('starting Express app', {
      host: 'localhost',
      port: config.port,
      runEnv: config.runEnv,
      cwd: cwd(),
    });

    // Validate the configuration.
    let closeServer = false;
    for (const [name, value] of envProperties) {
      if (value === '') {
        logger.error(`environment variable not set or empty`, { name });
        closeServer = true;
      }
    }
    if (closeServer) {
      console.error('stopping Express app');
      server.close();
    }
  });

  // Uncomment to print all properties of the server.
  // logger.info('printing all properties of the server', { server });
}
