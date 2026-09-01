// Config Playwright — infra E2E pour Olymi (ex-FoodMe), app single-file servie sans build.
// `index.html` vit à la racine du repo et est servi tel quel par un serveur statique local
// (paquet `serve`, lancé automatiquement par `webServer` ci-dessous) le temps des tests.
//
// @ts-check
const { defineConfig, devices } = require("@playwright/test");

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Sert la racine du repo (contenant index.html) en statique sur PORT avant de lancer les tests,
  // et coupe le serveur à la fin. `serve` sert index.html sur "/" par défaut, aucun flag de routing
  // SPA nécessaire ; `-l` fixe le port pour matcher BASE_URL ci-dessus.
  webServer: {
    command: `npx serve -l ${PORT} .`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
