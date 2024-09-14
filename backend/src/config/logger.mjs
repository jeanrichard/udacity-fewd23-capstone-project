// @ts-check
'use strict';

// 3rd party.
import winston from 'winston';

// We configure the logger based on the environment.
const ENV = process.env.NODE_ENV || 'development';

// We miminize logging when running in 'test'.
const logLevel = ENV === 'test' ? 'warn' : 'info';

// Convenience.
const { combine, colorize, timestamp, json, printf } = winston.format;

// We define a custom log format that includes timestamp and JSON formatting.
const customFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

const logger = winston.createLogger({
  level: logLevel,
  format: combine(timestamp(), customFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), customFormat),
    }),
    new winston.transports.File({
      filename: 'app.log',
      format: json(),
    }),
  ],
});

/**
 * Redacts sensitive parts in a text based on the environment.
 *
 * @param {string} text - The text to process.
 * @param {string|string[]} [parts] - A string or an array of strings to be redacted.
 * @returns {string} As described above.
 */
export function sensitive(text, parts) {
  if (ENV === 'production') {
    const toRedact = Array.isArray(parts) ? parts : [parts];
    toRedact.forEach((part) => {
      if (part) {
        const redacted = '*'.repeat(part.length);
        text = text.replaceAll(part, redacted);
      }
    });
  }
  return text;
}

export default logger;
