# Defect Report: Checkout Form Postal Code Space Validation Bypass

### Bug Summary
Checkout Step One allows proceeding with whitespace-only Postal Code input, causing invalid downstream order fulfillment requests.

---

### Defect Metadata
- **Defect ID:** `DEF-001`
- **Module:** Checkout (`/checkout-step-one.html`)
- **Severity:** High (S2)
- **Priority:** High (P2)
- **Environment:** Google Chrome (Headless & Headed), Windows 11 / Ubuntu CI
- **Reporter:** QA Automation Suite
- **Assigned To:** Frontend Engineering Team
- **Status:** Open / Needs Triage

---

### Preconditions
1. Active session as `standard_user`.
2. At least one item added to the shopping cart.
3. User has navigated to `https://www.saucedemo.com/checkout-step-one.html`.

---

### Steps to Reproduce
1. In the `First Name` field, input `John`.
2. In the `Last Name` field, input `Doe`.
3. In the `Postal Code` field, input three spaces (`"   "`).
4. Click the `Continue` button.

---

### Expected Result
The form validation should sanitize and trim whitespace input. A client-side validation error should appear:
`"Error: Postal Code is required"` or `"Error: Invalid Postal Code format"`. The user should remain on `/checkout-step-one.html`.

---

### Actual Result
The whitespace string is accepted as valid non-empty input. The application redirects to `/checkout-step-two.html` with an unvalidated empty postal code, creating malformed shipping data on order completion.

---

### Impact Analysis
- Creates downstream order processing errors for warehouse dispatch.
- Violates input hygiene and address verification criteria for e-commerce checkout standards.

---

### Failure Evidence & Screenshot
- **Screenshot Artifact:** `screenshots/TC-VAL-03_Postal_Code_Whitespace_2026-11-25.png`
- **Error Console Log:**
  ```text
  [2026-11-25T07:30:00.000Z] [ERROR] - Form accepted invalid postal code string '   '
  Target URL: https://www.saucedemo.com/checkout-step-two.html
  ```
