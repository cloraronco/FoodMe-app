// Mode sombre — écran "Qu'est-ce qu'on mange ?" (QM).
//
// Le mode sombre est un réglage localStorage pur (`foodme_settings.theme`), indépendant de la
// connexion (voir index.html:4-9, appliqué avant le premier affichage pour éviter un flash de
// thème clair) : testable sans compte, contrairement au reste du parcours connecté/déconnexion.
//
// Les icônes SVG des boutons QM (Surprends-moi, J'ai envie de…) utilisent stroke="currentColor"
// (voir index.html, section "Écran d'entrée Qu'est-ce qu'on mange ?") : pas de couleur figée, donc
// pas de vérification pixel par pixel nécessaire ici — on vérifie que le token --ink change bien de
// valeur en mode sombre (donc que les icônes suivront), pas leur rendu visuel exact.

const { test, expect } = require("./fixtures");

test.describe("QM — mode sombre", () => {
  test.beforeEach(async ({ page }) => {
    // Injecté avant tout script de la page (comme le script inline en tête d'index.html qui lit
    // ce même localStorage) : le thème doit déjà être actif au tout premier rendu, pas appliqué
    // après coup par un toggle.
    await page.addInitScript(() => {
      localStorage.setItem("foodme_settings", JSON.stringify({ theme: "dark" }));
    });
  });

  test("applique le thème sombre dès le chargement, y compris sur les icônes QM", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Confirme que le thème n'est pas juste marqué mais réellement appliqué (valeurs de
    // index.html, bloc `html[data-theme="dark"]`) — sans ça, un data-theme="dark" inerte (ex.
    // règle CSS supprimée par erreur) passerait à tort le test précédent.
    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
    expect(bg).toBe("#141813");

    const surpriseBtn = page.locator("#qmSurpriseBtn");
    await expect(surpriseBtn).toBeVisible();
    // Les icônes (stroke="currentColor"/fill="currentColor") suivent la couleur de texte du
    // bouton : si --ink est bien la valeur sombre, l'icône l'est aussi, sans avoir besoin de
    // capturer un pixel.
    const btnColor = await surpriseBtn.evaluate((el) => getComputedStyle(el).color);
    expect(btnColor).toBe("rgb(243, 237, 230)"); // --ink en sombre : #F3EDE6

    await expect(surpriseBtn.locator("svg.icon")).toBeVisible();
    await expect(page.locator("#qmCravingToggleBtn svg.icon")).toBeVisible();
  });
});
