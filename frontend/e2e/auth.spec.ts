import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should show login page by default", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Sign in to your account")).toBeVisible();
  });

  test("should have link to register page", async ({ page }) => {
    await page.goto("/login");
    const registerLink = page.getByRole("link", { name: /sign up/i });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("should show register page with form fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText("Create a new account")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
  });

  test("should show validation errors on empty login submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Form validation should prevent submission — still on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("should navigate between login and register", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
