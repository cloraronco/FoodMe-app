# FoodMe-app (Olymi)

## Projet
Olymi — "Share your taste". App de gestion de frigo/stock et de recettes personnelles :
suivi des ingrédients, quantités, restes (48h) et statut de conservation, recettes
perso avec portions et autocomplétion d'ingrédients, mode sombre.

## Stack
- Application **single-file** : tout le code (HTML/CSS/JS) vit dans `index.html` à la racine.
- Pas de build, pas de bundler : le fichier est servi tel quel.
- Persistance côté client via `localStorage` (clé `foodme_settings` pour les réglages, thème inclus).
- UI en français.

## Ressources design à utiliser
- **21st.dev** — bibliothèque de composants UI à privilégier pour toute nouvelle interface
  ou refonte de composant existant.
- **GSAP** — librairie d'animation à privilégier pour toute animation (transitions, micro-interactions).

## Conventions de travail
- Développer sur une branche dédiée, jamais direct sur la branche par défaut.
- Avant toute modif touchant `index.html` : lire le contexte autour (le fichier est volumineux,
  ne pas réécrire en aveugle — cibler la section concernée).
- Tester le golden path (ajout ingrédient, création recette, gestion des restes) et le mode sombre
  après toute modif UI, si un navigateur est disponible dans la session.
- Review de code avec la même rigueur, que le code vienne de Claude, de Codex ou d'un humain.
- Commits clairs et descriptifs (le repo suit déjà ce style, ex. "fix: QM au démarrage + déconnexion propre").
