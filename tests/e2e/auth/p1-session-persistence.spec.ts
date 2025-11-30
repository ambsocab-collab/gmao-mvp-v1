import { test, expect } from "@playwright/test";

const TEST_CREDENTIALS = {
  email: "test@example.com",
  password: "test123456",
};

test.describe("Session Persistence - P1 Important", () => {
  test("should maintain authentication session across browser restarts", async ({ page, _context }) => {
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
          capacity_level: "N2",
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
    });

    // 1. Iniciar sesión
    await page.goto("/login");
    await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Verificar que redirige al dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Verificar que el usuario está autenticado
    await page.goto("/dashboard/test-auth");
    await expect(page.locator("text=Autenticado: SÍ")).toBeVisible();
    await expect(page.locator(`text=${TEST_CREDENTIALS.email}`)).toBeVisible();

    // 3. Simular reinicio del navegador (guardar cookies y localStorage)
    const cookies = await context.cookies();
    const localStorage = await page.evaluate(() => {
      return { ...localStorage };
    });

    // 4. Cerrar y reabrir browser simulation
    await context.close();

    // Crear nuevo contexto con las mismas cookies
    const newContext = await page.browser().newContext();
    await newContext.addCookies(cookies);

    const newPage = await newContext.newPage();

    // Restaurar localStorage
    await newPage.evaluate((data) => {
      Object.keys(data).forEach(key => {
        localStorage.setItem(key, data[key]);
      });
    }, localStorage);

    // 5. Ir directamente a página protegida sin pasar por login
    await newPage.goto("/dashboard/test-auth");

    // 6. Verificar que la sesión persistió
    await expect(newPage.locator("text=Autenticado: SÍ")).toBeVisible();
    await expect(newPage.locator(`text=${TEST_CREDENTIALS.email}`)).toBeVisible();

    await newContext.close();
  });

  test("should handle session expiry gracefully", async ({ page }) => {
    // Mock de sesión expirada
    await page.route("**/auth/v1/user", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: "token_expired",
          error_description: "JWT expired"
        })
      });
    });

    // Intentar acceder a ruta protegida con token expirado
    await page.goto("/dashboard/test-auth");

    // Debe redirigir a login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should clear session on logout", async ({ page, context }) => {
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

    // Mock de logout
    await page.route("**/auth/v1/logout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({})
      });
    });

    // 1. Iniciar sesión
    await page.goto("/login");
    await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // 2. Verificar que está autenticado
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("text=Hey, test@example.com!")).toBeVisible();

    // 3. Hacer logout
    await page.click('button:has-text("Cerrar sesión")');

    // 4. Verificar que redirige a login
    await expect(page).toHaveURL(/\/login/);

    // 5. Intentar acceder a ruta protegida después de logout
    await page.goto("/dashboard/test-auth");

    // 6. Debe redirigir a login nuevamente
    await expect(page).toHaveURL(/\/login/);
  });

  test("should handle concurrent tab authentication", async ({ context }) => {
    // Mock de login exitoso
    await context.route("**/auth/v1/token", async (route) => {
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
    await context.route("**/rest/v1/profiles*", async (route) => {
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

    // 1. Abrir primera pestaña y hacer login
    const page1 = await context.newPage();
    await page1.goto("/login");
    await page1.fill('input[name="email"]', TEST_CREDENTIALS.email);
    await page1.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page1.click('button[type="submit"]');

    // 2. Verificar autenticación en primera pestaña
    await expect(page1).toHaveURL(/\/dashboard/);

    // 3. Abrir segunda pestaña y acceder a ruta protegida
    const page2 = await context.newPage();
    await page2.goto("/dashboard/test-auth");

    // 4. Verificar que segunda pestaña también esté autenticada
    await expect(page2.locator("text=Autenticado: SÍ")).toBeVisible();
    await expect(page2.locator(`text=${TEST_CREDENTIALS.email}`)).toBeVisible();

    // 5. Hacer logout en segunda pestaña
    await page2.click('button:has-text("Cerrar sesión")');

    // 6. Verificar que primera pestaña también afectada
    await page1.bringToFront();
    await page1.goto("/dashboard/test-auth");
    await expect(page1).toHaveURL(/\/login/);

    await page1.close();
    await page2.close();
  });

  test("should maintain authentication across navigation", async ({ page }) => {
    // Mock de login exitoso y profile
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

    await page.route("**/rest/v1/profiles*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "mock_user_id",
          email: TEST_CREDENTIALS.email,
          full_name: "Test User",
          role: "operator",
          capacity_level: "N3",
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
    });

    // 1. Iniciar sesión
    await page.goto("/login");
    await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // 2. Navegar por diferentes rutas protegidas
    const protectedRoutes = [
      "/dashboard",
      "/dashboard/test-auth",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      // Verificar que no redirija a login
      await expect(page).not.toHaveURL(/\/login/);

      // Si es test-auth, verificar contenido específico
      if (route.includes("test-auth")) {
        await expect(page.locator("text=Autenticado: SÍ")).toBeVisible();
      }
    }

    // 3. Volver a login y verificar que redirige a dashboard
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});