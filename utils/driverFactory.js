const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const fs = require('fs');
const config = require('../config/testConfig');
const Logger = require('./logger');

class DriverFactory {
  /**
   * Builds and configures a cross-platform Chrome WebDriver instance.
   * Hardened for headless execution on Linux CI runners (Ubuntu).
   * @param {Object} optionsOverrides
   * @returns {Promise<import('selenium-webdriver').WebDriver>}
   */
  static async createDriver(optionsOverrides = {}) {
    const isHeadless = optionsOverrides.headless !== undefined
      ? optionsOverrides.headless
      : config.browser.headless;

    Logger.info(`Initializing Chrome WebDriver (Headless: ${isHeadless})...`);

    const options = new chrome.Options();

    // Standard flags for CI and stability
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments(`--window-size=${config.browser.windowSize.width},${config.browser.windowSize.height}`);
    options.addArguments('--disable-extensions');
    options.addArguments('--disable-infobars');
    options.addArguments('--remote-allow-origins=*');
    options.addArguments('--disable-background-timer-throttling');
    options.addArguments('--disable-backgrounding-occluded-windows');
    options.addArguments('--disable-renderer-backgrounding');

    // Specify Chrome binary path if present in standard Windows location
    const defaultChromeWin = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (process.platform === 'win32' && fs.existsSync(defaultChromeWin)) {
      options.setChromeBinaryPath(defaultChromeWin);
    }

    if (isHeadless) {
      options.addArguments('--headless=new');
    }

    // Configure chromedriver service using the installed chromedriver package if available
    let serviceBuilder;
    if (chromedriver && chromedriver.path && fs.existsSync(chromedriver.path)) {
      serviceBuilder = new chrome.ServiceBuilder(chromedriver.path);
    }

    const builder = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options);

    if (serviceBuilder) {
      builder.setChromeService(serviceBuilder);
    }

    const driver = await builder.build();

    // Explicitly set window rect for headless Chrome on Linux to avoid viewport collapse
    try {
      await driver.manage().window().setRect({
        width: config.browser.windowSize.width,
        height: config.browser.windowSize.height
      });
    } catch (winErr) {
      Logger.warn(`Window setRect warning: ${winErr.message}`);
    }

    // Set standard timeouts
    await driver.manage().setTimeouts({
      pageLoad: config.timeouts.pageLoad,
      script: config.timeouts.scriptTimeout
    });

    Logger.info('Chrome WebDriver initialized successfully.');
    return driver;
  }
}

module.exports = DriverFactory;
