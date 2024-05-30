# HomeTask Project

This project contains test scripts for quality assurance using the Playwright framework.

## Cloning the Project

To get started, clone the repository using the following command:

```bash
git clone https://github.com/ngiulino/hometask.git
cd hometask
```

## Installing Playwright Framework

### Installing on Windows

1. **Install Node.js**:
   - Download the latest LTS version of Node.js from the [official Node.js website](https://nodejs.org/).
   - Run the downloaded installer and follow the prompts to complete the installation.
   - Verify the installation by opening a command prompt and typing:
     ```bash
     node -v
     npm -v
     ```

2. **Install Playwright**:
   - Open a command prompt and navigate to the project directory:
     ```bash
     cd path\to\your\project\hometask
     ```
   - Install the dependencies, including Playwright, using npm:
     ```bash
     npm install
     ```

### Installing on Other Systems

First, ensure you have Node.js installed. Then, install the dependencies, including Playwright, using npm:

```bash
npm install
```

## Setting Up Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```plaintext
# Environment configuration

# URL
BASE_URL=https://www.siteToTest.test/

# Employee credentials
EMPLOYEE_EMAIL=testmail@xyz.yxa
EMPLOYEE_PASSWORD=passwordxyz

# Manager credentials
MANAGER_EMAIL=testmail@xyz.yxa
MANAGER_PASSWORD=passwordxyz
```

## Configuring Playwright

Playwright's configuration file is `playwright.config.js`. Make sure it looks like this:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
});
```

## Running the Test Scripts

To run the test scripts, use the following command:

```bash
npx playwright test
```

This command will execute all the test scripts located in the `tests` directory.

## Example Test Script

Here's an example of a test script that you might find in the `tests` directory:

```javascript
import { test, expect, Page } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL;
const EMPLOYEE_EMAIL = process.env.EMPLOYEE_EMAIL;
const EMPLOYEE_PASSWORD = process.env.EMPLOYEE_PASSWORD;
const MANAGER_EMAIL = process.env.MANAGER_EMAIL;
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD;

if (!BASE_URL || !EMPLOYEE_EMAIL || !EMPLOYEE_PASSWORD || !MANAGER_EMAIL || !MANAGER_PASSWORD) {
  throw new Error('One or more required environment variables are missing');
}

test.describe('Check leaves menu items and switch to manager account', () => {
  test.setTimeout(90000); // Increase overall test timeout to 90 seconds

  const login = async (page: Page, email: string, password: string) => {
    console.log(`Navigating to ${BASE_URL}/login`);
    await page.goto(`${BASE_URL}/login`);
    
    console.log('Waiting for email input to be visible');
    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 15000 });

    console.log('Filling email and password');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    console.log('Clicking login button and waiting for navigation');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }), // Wait for navigation to complete
      page.click('.focus-border.button-main__wrapper')
    ]);
  };

  const logout = async (page: Page) => {
    console.log('Clicking profile menu toggle');
    await page.click('.profile-menu__toggle');
    
    console.log('Waiting for sign-out button to be visible');
    await page.waitForSelector('div.profile-dropdown__sign-out', { state: 'visible', timeout: 15000 });

    console.log('Clicking sign-out button and waiting for navigation');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }), // Wait for navigation to complete
      page.click('div.profile-dropdown__sign-out')
    ]);
  };

  const checkLeavesMenu = async (page: Page) => {
    console.log('Checking Leaves menu items');
    await page.click('text=Leaves');
    await page.waitForSelector('text=My leaves', { timeout: 15000 });
    await page.click('text=My leaves');
    await page.waitForSelector('text=Calendar', { timeout: 15000 });
    await page.click('text=Calendar');
  };

  const checkManagerMenu = async (page: Page) => {
    console.log('Checking Leaves menu items for manager');
    await checkLeavesMenu(page); // Check common Leaves menu items
    await page.waitForSelector('text=Approvals', { timeout: 15000 });
    await page.click('text=Approvals');
    await page.waitForSelector('text=Leaves', { timeout: 15000 });
    await page.click('text=Leaves');
  };

  test('Employee leaves menu check', async ({ page }) => {
    await login(page, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD); // Employee login
    await checkLeavesMenu(page); // Check Leaves menu
    await logout(page); // Employee logout
  });

  test('Manager leaves menu check', async ({ page }) => {
    await login(page, MANAGER_EMAIL, MANAGER_PASSWORD); // Manager login
    await checkManagerMenu(page); // Check Leaves and additional manager menu items
    await logout(page); // Manager logout
  });
});
```
