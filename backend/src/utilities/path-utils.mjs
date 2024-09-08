// @ts-check
'use strict';

import { fileURLToPath } from 'node:url';
import path from 'node:path';

// `__dirname` is not available in ES6 modules.
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
