# Setting Up Playwright on Windows and macOS

This guide will help you install and set up Playwright on both Windows and macOS for running end-to-end tests.

## Prerequisites

Before installing Playwright, ensure you have the following prerequisites:

1. **Node.js**: Playwright requires Node.js. You can download and install the latest LTS version from the [official Node.js website](https://nodejs.org/).
2. **Git**: If you plan to clone a repository, ensure Git is installed. You can download it from the [official Git website](https://git-scm.com/).

## Step-by-Step Installation

### For Windows

#### Step 1: Install Node.js

1. Download the latest LTS version of Node.js from [Node.js](https://nodejs.org/).
2. Run the installer and follow the prompts to complete the installation.
3. Verify the installation by opening Command Prompt and typing:
   ```bash
   node -v
   npm -v
   ```

#### Step 2: Install Git (Optional)

If you need to clone a repository, install Git:

1. Download the latest version of Git from [Git](https://git-scm.com/).
2. Run the installer and follow the prompts to complete the installation.
3. Verify the installation by opening Command Prompt and typing:
   ```bash
   git --version
   ```

#### Step 3: Clone Your Project Repository

If you have a project repository to work with, clone it using Git:

1. Open Command Prompt.
2. Navigate to the directory where you want to clone the repository:
   ```bash
   cd path\to\your\desired\directory
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repository.git
   cd your-repository
   ```

#### Step 4: Install Playwright

1. Open Command Prompt.
2. Navigate to your project directory:
   ```bash
   cd path\to\your\project
   ```
3. Install Playwright and other dependencies using npm:
   ```bash
   npm install
   ```

### For macOS

#### Step 1: Install Node.js

1. Download the latest LTS version of Node.js from [Node.js](https://nodejs.org/).
2. Run the installer and follow the prompts to complete the installation.
3. Verify the installation by opening Terminal and typing:
   ```bash
   node -v
   npm -v
   ```

#### Step 2: Install Git (Optional)

If you need to clone a repository, install Git:

1. Git is usually pre-installed on macOS. You can verify it by opening Terminal and typing:
   ```bash
   git --version
   ```
2. If Git is not installed, you can install it using Homebrew:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   brew install git
   ```

#### Step 3: Clone Your Project Repository

If you have a project repository to work with, clone it using Git:

1. Open Terminal.
2. Navigate to the directory where you want to clone the repository:
   ```bash
   cd path/to/your/desired/directory
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repository.git
   cd your-repository
   ```

#### Step 4: Install Playwright

1. Open Terminal.
2. Navigate to your project directory:
   ```bash
   cd path/to/your/project
   ```
3. Install Playwright and other dependencies using npm:
   ```bash
   npm install
   ```

## Setting Up Environment Variables

Create a `.env` file in the root directory of your project and add the necessary environment variables. Example:

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

Ensure that your `playwright.config.js` file is properly set up. Example configuration:

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

## Writing and Running Tests

Create your test scripts in the `tests` directory. Here is an example test script:

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

## Running Your Tests

To execute the test scripts, use the following command:

```bash
npx playwright test
```

This command will run all the test scripts located in the `tests` directory.
