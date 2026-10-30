import { test, expect } from '@playwright/test';

test.describe('Employee Management Flows', () => {
  test('browses, searches, filters, and paginates employees', async ({ page }) => {
    await page.goto('/');

    // Wait for initial load
    await expect(page.getByRole('heading', { name: 'ACME PayDesk' })).toBeVisible();
    await expect(page.getByText(/Showing \d+ to \d+ of/)).toBeVisible();

    // Check search input
    const searchInput = page.getByPlaceholder(/Search by name or email/i);
    await searchInput.fill('Seed');
    await page.waitForTimeout(400); // debounce

    // Check pagination controls
    const nextBtn = page.getByRole('button', { name: /Next page/i });
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await expect(page.getByText(/Page 2 of/)).toBeVisible();
    }

    // Check direct page navigation
    const pageInput = page.getByRole('textbox', { name: /Page number/i });
    if (await pageInput.isVisible()) {
      await pageInput.fill('3');
      await page.getByRole('button', { name: /^Go$/i }).click();
      await expect(page.getByText(/Page 3 of/)).toBeVisible();
    }
  });

  test('creates a new employee with valid money input and checks directory', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test.e2e.${timestamp}@acme.corp`;
    const testName = `E2E Tester ${timestamp}`;

    await page.goto('/');

    // Open Add Employee Modal
    await page.getByRole('button', { name: /Add Employee/i }).click();
    await expect(page.getByRole('heading', { name: 'Add New Employee' })).toBeVisible();

    // Fill form
    await page.getByLabel(/Full Name/i).fill(testName);
    await page.getByLabel(/Email Address/i).fill(testEmail);
    await page.getByLabel(/Department/i).selectOption('Engineering');
    await page.getByLabel(/Country/i).selectOption('US');
    await page.getByLabel(/Level/i).selectOption('L4');
    await page.getByLabel(/Currency/i).selectOption('USD');
    await page.getByLabel(/Annual Salary/i).fill('145000.50');

    // Submit
    await page.getByRole('button', { name: /Create Employee/i }).click();

    // Wait for modal to close and search for new employee
    await expect(page.getByRole('heading', { name: 'Add New Employee' })).not.toBeVisible();

    const searchInput = page.getByPlaceholder(/Search by name or email/i);
    await searchInput.fill(testEmail);
    await page.waitForTimeout(400); // debounce

    await expect(page.getByText(testName)).toBeVisible();
    await expect(page.getByText(testEmail)).toBeVisible();
    await expect(page.getByText('USD 145,000.50')).toBeVisible();
  });

  test('updates salary and verifies audit history drawer', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `salary.e2e.${timestamp}@acme.corp`;
    const testName = `Salary Adjuster ${timestamp}`;

    await page.goto('/');

    // Create unique employee first
    await page.getByRole('button', { name: /Add Employee/i }).click();
    await page.getByLabel(/Full Name/i).fill(testName);
    await page.getByLabel(/Email Address/i).fill(testEmail);
    await page.getByLabel(/Department/i).selectOption('Product');
    await page.getByLabel(/Country/i).selectOption('US');
    await page.getByLabel(/Level/i).selectOption('L3');
    await page.getByLabel(/Currency/i).selectOption('USD');
    await page.getByLabel(/Annual Salary/i).fill('90000');
    await page.getByRole('button', { name: /Create Employee/i }).click();

    await expect(page.getByRole('heading', { name: 'Add New Employee' })).not.toBeVisible();

    // Search for employee
    const searchInput = page.getByPlaceholder(/Search by name or email/i);
    await searchInput.fill(testEmail);
    await page.waitForTimeout(400);

    const employeeRow = page.getByRole('row', { name: new RegExp(testName, 'i') });
    await expect(employeeRow).toBeVisible();

    // Click Update Salary
    await employeeRow.getByRole('button', { name: /Update salary/i }).click();
    await expect(page.getByRole('heading', { name: 'Update Salary' })).toBeVisible();

    // Fill new salary & reason
    await page.getByLabel(/New Annual Salary/i).fill('105000');
    await page.getByLabel(/Reason for Change/i).fill('Mid-year promotion review');
    await page.getByRole('button', { name: /Save New Salary/i }).click();

    await expect(page.getByRole('heading', { name: 'Update Salary' })).not.toBeVisible();
    await expect(employeeRow.getByText('USD 105,000.00')).toBeVisible();

    // View History Drawer
    await employeeRow.getByRole('button', { name: /View salary history/i }).click();
    await expect(page.getByRole('heading', { name: 'Salary History' })).toBeVisible();
    await expect(page.getByText('Mid-year promotion review')).toBeVisible();
    await expect(page.getByText('USD 105,000.00')).toBeVisible();
    await expect(page.getByText('USD 90,000.00')).toBeVisible();

    // Close Drawer
    await page.getByRole('button', { name: /Close drawer/i }).click();
    await expect(page.getByRole('heading', { name: 'Salary History' })).not.toBeVisible();
  });
});
