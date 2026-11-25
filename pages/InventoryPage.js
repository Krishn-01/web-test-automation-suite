const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const Logger = require('../utils/logger');

/**
 * Page Object Model for SauceDemo Inventory / Products Page.
 */
class InventoryPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Encapsulated Locators
    this.pageTitle = By.css('[data-test="title"]');
    this.inventoryContainer = By.css('#inventory_container');
    this.inventoryItems = By.css('[data-test="inventory-item"]');
    this.inventoryItemNames = By.css('[data-test="inventory-item-name"]');
    this.inventoryItemPrices = By.css('[data-test="inventory-item-price"]');
    this.sortDropdown = By.css('[data-test="product-sort-container"]');
    this.shoppingCartBadge = By.css('[data-test="shopping-cart-badge"]');
    this.shoppingCartLink = By.css('[data-test="shopping-cart-link"]');
    this.burgerMenuButton = By.css('#react-burger-menu-btn');
    this.logoutSidebarLink = By.css('[data-test="logout-sidebar-link"]');
    this.allItemsSidebarLink = By.css('[data-test="inventory-sidebar-link"]');
    this.resetAppStateLink = By.css('[data-test="reset-sidebar-link"]');
  }

  /**
   * Verify if inventory page is loaded
   * @returns {Promise<boolean>}
   */
  async isLoaded() {
    await this.waitForElementVisible(this.pageTitle);
    const title = await this.getText(this.pageTitle);
    return title.toLowerCase() === 'products';
  }

  /**
   * Select sorting option from dropdown:
   * 'az' (Name A to Z), 'za' (Name Z to A), 'lohi' (Price low to high), 'hilo' (Price high to low)
   * @param {string} optionValue
   */
  async selectSortOption(optionValue) {
    Logger.info(`Sorting products by: ${optionValue}`);
    await this.selectDropdownByValue(this.sortDropdown, optionValue);
    // Explicit wait for the dropdown to reflect selected value
    const self = this;
    await this.driver.wait(
      async () => {
        const el = await self.waitForElementVisible(self.sortDropdown);
        return (await el.getAttribute('value')) === optionValue;
      },
      this.timeout,
      `Sort dropdown value did not update to ${optionValue}`
    );
  }

  /**
   * Returns an array of product names in the current display order
   * @returns {Promise<string[]>}
   */
  async getAllProductNames() {
    const elements = await this.findElements(this.inventoryItemNames);
    const names = [];
    for (const el of elements) {
      names.push((await el.getText()).trim());
    }
    return names;
  }

  /**
   * Returns an array of product prices as numbers in the current display order
   * @returns {Promise<number[]>}
   */
  async getAllProductPrices() {
    const elements = await this.findElements(this.inventoryItemPrices);
    const prices = [];
    for (const el of elements) {
      const text = await el.getText();
      prices.push(parseFloat(text.replace('$', '').trim()));
    }
    return prices;
  }

  /**
   * Add a product to cart by product data-test name slug or item name
   * @param {string} itemName e.g. "sauce-labs-backpack" or "Sauce Labs Backpack"
   */
  async addProductToCart(itemName) {
    Logger.info(`Adding item to cart: ${itemName}`);
    const slug = itemName.toLowerCase().replace(/\s+/g, '-');
    const addButtonLocator = By.css(`[data-test="add-to-cart-${slug}"]`);
    await this.safeClick(addButtonLocator);
  }

  /**
   * Remove a product from cart by item name
   * @param {string} itemName
   */
  async removeProductFromCart(itemName) {
    Logger.info(`Removing item from cart: ${itemName}`);
    const slug = itemName.toLowerCase().replace(/\s+/g, '-');
    const removeButtonLocator = By.css(`[data-test="remove-${slug}"]`);
    await this.safeClick(removeButtonLocator);
  }

  /**
   * Get current cart badge item count (0 if not present)
   * @returns {Promise<number>}
   */
  async getCartBadgeCount() {
    const isDisplayed = await this.isElementDisplayed(this.shoppingCartBadge, 1000);
    if (!isDisplayed) return 0;
    const text = await this.getText(this.shoppingCartBadge);
    return parseInt(text, 10) || 0;
  }

  /**
   * Waits until the cart badge count matches the expected number using explicit waits
   * @param {number} expectedCount
   * @param {number} [customTimeout]
   */
  async waitForCartBadgeCount(expectedCount, customTimeout = this.timeout) {
    const self = this;
    await this.driver.wait(
      async () => {
        const current = await self.getCartBadgeCount();
        return current === expectedCount;
      },
      customTimeout,
      `Cart badge count did not reach ${expectedCount} within ${customTimeout}ms`
    );
  }

  /**
   * Navigate to the shopping cart page
   */
  async goToCart() {
    Logger.info('Navigating to Shopping Cart');
    await this.safeClick(this.shoppingCartLink);
    await this.driver.wait(
      until.urlContains('/cart.html'),
      this.timeout,
      'Timed out navigating to cart.html'
    );
  }

  /**
   * Open sidebar burger menu and click logout with explicit animation/visibility waits
   */
  async logout() {
    Logger.info('Logging out user...');
    await this.safeClick(this.burgerMenuButton);
    await this.waitForElementVisible(this.logoutSidebarLink);
    await this.safeClick(this.logoutSidebarLink);
    await this.driver.wait(
      until.urlIs(this.baseUrl || 'https://www.saucedemo.com/'),
      this.timeout,
      'Timed out waiting for logout redirect'
    );
  }
}

module.exports = InventoryPage;
