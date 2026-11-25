const { expect } = require('chai');
const LoginPage = require('../pages/LoginPage');
const InventoryPage = require('../pages/InventoryPage');
const config = require('../config/testConfig');

describe('Login Module Tests', function () {
  this.timeout(config.timeouts.explicitWait * 3);

  let loginPage;
  let inventoryPage;

  beforeEach(function () {
    loginPage = new LoginPage(this.driver);
    inventoryPage = new InventoryPage(this.driver);
  });

  it('TC-LOG-01: Successful login with valid standard credentials', async function () {
    await loginPage.open();
    await loginPage.login(
      config.credentials.standardUser.username,
      config.credentials.standardUser.password
    );

    const isLoaded = await inventoryPage.isLoaded();
    expect(isLoaded).to.be.true;

    const currentUrl = await inventoryPage.getCurrentUrl();
    expect(currentUrl).to.include('/inventory.html');
  });

  it('TC-LOG-02: Error displayed for locked out user', async function () {
    await loginPage.open();
    await loginPage.login(
      config.credentials.lockedOutUser.username,
      config.credentials.lockedOutUser.password
    );

    const isError = await loginPage.isErrorDisplayed();
    expect(isError).to.be.true;

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).to.include('Epic sadface: Sorry, this user has been locked out.');
  });

  it('TC-LOG-03: Error displayed for invalid password', async function () {
    await loginPage.open();
    await loginPage.login(
      config.credentials.standardUser.username,
      'invalid_password_123'
    );

    const isError = await loginPage.isErrorDisplayed();
    expect(isError).to.be.true;

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).to.include('Epic sadface: Username and password do not match any user in this service');
  });

  it('TC-LOG-04: Error displayed when username is empty', async function () {
    await loginPage.open();
    await loginPage.login('', config.credentials.standardUser.password);

    const isError = await loginPage.isErrorDisplayed();
    expect(isError).to.be.true;

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).to.include('Epic sadface: Username is required');
  });

  it('TC-LOG-05: Error displayed when password is empty', async function () {
    await loginPage.open();
    await loginPage.login(config.credentials.standardUser.username, '');

    const isError = await loginPage.isErrorDisplayed();
    expect(isError).to.be.true;

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).to.include('Epic sadface: Password is required');
  });
});
