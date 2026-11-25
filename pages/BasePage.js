const { until, By } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const config = require('../config/testConfig');
const Logger = require('../utils/logger');

/**
 * BasePage containing reusable explicit wait abstractions, safe interactions,
 * and screenshot utilities.
 */
class BasePage {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;
    this.timeout = config.timeouts.explicitWait;
  }

  /**
   * Navigates to a specific URL or baseUrl by default
   * @param {string} url
   */
  async navigateTo(url = config.baseUrl) {
    Logger.info(`Navigating to URL: ${url}`);
    await this.driver.get(url);
  }

  /**
   * Returns current browser URL
   * @returns {Promise<string>}
   */
  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  /**
   * Returns current page title
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return await this.driver.getTitle();
  }

  /**
   * Waits for an element to be located in the DOM
   * @param {By} locator
   * @param {number} [customTimeout]
   * @returns {Promise<import('selenium-webdriver').WebElement>}
   */
  async waitForElementLocated(locator, customTimeout = this.timeout) {
    return await this.driver.wait(
      until.elementLocated(locator),
      customTimeout,
      `Element not located in DOM within ${customTimeout}ms: ${locator.toString()}`
    );
  }

  /**
   * Waits for an element to be visible on the screen
   * @param {By} locator
   * @param {number} [customTimeout]
   * @returns {Promise<import('selenium-webdriver').WebElement>}
   */
  async waitForElementVisible(locator, customTimeout = this.timeout) {
    const element = await this.waitForElementLocated(locator, customTimeout);
    await this.driver.wait(
      until.elementIsVisible(element),
      customTimeout,
      `Element not visible within ${customTimeout}ms: ${locator.toString()}`
    );
    return element;
  }

  /**
   * Safely clicks an element after ensuring it is located and visible
   * @param {By} locator
   * @param {number} [customTimeout]
   */
  async safeClick(locator, customTimeout = this.timeout) {
    const startTime = Date.now();
    let lastError;
    while (Date.now() - startTime < customTimeout) {
      try {
        const remainingTime = Math.max(1000, customTimeout - (Date.now() - startTime));
        const element = await this.waitForElementVisible(locator, remainingTime);
        await this.driver.wait(
          until.elementIsEnabled(element),
          remainingTime,
          `Element not enabled for click: ${locator.toString()}`
        );
        await element.click();
        return;
      } catch (err) {
        lastError = err;
        // Retry on transient stale or intercepted conditions within timeout
        if (
          err.name === 'StaleElementReferenceError' ||
          err.name === 'ElementClickInterceptedError'
        ) {
          continue;
        }
        throw err;
      }
    }
    throw lastError || new Error(`Failed to click element within ${customTimeout}ms: ${locator.toString()}`);
  }

  /**
   * Safely clears and types text into an input field
   * @param {By} locator
   * @param {string} text
   * @param {number} [customTimeout]
   */
  async safeType(locator, text, customTimeout = this.timeout) {
    const element = await this.waitForElementVisible(locator, customTimeout);
    await element.clear();
    await element.sendKeys(text);
  }

  /**
   * Safely retrieves inner text of an element
   * @param {By} locator
   * @param {number} [customTimeout]
   * @returns {Promise<string>}
   */
  async getText(locator, customTimeout = this.timeout) {
    const element = await this.waitForElementVisible(locator, customTimeout);
    return (await element.getText()).trim();
  }

  /**
   * Checks if an element is currently displayed without throwing unhandled exceptions
   * @param {By} locator
   * @param {number} [customTimeout]
   * @returns {Promise<boolean>}
   */
  async isElementDisplayed(locator, customTimeout = 3000) {
    try {
      const element = await this.waitForElementVisible(locator, customTimeout);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Selects an option from a <select> dropdown by visible text or value
   * @param {By} selectLocator
   * @param {string} optionValue
   */
  async selectDropdownByValue(selectLocator, optionValue) {
    const selectElement = await this.waitForElementVisible(selectLocator);
    const option = await selectElement.findElement(By.css(`option[value="${optionValue}"]`));
    await option.click();
  }

  /**
   * Finds multiple elements located by locator
   * @param {By} locator
   * @returns {Promise<Array<import('selenium-webdriver').WebElement>>}
   */
  async findElements(locator) {
    await this.waitForElementLocated(locator);
    return await this.driver.findElements(locator);
  }

  /**
   * Captures a timestamped screenshot and saves it to screenshots/ directory
   * @param {string} testName
   * @returns {Promise<string>} Absolute file path of the saved screenshot
   */
  async takeScreenshot(testName) {
    try {
      const screenshotsDir = path.resolve(__dirname, '../screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const sanitizedName = (testName || 'screenshot').replace(/[^a-zA-Z0-9_-]/g, '_');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${sanitizedName}_${timestamp}.png`;
      const filePath = path.join(screenshotsDir, fileName);

      const screenshotData = await this.driver.takeScreenshot();
      fs.writeFileSync(filePath, screenshotData, 'base64');
      Logger.info(`Screenshot captured: ${filePath}`);
      return filePath;
    } catch (err) {
      Logger.error(`Failed to take screenshot: ${err.message}`);
      return null;
    }
  }
}

module.exports = BasePage;
