const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/testConfig');
const Logger = require('../utils/logger');

/**
 * Page Object Model for SauceDemo Login Page.
 * Encapsulates all selectors and interactions on the login page.
 */
class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Encapsulated Locators
    this.usernameInput = By.css('[data-test="username"]');
    this.passwordInput = By.css('[data-test="password"]');
    this.loginButton = By.css('[data-test="login-button"]');
    this.errorMessage = By.css('[data-test="error"]');
    this.loginLogo = By.css('.login_logo');
    this.botColumn = By.css('.bot_column');
  }

  /**
   * Open the login page
   */
  async open() {
    Logger.info(`Opening Login page at ${config.baseUrl}`);
    await this.navigateTo(config.baseUrl);
    await this.waitForElementVisible(this.loginButton);
  }

  /**
   * Type username
   * @param {string} username
   */
  async enterUsername(username) {
    await this.safeType(this.usernameInput, username);
  }

  /**
   * Type password
   * @param {string} password
   */
  async enterPassword(password) {
    await this.safeType(this.passwordInput, password);
  }

  /**
   * Click login submit button
   */
  async clickLoginButton() {
    await this.safeClick(this.loginButton);
  }

  /**
   * Full login workflow helper
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    Logger.info(`Logging in with username: ${username}`);
    if (username) await this.enterUsername(username);
    if (password) await this.enterPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Retrieve the validation/error message text
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if error message is displayed
   * @returns {Promise<boolean>}
   */
  async isErrorDisplayed() {
    return await this.isElementDisplayed(this.errorMessage);
  }

  /**
   * Check if login logo is displayed
   * @returns {Promise<boolean>}
   */
  async isLoginLogoDisplayed() {
    return await this.isElementDisplayed(this.loginLogo);
  }
}

module.exports = LoginPage;
