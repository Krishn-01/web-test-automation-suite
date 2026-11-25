/**
 * Centralized test configuration settings: URLs, timeouts, and user credentials.
 */
module.exports = {
  baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com/',
  timeouts: {
    explicitWait: parseInt(process.env.EXPLICIT_WAIT, 10) || 10000,
    pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT, 10) || 20000,
    scriptTimeout: parseInt(process.env.SCRIPT_TIMEOUT, 10) || 15000
  },
  credentials: {
    standardUser: {
      username: process.env.STANDARD_USER || 'standard_user',
      password: process.env.PASSWORD || 'secret_sauce'
    },
    lockedOutUser: {
      username: process.env.LOCKED_OUT_USER || 'locked_out_user',
      password: process.env.PASSWORD || 'secret_sauce'
    },
    invalidUser: {
      username: 'invalid_user',
      password: 'wrong_password'
    }
  },
  browser: {
    name: 'chrome',
    headless: process.env.HEADLESS === 'true' || process.env.CI === 'true',
    windowSize: {
      width: 1920,
      height: 1080
    }
  }
};
