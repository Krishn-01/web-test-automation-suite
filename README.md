# Web Test Automation Suite

A production-grade, maintainable Web Test Automation framework built in JavaScript with **Selenium WebDriver**, **Mocha**, and **Chai**, following the **Page Object Model (POM)** design pattern.

Target Application: [SauceDemo](https://www.saucedemo.com/)

---

## 🏗 Architecture Overview

The framework strictly decouples test specifications, element locators, page actions, and test runner configurations:

```
web-test-automation-suite/
├── .github/workflows/
│   └── selenium-tests.yml        # GitHub Actions CI workflow (Headless Chrome on Linux)
├── config/
│   └── testConfig.js             # Centralized environment URLs, credentials & explicit timeouts
├── docs/
│   ├── TEST_CASES.md             # Complete QA Test Matrix (IDs, Modules, Steps, Priorities)
│   └── DEFECT_REPORT.md          # Sample Bug Report (Severity, Steps to Reproduce, Expected vs Actual)
├── pages/
│   ├── BasePage.js               # Explicit wait abstractions, safeClick, safeType, screenshots
│   ├── LoginPage.js              # Encapsulated locators and workflows for Login
│   ├── InventoryPage.js          # Catalog sorting, cart operations, burger menu, logout
│   └── CheckoutPage.js           # Checkout step 1, overview step 2, and confirmation page
├── tests/
│   ├── hooks.js                  # Mocha root hooks: isolated WebDriver lifecycle & auto-failure screenshot
│   ├── login.test.js             # Authentication scenarios (positive, negative, locked out, blanks)
│   ├── formValidation.test.js    # Form edge cases (missing First, Last, Postal code)
│   └── regression.test.js        # Sorting, dynamic badge updates, and complete E2E purchase journey
├── utils/
│   ├── driverFactory.js          # Cross-platform Chrome WebDriver factory (headless/headed)
│   └── logger.js                 # Formatted ISO timestamped logger
├── screenshots/
│   └── .gitkeep                  # Destination folder for timestamped failure screenshots
├── reports/
│   └── .gitkeep                  # Destination folder for Mochawesome HTML and JSON test reports
├── .gitignore                    # Ignores node_modules, reports, and screenshots
├── .mocharc.json                 # Mocha test runner options (30s timeout, mochawesome reporter)
├── package.json                  # Scripts and dependencies
└── README.md                     # Framework documentation and instructions
```

---

## 🚀 Key Features & Engineering Standards

- **Strict Page Object Model (POM):** All web selectors (`data-test`, CSS, IDs) are encapsulated inside `pages/`. Tests only call high-level domain actions.
- **Explicit Waits Only:** Zero hardcoded `sleep()`. Utilizes Selenium's `until.elementLocated`, `until.elementIsVisible`, and `until.elementIsEnabled` wrapped inside `BasePage`.
- **Automatic Failure Screenshot:** `tests/hooks.js` intercepts Mocha test failures and auto-saves high-resolution timestamped PNG screenshots inside `screenshots/`.
- **Mochawesome Reporting:** Generates interactive HTML and JSON reports under `reports/test-report.html`.
- **Headless & CI Ready:** Includes preconfigured GitHub Actions workflow executing headless Chrome tests on Ubuntu runners.
- **Environment Driven:** Supports configuration via environment variables (`HEADLESS`, `BASE_URL`, `EXPLICIT_WAIT`).

---

## 📦 Prerequisites

- **Node.js**: `v18.x` or higher (`v20+` recommended)
- **Google Chrome**: Installed on host machine
- **NPM**: `v9.x` or higher

---

## 🛠 Installation

Clone the repository and install dependencies:

```bash
cd web-test-automation-suite
npm install
```

---

## 🧪 Running Tests

### 1. Run Full Test Suite in Headless Mode (Default for CI)
```bash
npm run test:headless
```
Or with direct cross-env flag:
```bash
npm test
```

### 2. Run Tests in Headed (Visible Browser) Mode
```bash
cross-env HEADLESS=false npm test
```

### 3. Run Targeted Test Suites
- **Authentication Suite:**
  ```bash
  npm run test:login
  ```
- **Checkout Form Validation Suite:**
  ```bash
  npm run test:validation
  ```
- **End-to-End Regression Suite:**
  ```bash
  npm run test:regression
  ```

---

## 📊 Test Reports & Failure Screenshots

1. **HTML Report:**
   After test execution, open the generated report in any browser:
   ```bash
   # Open on Windows
   start reports/test-report.html

   # Open on macOS / Linux
   open reports/test-report.html
   ```

2. **Screenshots on Failure:**
   Captured automatically under `screenshots/<Sanitized_Test_Name>_<Timestamp>.png`.

---

## 📋 Test Matrix Summary

| Test ID | Module | Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC-LOG-01` | Auth | Valid credentials login | Redirects to `/inventory.html` | ✅ Passed |
| `TC-LOG-02` | Auth | Locked out user login | Error: `"Sorry, this user has been locked out."` | ✅ Passed |
| `TC-LOG-03` | Auth | Invalid password login | Error: `"Username and password do not match"` | ✅ Passed |
| `TC-LOG-04` | Auth | Empty username login | Error: `"Username is required"` | ✅ Passed |
| `TC-LOG-05` | Auth | Empty password login | Error: `"Password is required"` | ✅ Passed |
| `TC-VAL-01` | Form | Missing First Name | Error: `"Error: First Name is required"` | ✅ Passed |
| `TC-VAL-02` | Form | Missing Last Name | Error: `"Error: Last Name is required"` | ✅ Passed |
| `TC-VAL-03` | Form | Missing Postal Code | Error: `"Error: Postal Code is required"` | ✅ Passed |
| `TC-VAL-04` | Form | Complete valid form | Proceed to `/checkout-step-two.html` | ✅ Passed |
| `TC-REG-01` | Catalog | Sort Price Low-to-High & High-to-Low | Correct ascending and descending sort order | ✅ Passed |
| `TC-REG-02` | Catalog | Sort Name A-to-Z & Z-to-A | Correct alphabetical order | ✅ Passed |
| `TC-REG-03` | Cart | Dynamic badge increment/decrement | Badge count updates reactively on Add/Remove | ✅ Passed |
| `TC-REG-04` | E2E | Full lifecycle purchase & logout | Completion confirmation & clean logout | ✅ Passed |
