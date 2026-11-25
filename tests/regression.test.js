const { expect } = require('chai');
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const CheckoutPage = require('../pages/CheckoutPage');
const config = require('../config/testConfig');

describe('End-to-End Regression & Smoke Suite', function () {
  this.timeout(config.timeouts.explicitWait * 4);

  let loginPage;
  let inventoryPage;
  let checkoutPage;

  beforeEach(function () {
    loginPage = new LoginPage(this.driver);
    inventoryPage = new InventoryPage(this.driver);
    checkoutPage = new CheckoutPage(this.driver);
  });

  it('TC-REG-01: Product sorting by Price (Low to High and High to Low)', async function () {
    await loginPage.open();
    await loginPage.login(
      config.credentials.standardUser.username,
      config.credentials.standardUser.password
    );

    // Test Low to High
    await inventoryPage.selectSortOption('lohi');
    const pricesAsc = await inventoryPage.getAllProductPrices();
    const sortedAsc = [...pricesAsc].sort((a, b) => a - b);
    expect(pricesAsc).to.deep.equal(sortedAsc);

    // Test High to Low
    await inventoryPage.selectSortOption('hilo');
    const pricesDesc = await inventoryPage.getAllProductPrices();
    const sortedDesc = [...pricesDesc].sort((a, b) => b - a);
    expect(pricesDesc).to.deep.equal(sortedDesc);
  });

  it('TC-REG-02: Product sorting by Name (A to Z and Z to A)', async function () {
    await loginPage.open();
    await loginPage.login(
      config.credentials.standardUser.username,
      config.credentials.standardUser.password
    );

    // Test A to Z
    await inventoryPage.selectSortOption('az');
    const namesAz = await inventoryPage.getAllProductNames();
    const sortedAz = [...namesAz].sort();
    expect(namesAz).to.deep.equal(sortedAz);

    // Test Z to A
    await inventoryPage.selectSortOption('za');
    const namesZa = await inventoryPage.getAllProductNames();
    const sortedZa = [...namesZa].sort().reverse();
    expect(namesZa).to.deep.equal(sortedZa);
  });

  it('TC-REG-03: Cart badge counter increments and decrements dynamically', async function () {
    await loginPage.open();
    await loginPage.login(
      config.credentials.standardUser.username,
      config.credentials.standardUser.password
    );

    let count = await inventoryPage.getCartBadgeCount();
    expect(count).to.equal(0);

    // Add first item
    await inventoryPage.addProductToCart('sauce-labs-backpack');
    await inventoryPage.waitForCartBadgeCount(1);
    count = await inventoryPage.getCartBadgeCount();
    expect(count).to.equal(1);

    // Add second item
    await inventoryPage.addProductToCart('sauce-labs-bike-light');
    await inventoryPage.waitForCartBadgeCount(2);
    count = await inventoryPage.getCartBadgeCount();
    expect(count).to.equal(2);

    // Remove one item
    await inventoryPage.removeProductFromCart('sauce-labs-backpack');
    await inventoryPage.waitForCartBadgeCount(1);
    count = await inventoryPage.getCartBadgeCount();
    expect(count).to.equal(1);

    // Remove remaining item
    await inventoryPage.removeProductFromCart('sauce-labs-bike-light');
    await inventoryPage.waitForCartBadgeCount(0);
    count = await inventoryPage.getCartBadgeCount();
    expect(count).to.equal(0);
  });

  it('TC-REG-04: Full E2E User Journey (Login -> Sort -> Add to Cart -> Checkout -> Logout)', async function () {
    // 1. Login
    await loginPage.open();
    await loginPage.login(
      config.credentials.standardUser.username,
      config.credentials.standardUser.password
    );
    expect(await inventoryPage.isLoaded()).to.be.true;

    // 2. Sort Products
    await inventoryPage.selectSortOption('lohi');
    const prices = await inventoryPage.getAllProductPrices();
    expect(prices[0]).to.be.at.most(prices[prices.length - 1]);

    // 3. Add 2 items to cart
    await inventoryPage.addProductToCart('sauce-labs-onesie');
    await inventoryPage.addProductToCart('sauce-labs-bike-light');
    expect(await inventoryPage.getCartBadgeCount()).to.equal(2);

    // 4. Navigate to cart & proceed to checkout
    await inventoryPage.goToCart();
    await checkoutPage.proceedToCheckout();

    // 5. Fill customer details & continue
    await checkoutPage.fillCheckoutInformation('John', 'Doe', '10001');
    await checkoutPage.clickContinue();

    // 6. Verify total & finish order
    const totalLabel = await checkoutPage.getTotalLabelText();
    expect(totalLabel).to.include('Total: $');
    await checkoutPage.finishCheckout();

    const completeHeader = await checkoutPage.getCompleteHeaderText();
    expect(completeHeader).to.equal('Thank you for your order!');
    expect(await checkoutPage.isOrderComplete()).to.be.true;

    // 7. Logout
    await inventoryPage.logout();
    const loginButtonVisible = await loginPage.isElementDisplayed(loginPage.loginButton);
    expect(loginButtonVisible).to.be.true;
  });
});
