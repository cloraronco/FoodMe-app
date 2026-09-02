// Fixture partagée pour les tests QM : intercepte les écritures analytics vers Supabase.
//
// L'écran "Qu'est-ce qu'on mange ?" envoie de vrais événements (trackQmEvent(), voir
// index.html) vers la table analytics_events du projet Supabase de PRODUCTION à chaque action
// (qm_screen_viewed, qm_intent_selected, etc.) — y compris au simple chargement de la page.
// Sans interception, chaque run de la suite (local ou CI) pollue les vraies métriques avec du
// bruit de test. On bloque donc uniquement cet endpoint et on répond nous-mêmes avec succès :
// tout le reste (TheMealDB, lecture des recettes communautaires) continue de taper le vrai
// réseau sans modification — seule l'écriture analytics est neutralisée.
//
// Bonus : les requêtes interceptées sont exposées via la fixture `trackedEvents`, ce qui permet
// aux tests de vérifier que l'instrumentation envoie bien les bons événements, sans jamais
// écrire quoi que ce soit en base réelle.

const base = require("@playwright/test");

const test = base.test.extend({
  // auto:true : l'interception doit être active même si un test n'a besoin que de `page` et ne
  // référence jamais `trackedEvents` explicitement (Playwright n'exécute une fixture que si elle
  // est demandée — sans ce flag, un test qui ignore `trackedEvents` taperait la vraie prod).
  trackedEvents: [async ({ page }, use) => {
    const events = [];
    await page.route("**/rest/v1/analytics_events*", (route) => {
      try {
        const body = route.request().postDataJSON();
        events.push(body);
      } catch (e) { /* corps non-JSON, ignoré : pas censé arriver ici */ }
      route.fulfill({ status: 201, contentType: "application/json", body: "[]" });
    });
    await use(events);
  }, { auto: true }],
});

module.exports = { test, expect: base.expect };
