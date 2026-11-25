const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const Logger = require('../utils/logger');

/**
 * Page Object Model for SauceDemo Cart and Checkout Flow:
 * - Cart overview page
 * - Checkout Step One (User details)
 * - Checkout Step Two (Order summary overview)
 * - Checkout Complete (Order dispatch confirmation)
 */
class CheckoutPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Cart Step Locators
    this.checkoutButton = By.css('[data-test="checkout"]');
    this.cartItems = By.css('[data-test="inventory-item"]');
    this.continueShoppingButton = By.css('[data-test="continue-shopping"]');

    // Checkout Step One Locators
    this.firstNameInput = By.css('[data-test="firstName"]');
    this.lastNameInput = By.css('[data-test="lastName"]');
    this.postalCodeInput = By.css('[data-test="postalCode"]');
    this.continueButton = By.css('[data-test="continue"]');
    this.cancelButton = By.css('[data-test="cancel"]');
    this.errorMessage = By.css('[data-test="error"]');

    // Checkout Step Two Locators
    this.finishButton = By.css('[data-test="finish"]');
    this.summarySubtotal = By.css('[data-test="subtotal-label"]');
    this.summaryTax = By.css('[data-test="tax-label"]');
    this.summaryTotal = By.css('[data-test="total-label"]');

    // Checkout Complete Locators
    this.completeHeader = By.css('[data-test="complete-header"]');
    this.completeText = By.css('[data-test="complete-text"]');
    this.backToProductsButton = By.css('[data-test="back-to-products"]');
  }

  /**
   * Click Checkout on Cart Page
   */
  async proceedToCheckout() {
    Logger.info('Proceeding to Checkout Step One');
    await this.safeClick(this.checkoutButton);
    await this.driver.wait(
      until.urlContains('/checkout-step-one.html'),
      this.timeout,
      'Timed out navigating to checkout-step-one.html'
    );
  }

  /**
   * Fill out customer details form in Step One
   * @param {string} [firstName]
   * @param {string} [lastName]
   * @param {string} [postalCode]
   */
  async fillCheckoutInformation(firstName, lastName, postalCode) {
    Logger.info(`Filling checkout form: First='${firstName}', Last='${lastName}', Zip='${postalCode}'`);
    if (firstName !== undefined && firstName !== null) {
      await this.safeType(this.firstNameInput, firstName);
    }
    if (lastName !== undefined && lastName !== null) {
      await this.safeType(this.lastNameInput, lastName);
    }
    if (postalCode !== undefined && postalCode !== null) {
      await this.safeType(this.postalCodeInput, postalCode);
    }
  }

  /**
   * Click Continue to proceed to Step Two Overview
   */
  async clickContinue() {
    await this.safeClick(this.continueButton);
  }

  /**
   * Get error message text on checkout step one
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }

  /**
   * Click finish order button on Step Two
   */
  async finishCheckout() {
    Logger.info('Finishing order (Click Finish)');
    await this.safeClick(this.finishButton);
  }

  /**
   * Get completion header text (e.g. "Thank you for your order!")
   * @returns {Promise<string>}
   */
  async getCompleteHeaderText() {
    return await this.getText(this.completeHeader);
  }

  /**
   * Check if complete header is visible
   * @returns {Promise<boolean>}
   */
  async isOrderComplete() {
    return await this.isElementDisplayed(this.completeHeader);
  }

  /**
   * Get total amount label text
   * @returns {Promise<string>}
   */
  async getTotalLabelText() {
    return await this.getText(this.summaryTotal);
  }
}

module.exports = CheckoutPage;
