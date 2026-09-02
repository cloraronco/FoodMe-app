// Smoke test — écran d'entrée "Qu'est-ce qu'on mange ?" (QM) de Olymi.
//
// Objectif : valider que l'infra de tests E2E (Playwright + serveur statique local) fonctionne,
// avec un test minimal, rapide et 100% fiable en CI. Volontairement limité au DOM :
// - aucune interaction qui déclenche un vrai appel réseau (ex. clic complet sur "Surprends-moi"
//   qui lancerait un appel à TheMealDB) ;
// - on vérifie juste que l'écran QM s'affiche par défaut au chargement et que ses éléments clés
//   sont présents et cliquables.
//
// Les tests plus poussés (recherche par intention "J'ai envie de…", résultat de surprise,
// retour depuis une fiche recette, mode frigo, etc.) viendront dans un fichier séparé une fois
// cette infra validée — voir aussi index.html:7595 (section "Écran d'entrée Qu'est-ce qu'on mange ?").

const { test, expect } = require("./fixtures");

test.describe("QM — smoke", () => {
  test("l'écran \"Qu'est-ce qu'on mange ?\" s'affiche avec ses actions", async ({ page, trackedEvents }) => {
    await page.goto("/");

    // L'écran QM est le point d'entrée de l'app, affiché systématiquement au démarrage
    // (connecté ou non) — voir showWhatToEatScreen()/initAuth() dans index.html.
    const qmView = page.locator("#view-quoimanger");
    await expect(qmView).toBeVisible();

    const title = qmView.locator(".qm-hero h2");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("Qu'est-ce qu'on mange ?");

    const surpriseBtn = page.locator("#qmSurpriseBtn");
    await expect(surpriseBtn).toBeVisible();
    await expect(surpriseBtn).toBeEnabled();

    // L'instrumentation P0 doit bien se déclencher dès l'affichage de l'écran (voir
    // showWhatToEatScreen(), index.html) — vérifié ici sur l'événement intercepté par la
    // fixture (jamais écrit en base réelle), pas juste supposé fonctionner.
    await expect.poll(() => trackedEvents.map(e => e.event_name)).toContain("qm_screen_viewed");
  });
});
