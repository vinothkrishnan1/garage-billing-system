const { join } = require('path');

/**
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer so Render preserves the Chromium binary between build and start
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
