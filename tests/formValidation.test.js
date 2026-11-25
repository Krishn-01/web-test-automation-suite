const { expect } = require('chai');
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const CheckoutPage = require('../pages/CheckoutPage');
const config = require('../config/testConfig');

describe('Checkout Form Validation Edge Cases', function () {
  this.timeout(config.timeouts.explicitWait * 3);

  let loginPage;
  let inventoryPage;
  let checkoutPage;

  beforeEach(async function () {
    loginPage = new LoginPage(this.driver);
    inventoryPage = new InventoryPage(this.driver);
    checkoutPage = new CheckoutPage(this.driver);

    // Prerequisite: Log in and proceed to checkout
    await loginPage.open();
    await loginPage.login(
      config.credentials.standardUser.username,
      config.credentials.standardUser.password
    );
    await inventoryPage.addProductToCart('sauce-labs-backpack');
    await inventoryPage.goToCart();
    await checkoutPage.proceedToCheckout();
  });

  it('TC-VAL-01: Validation error when First Name is missing', async function () {
    await checkoutPage.fillCheckoutInformation('', 'Smith', '90210');
    await checkoutPage.clickContinue();

    const errorText = await checkoutPage.getErrorMessage();
    expect(errorText).to.include('Error: First Name is required');
  });

  it('TC-VAL-02: Validation error when Last Name is missing', async function () {
    await checkoutPage.fillCheckoutInformation('Alice', '', '90210');
    await checkoutPage.clickContinue();

    const errorText = await checkoutPage.getErrorMessage();
    expect(errorText).to.include('Error: Last Name is required');
  });

  it('TC-VAL-03: Validation error when Postal Code is missing', async function () {
    await checkoutPage.fillCheckoutInformation('Alice', 'Smith', '');
    await checkoutPage.clickContinue();

    const errorText = await checkoutPage.getErrorMessage();
    expect(errorText).to.include('Error: Postal Code is required');
  });

  it('TC-VAL-04: Successful form submission when all mandatory fields are provided', async function () {
    await checkoutPage.fillCheckoutInformation('Alice', 'Smith', '90210');
    await checkoutPage.clickContinue();

    const currentUrl = await checkoutPage.getCurrentUrl();
    expect(currentUrl).to.include('/checkout-step-two.html');
  });
});
