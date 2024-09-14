// @ts-check
'use strict';

// 3rd party - Node.
import path from 'node:path';

// 3rd party.
import dotenv from 'dotenv';

// Project.
import * as utils from '../utilities/utils.mjs';

// We define the configuration based on the environment.
const ENV = process.env.NODE_ENV || 'development';

/*------------------------------------------------------------------------------------------------
 * Environment variables
 *------------------------------------------------------------------------------------------------*/

dotenv.config();
const geoNamesUsername = process.env.GEONAMES_USERNAME || '';
const weatherBitApiKey = process.env.WEATHERBIT_API_KEY || '';
const pixabayApiKey = process.env.PIXABAY_API_KEY || '';

const baseConfig = {
  geoNamesUsername,
  weatherBitApiKey,
  pixabayApiKey,
  runEnv: ENV,
  port: 3000,
  distPath: path.resolve(utils.getRootDir(), '../frontend/dist'),
};

const envConfig = {
  production: {
    // Production-specific settings.
  },
  development: {
    // Development-specific settings.
  },
  test: {
    // Test-specific settings.
  },
};

export const config = {
  ...baseConfig,
  ...envConfig[ENV],
};

export default config;
