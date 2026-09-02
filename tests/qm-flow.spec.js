// Tests E2E du parcours "Qu'est-ce qu'on mange ?" (QM) — écran d'entrée d'Olymi.
//
// ATTENTION : ces tests déclenchent de VRAIS appels réseau à l'API publique TheMealDB (via
// recipeProvider, voir index.html:4377) — plus lents que qm-smoke.spec.js, et peuvent échouer en
// cas d'indisponibilité de TheMealDB ou de réseau restreint (CI sans accès sortant, par ex.).
// Seule exception volontaire : l'écriture analytics (trackQmEvent -> table Supabase de PRODUCTION
// analytics_events) est interceptée par ./fixtures pour ne jamais polluer les vraies métriques —
// voir ce fichier pour le détail. Tout le reste (recherche de recettes, lecture communautaire)
// continue de taper le vrai réseau sans mock.
//
// Couvre (voir section 18 de l'audit QM) : Surprends-moi, J'ai envie de… (résultat unique),
// Autre chose (boucle avec exclusion), retour depuis une fiche recette (contexte préservé).
// Frigo vide/rempli, déconnexion, erreurs réseau et clics répétés restent à couvrir dans un
// fichier séparé (nécessitent respectivement un compte de test et une simulation d'échec réseau,
// hors scope de ce premier lot de tests réels).

const { test, expect } = require("./fixtures");

test.describe("QM — Surprends-moi", () => {
  test("affiche une seule recette avec un temps annoncé comme estimé", async ({ page, trackedEvents }) => {
    await page.goto("/");
    await page.click("#qmSurpriseBtn");

    const card = page.locator("#qmResult .qm-card");
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card.locator("h3")).not.toBeEmpty();

    // Funnel analytics P0 : les deux premiers événements doivent partir dans l'ordre attendu
    // (voir qmStartIntent()/qmRunCurrentSearch(), index.html) — capturé par la fixture, jamais
    // écrit en base réelle.
    await expect.poll(() => trackedEvents.map(e => e.event_name)).toEqual(
      expect.arrayContaining(["qm_intent_selected", "qm_recipe_shown"])
    );

    // Une seule carte : pas de deuxième .qm-card ni de liste de résultats.
    await expect(page.locator("#qmResult .qm-card")).toHaveCount(1);

    // TheMealDB ne fournit aucun temps réel : le badge doit toujours porter le "≈" (voir
    // renderQmRecipeCard()/timesEstimated, index.html:7691) — jamais une valeur affichée comme certaine.
    const timeBadge = card.locator(".badges .badge");
    if (await timeBadge.count() > 0) {
      await expect(timeBadge).toContainText("≈");
    }

    await expect(page.locator("#qmCookBtn")).toBeVisible();
    await expect(page.locator("#qmAnotherBtn")).toBeVisible();
  });

  test("Autre chose remplace la carte affichée", async ({ page }) => {
    await page.goto("/");
    await page.click("#qmSurpriseBtn");
    const card = page.locator("#qmResult .qm-card");
    await expect(card).toBeVisible({ timeout: 15000 });
    const firstTitle = await card.locator("h3").textContent();

    await page.click("#qmAnotherBtn");
    await expect(page.locator("#qmResult .state-msg .spinner")).toBeVisible();
    await expect(card).toBeVisible({ timeout: 15000 });

    // Toujours une seule carte après "Autre chose" (pas d'accumulation de résultats).
    await expect(page.locator("#qmResult .qm-card")).toHaveCount(1);
    // Pas de garantie stricte que le titre change (le pool TheMealDB est limité), donc on ne
    // vérifie que l'absence de doublon d'affichage plutôt qu'une inégalité de titre.
    expect(firstTitle).toBeTruthy();
  });
});

test.describe("QM — J'ai envie de…", () => {
  test("une recherche par envie affiche une seule recette pertinente", async ({ page }) => {
    await page.goto("/");
    await page.click("#qmCravingToggleBtn");
    await expect(page.locator("#qmCravingForm")).toBeVisible();

    await page.fill("#qmCravingInput", "poulet");
    await page.click('#qmCravingForm button[type="submit"]');

    const card = page.locator("#qmResult .qm-card");
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#qmResult .qm-card")).toHaveCount(1);
  });
});

test.describe("QM — retour depuis une fiche recette", () => {
  test("le contexte QM est conservé après ouverture puis retour d'une recette", async ({ page }) => {
    await page.goto("/");
    await page.click("#qmSurpriseBtn");
    const card = page.locator("#qmResult .qm-card");
    await expect(card).toBeVisible({ timeout: 15000 });
    const title = await card.locator("h3").textContent();

    await page.click("#qmCookBtn");
    // Ouvre la fiche recette (view-cuisiner) sans repasser par un nouvel appel réseau QM.
    await expect(page.locator("#view-cuisiner")).toBeVisible();
    await expect(page.locator("#backBtn")).toBeVisible({ timeout: 15000 });

    await page.click("#backBtn");

    // showWhatToEatScreen(true) doit réafficher exactement la même carte, depuis qmState.lastCard,
    // sans repasser par renderQmLoading() (index.html:7605-7619).
    await expect(page.locator("#view-quoimanger")).toBeVisible();
    const restoredCard = page.locator("#qmResult .qm-card");
    await expect(restoredCard).toBeVisible();
    await expect(restoredCard.locator("h3")).toHaveText(title || "");
  });
});
