import { test, expect } from '@playwright/test';

test.describe('Pay Insights & Outliers Flows', () => {
  test('switches to pay insights and views grouped metrics and outlier analytics', async ({ page }) => {
    await page.goto('/');

    // Navigate to Pay Insights & Outliers tab
    await page.getByRole('button', { name: /Pay Insights & Outliers/i }).click();

    // Verify page title and metric summaries
    await expect(page.getByRole('heading', { name: 'Pay Distribution & Outlier Insights' })).toBeVisible();
    await expect(page.getByText('Grouped Salary Statistics (USD)')).toBeVisible();

    // Check grouping selector
    const groupBySelect = page.getByLabel(/Group By:/i);
    await expect(groupBySelect).toBeVisible();
    await groupBySelect.selectOption('level');

    // Wait for table to update
    await expect(page.getByText('Level')).toBeVisible();

    // Check Outliers table
    await expect(page.getByRole('heading', { name: 'Statistical Salary Outliers (1.5 × IQR Rule)' })).toBeVisible();
    await expect(page.getByText(/Linear interpolation method/i)).toBeVisible();
  });
});
