// @ts-check
'use strict';

// 3rd party - Node.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// `__dirname` is not available in ES modules.
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
