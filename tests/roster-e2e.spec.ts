import { test, expect } from '@playwright/test';

test.describe('Smart Roster Management System - Assessment E2E Audit', () => {

  test('Journey 1: Operations Dashboard loads with KPIs and operational units', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Header and title
    await expect(page.locator('h1')).toContainText('Operations & CX Scheduling Command');

    // KPI Cards: 32 Team Members, 3 Pods, 10 Brands
    await expect(page.locator('text=32').first()).toBeVisible();
    await expect(page.locator('text=Pod Alpha (Beauty & Wellness)')).toBeVisible();
    await expect(page.locator('text=Pod Beta (Fashion & Lifestyle)')).toBeVisible();
    await expect(page.locator('text=Pod Gamma (Electronics & Appliances)')).toBeVisible();
  });

  test('Journey 2: Interactive Roster Hub & 5 Required Views', async ({ page }) => {
    await page.goto('/roster');
    await page.waitForLoadState('networkidle');

    // Title and matrix table
    await expect(page.locator('h1')).toContainText('Roster Management Hub');
    await expect(page.locator('table')).toBeVisible();

    // The 5 mandatory views
    await expect(page.getByRole('button', { name: /Company-Wide View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pod-Wise View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Brand-Wise View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Process-Wise View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Employee-Wise View/i })).toBeVisible();

    // Pod View toggle
    await page.getByRole('button', { name: /Pod-Wise View/i }).click();
    await expect(page.locator('text=Pod Alpha')).toBeVisible();

    // Brand View toggle
    await page.getByRole('button', { name: /Brand-Wise View/i }).click();
    await expect(page.locator('text=Glow Aura Skincare')).toBeVisible();

    // Process View toggle
    await page.getByRole('button', { name: /Process-Wise View/i }).click();
    await expect(page.locator('text=Customer Support (CS)')).toBeVisible();

    // Employee View toggle
    await page.getByRole('button', { name: /Employee-Wise View/i }).click();
    await expect(page.locator('.fc')).toBeVisible(); // FullCalendar element
  });

  test('Journey 3: Company-Wide Matrix verifies Neha 5 LV & Rahul 4 LV & Active Shifts', async ({ page }) => {
    await page.goto('/roster');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('table')).toBeVisible();

    // Verify Neha Verma has working badges and 5 LV cells
    const nehaRow = page.locator('tbody tr', { hasText: 'Neha Verma' });
    await expect(nehaRow).toBeVisible();
    await expect(nehaRow.locator('text=GL').first()).toBeVisible(); // Working Glow Aura
    const nehaLvCount = await nehaRow.locator('text=LV').count();
    expect(nehaLvCount).toBe(5);

    // Verify Rahul Sharma has working badges and 4 LV cells
    const rahulRow = page.locator('tbody tr', { hasText: 'Rahul Sharma' });
    await expect(rahulRow).toBeVisible();
    await expect(rahulRow.locator('text=NE').first()).toBeVisible(); // Working NexaStyle
    const rahulLvCount = await rahulRow.locator('text=LV').count();
    expect(rahulLvCount).toBe(4);

    // Verify Vikram Joshi has working badges
    const vikramRow = page.locator('tbody tr', { hasText: 'Vikram Joshi' });
    await expect(vikramRow).toBeVisible();
    await expect(vikramRow.locator('text=DA').first()).toBeVisible(); // Working Daily Brew
  });

  test('Journey 4: Dynamic Change & Impact Simulator (Section 3.F)', async ({ page }) => {
    await page.goto('/change-simulator');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Dynamic Change & Impact Simulator');

    // Run absence simulation
    const simBtn = page.getByRole('button', { name: /Simulate Sudden Absence/i });
    await simBtn.click();

    // Verify coverage gap detection & system-recommended qualified substitutes
    await expect(page.locator('text=SYSTEM-RECOMMENDED QUALIFIED SUBSTITUTES')).toBeVisible();
    await expect(page.locator('text=Candidates Found')).toBeVisible();

    // Assign replacement & rebalance
    const assignBtn = page.getByRole('button', { name: /Assign as Replacement & Rebalance/i }).first();
    await assignBtn.click();

    // Verify success banner
    await expect(page.locator('text=Coverage restored to 100%!')).toBeVisible();
  });

  test('Journey 5: Brands & Operating Calendars (80% Single-Resource rule)', async ({ page }) => {
    await page.goto('/brands');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Brand Operational Calendars');
    await expect(page.locator('text=Glow Aura Skincare')).toBeVisible();
    await expect(page.locator('text=365 Days Continuous')).toBeVisible();
    await expect(page.locator('text=Single-Resource Dedicated (~80%)').first()).toBeVisible();
  });

  test('Journey 6: Teams & Pod Leads directory', async ({ page }) => {
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Operational Teams & Pod Leads');
    await expect(page.locator('text=Aarav Sharma')).toBeVisible();
    await expect(page.locator('text=Pod Lead').first()).toBeVisible();
  });

  test('Journey 7: Leaves, Comp-Offs & Public Holidays', async ({ page }) => {
    await page.goto('/leaves');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Leaves, Comp-Offs & Holidays');
    await expect(page.locator('text=Christmas Day')).toBeVisible();
    await expect(page.locator('text=Neha Verma')).toBeVisible();
  });

});
