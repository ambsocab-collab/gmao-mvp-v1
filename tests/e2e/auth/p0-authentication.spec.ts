import { test, expect } from "@playwright/test";

// Test data
const TEST_CREDENTIALS = {
  email: "test@example.com",
  password: "test123456",
  invalidPassword: "wrongpassword",
  invalidEmail: "invalid-email",
};

test.describe("Authentication Flow - P0 Critical", () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar cookies antes de cada test
    await page.context().clearCookies();
  });

  test("should display login page with proper industrial UI elements", async ({ page }) => {
    await page.goto("/login");

    // Verificar título y estructura
    await expect(page).toHaveTitle(/GMAO MVP/);
    await expect(page.locator("h1")).toContainText("GMAO MVP");
    await expect(page.locator("p.text-lg")).toContainText("Sistema de Mantenimiento Industrial");

    // Verificar formulario elements usando data-testid
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

    // Verificar industrial design (botón grande >44px)
    const submitButton = page.locator('[data-testid="login-button"]');
    const boundingBox = await submitButton.boundingBox();
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
    expect(boundingBox?.width).toBeGreaterThanOrEqual(44);

    // Verificar high contrast elements
    await expect(submitButton).toHaveCSS("background-color", /rgb\(37, 99, 235\)|rgb\(29, 78, 216\)/); // blue-600/blue-700
    await expect(page.locator('[class*="bg-white"]')).toHaveCSS("background-color", /rgb\(255, 255, 255\)/); // white

    // Verificar placeholders
    await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute("placeholder", "tu@email.com");
    await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute("placeholder", "Tu contraseña");
  });

  test("should show validation errors for invalid form input", async ({ page }) => {
    await page.goto("/login");

    // Submit form vacío
    await page.click('[data-testid="login-button"]');

    // Verificar errores de validación
    await expect(page.locator("text=El email es requerido")).toBeVisible();
    await expect(page.locator("text=La contraseña es requerida")).toBeVisible();

    // Email inválido
    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.invalidEmail);
    await page.click('[data-testid="login-button"]');
    await expect(page.locator("text=Email inválido")).toBeVisible();

    // Contraseña muy corta
    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.email);
    await page.fill('[data-testid="password-input"]', "123");
    await page.click('[data-testid="login-button"]');
    await expect(page.locator("text=La contraseña debe tener al menos 6 caracteres")).toBeVisible();
  });

  test("should show error message for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    // Llenar formulario con credenciales inválidas
    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.email);
    await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.invalidPassword);
    await page.click('[data-testid="login-button"]');

    // Verificar que aparezca mensaje de error
    await expect(page.locator("text=Email o contraseña incorrectos")).toBeVisible();

    // Verificar que no redirija
    await expect(page).toHaveURL(/\/login/);
  });

  test("should handle password visibility toggle", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.locator('[data-testid="password-input"]');
    const toggleButton = page.locator('button[aria-label*="contraseña"], button:has(svg)').first();

    // Por defecto debe estar oculto
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Hacer clic para mostrar
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Hacer clic nuevamente para ocultar
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should show loading state during login attempt", async ({ page }) => {
    await page.goto("/login");

    // Mock de respuesta lenta para ver loading
    await page.route("**/auth/v1/token", async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid login credentials"
        })
      });
    });

    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.email);
    await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.password);
    await page.click('[data-testid="login-button"]');

    // Verificar loading state
    await expect(page.locator('[data-testid="login-button"]')).toContainText("Iniciando sesión...");
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
    await expect(page.locator('svg[aria-hidden="true"]')).toBeVisible(); // spinner

    // Verificar que loading desaparezca después del error
    await expect(page.locator("text=Email o contraseña incorrectos")).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toContainText("Iniciar Sesión");
    await expect(page.locator('[data-testid="login-button"]')).toBeEnabled();
  });

  test("should redirect unauthenticated users from protected routes", async ({ page }) => {
    // Intentar acceder a ruta protegida sin estar autenticado
    await page.goto("/dashboard");

    // Debe redirigir a login
    await expect(page).toHaveURL(/\/login/);

    // Verificar que preserve redirectTo en query params
    const url = page.url();
    expect(url).toContain("redirectTo=%2Fdashboard");
  });

  test("should handle redirect after successful login", async ({ page }) => {
    // Ir a login con redirectTo param
    await page.goto("/login?redirectTo=%2Fdashboard%2Ftest-auth");

    // Mock de login exitoso
    await page.route("**/auth/v1/token", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock_access_token",
          refresh_token: "mock_refresh_token",
          expires_in: 3600,
          user: {
            id: "mock_user_id",
            email: TEST_CREDENTIALS.email,
            user_metadata: { full_name: "Test User" }
          }
        })
      });
    });

    // Mock de getUser profile
    await page.route("**/rest/v1/profiles*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "mock_user_id",
          email: TEST_CREDENTIALS.email,
          full_name: "Test User",
          role: "operator",
          capacity_level: null,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
    });

    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.email);
    await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.password);
    await page.click('[data-testid="login-button"]');

    // Verificar que redirija a la URL solicitada originalmente
    await expect(page).toHaveURL(/\/dashboard\/test-auth/);
  });

  test("should show appropriate error handling for network failures", async ({ page }) => {
    await page.goto("/login");

    // Simular error de red
    await page.route("**/auth/v1/token", async (route) => {
      await route.abort("failed");
    });

    await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.email);
    await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.password);
    await page.click('[data-testid="login-button"]');

    // Verificar mensaje de error genérico
    await expect(page.locator("text=Error al iniciar sesión. Inténtalo de nuevo")).toBeVisible();
  });

  test("should show redirect message when accessing login from protected route", async ({ page }) => {
    // Ir a ruta protegida para que redirija a login
    await page.goto("/dashboard/orders");

    // Verificar mensaje de redirección
    await expect(page.locator("text=Por favor inicia sesión para acceder a la página solicitada")).toBeVisible();
  });

  test("should disable form during submission", async ({ page }) => {
    await page.goto("/login");

    // Mock de respuesta lenta
    await page.route("**/auth/v1/token", async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid login credentials"
        })
      });
    });

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('[data-testid="password-input"]');

    await emailInput.fill(TEST_CREDENTIALS.email);
    await passwordInput.fill(TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Verificar que los inputs estén deshabilitados durante loading
    await expect(emailInput).toBeDisabled();
    await expect(passwordInput).toBeDisabled();
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
  });
});