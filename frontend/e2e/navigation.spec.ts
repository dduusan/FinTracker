import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect /transactions to login when not authenticated", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect /categories to login when not authenticated", async ({ page }) => {
    await page.goto("/categories");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect /budgets to login when not authenticated", async ({ page }) => {
    await page.goto("/budgets");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page should have correct title", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/FinTracker/);
  });
});
