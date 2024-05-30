import { test, expect, Page } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// Load environment variables from .env file
const BASE_URL = process.env.BASE_URL;
const EMPLOYEE_EMAIL = process.env.EMPLOYEE_EMAIL;
const EMPLOYEE_PASSWORD = process.env.EMPLOYEE_PASSWORD;
const MANAGER_EMAIL = process.env.MANAGER_EMAIL;
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD;

// Ensure all required environment variables are set
if (!BASE_URL || !EMPLOYEE_EMAIL || !EMPLOYEE_PASSWORD || !MANAGER_EMAIL || !MANAGER_PASSWORD) {
  throw new Error('One or more required environment variables are missing');
}

test.describe('Check leaves menu items and switch to manager account', () => {
  // Increase overall test timeout to 90 seconds
  test.setTimeout(90000);

  // Login Function
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

  // Logout Function
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

  // Function to check Leaves menu items for an employee
  const checkLeavesMenu = async (page: Page) => {
    console.log('Checking Leaves menu items');
    await page.click('text=Leaves');
    await page.waitForSelector('text=My leaves', { timeout: 15000 });
    await page.click('text=My leaves');
    await page.waitForSelector('text=Calendar', { timeout: 15000 });
    await page.click('text=Calendar');
  };

  // Function to check additional menu items for a manager
  const checkManagerMenu = async (page: Page) => {
    console.log('Checking Leaves menu items for manager');
    await checkLeavesMenu(page); // Check common Leaves menu items
    await page.waitForSelector('text=Approvals', { timeout: 15000 });
    await page.click('text=Approvals');
    await page.waitForSelector('text=Leaves', { timeout: 15000 });
    await page.click('text=Leaves');
  };

  // Test case for employee menu check
  test('Employee leaves menu check', async ({ page }) => {
    await login(page, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD); // Employee login
    await checkLeavesMenu(page); // Check Leaves menu
    await logout(page); // Employee logout
  });

  // Test case for manager menu check
  test('Manager leaves menu check', async ({ page }) => {
    await login(page, MANAGER_EMAIL, MANAGER_PASSWORD); // Manager login
    await checkManagerMenu(page); // Check Leaves and additional manager menu items
    await logout(page); // Manager logout
  });
});
