const DriverFactory = require('../utils/driverFactory');
const BasePage = require('../pages/BasePage');
const Logger = require('../utils/logger');

/**
 * Global Mocha root hooks:
 * - Initializes a new browser session before each test to guarantee complete test isolation
 * - Automatically takes a screenshot on any failure into screenshots/
 * - Quits the WebDriver session cleanly after each test
 */
exports.mochaHooks = {
  async beforeEach() {
    Logger.info(`--- Starting Test: "${this.currentTest ? this.currentTest.title : 'Setup'}" ---`);
    this.driver = await DriverFactory.createDriver();
  },

  async afterEach() {
    try {
      if (this.currentTest && this.currentTest.state === 'failed') {
        Logger.error(`Test FAILED: "${this.currentTest.title}". Capturing screenshot...`);
        try {
          const basePage = new BasePage(this.driver);
          const screenshotPath = await basePage.takeScreenshot(this.currentTest.title);
          Logger.info(`Failure screenshot stored at: ${screenshotPath}`);
        } catch (err) {
          Logger.error(`Could not capture failure screenshot: ${err.message}`);
        }
      } else if (this.currentTest && this.currentTest.state === 'passed') {
        Logger.pass(`Test PASSED: "${this.currentTest.title}"`);
      }
    } finally {
      if (this.driver) {
        try {
          await this.driver.quit();
          Logger.info('Browser session terminated cleanly.');
        } catch (quitErr) {
          Logger.warn(`Error while closing browser session: ${quitErr.message}`);
        }
      }
    }
  }
};
