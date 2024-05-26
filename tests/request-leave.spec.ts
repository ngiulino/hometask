
import { test, expect } from '@playwright/test';

test('Check leaves menu items and switch to manager account', async ({ page }) => {
  // Login Function
  const login = async (email: string, password: string) => {
    await page.goto('https://access.hrblizz.dev/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('.focus-border.button-main__wrapper');
  };

  // Logout Function
  const logout = async () => {
    await page.click('.profile-menu__toggle');
    await page.waitForSelector('div.profile-dropdown__sign-out', { state: 'visible' });
    await page.click('div.profile-dropdown__sign-out');
    
  };

  // Employee login
  await login('demo+DJ-01109@mercans.com', 'Employee1!');

  // Check menu Leaves - My leaves
  const myLeaves = await page.click('text=Leaves');
  await page.click('text=My leaves');
  await page.click('text=Calendar');

  // Logout
  await logout();

  // Manager login
  await login('demo+VF-00309@mercans.com', 'Manager1!');

  // Check menu Leaves - My leaves manager
  const myLeavesManger = await page.click('text=Leaves');
  await page.click('text=My leaves');
  await page.click('text=Calendar');
  await page.click('text=Approvals');
  await page.click('text=Leaves');

  // Logout 
  await logout();
});
