# Courses mobile — Alexandre Tritta

PWA française (thème sombre athlétique) pour **cut handball** : scanner Open Food Facts → bibliothèque d’aliments, menus perso, suggestions optionnelles, liste de courses Lidl / Super U (Voiron / Saint-Cassien).

Base GitHub Pages : `/courses-mobile/`.

## Lancer en local

```bash
cd courses-mobile
npm install
npm run dev
```

URL typique : `http://localhost:5174/courses-mobile/`.

Build / preview :

```bash
npm run build
npm run preview
```

## Déployer sur GitHub Pages

1. `npm run build` → dossier `dist/`
2. Publier `dist/` sur la branche `gh-pages` (ou Actions) avec site à la racine du dépôt **ou** en s’assurant que l’URL est `https://<user>.github.io/courses-mobile/`
3. `vite.config.ts` a déjà `base: '/courses-mobile/'`

## Onglets (nav bas)

| Onglet | Rôle |
|--------|------|
| **Scanner** | Caméra / EAN → fiche OFF (nom, marque, image, Nutri-Score, kcal & macros) → **Bibliothèque** |
| **Bibliothèque** | Aliments persistés (`localStorage`), édition / suppression, ajout aux courses, seed ~15 aliments |
| **Mes menus** | Création libre de repas (créneau + aliments + grammes). Ajout → courses (dédup) |
| **Suggestions** | Idées high-protein **optionnelles** — Accepter → Mes menus + courses, ou Ignorer |
| **Courses** | Liste groupée Lidl / Super U / Autre, kcal pour la qté, prix estimé, cases à cocher |

## Données

- Tout est en `localStorage` (clés `courses-mobile-*-v2`)
- Offline-ish après premier chargement (PWA + SW) ; **nouveaux scans** nécessitent le réseau (API Open Food Facts)
- Seed starter réinjectable depuis Bibliothèque

## Scanner

1. Autorise la caméra (HTTPS ou localhost)
2. Ou saisis un EAN (ex. `3017620422003`)
3. Vérifie / complète nutrition → **Enregistrer dans la bibliothèque**

Fallback : BarcodeDetector natif, sinon `@zxing/browser`.

## Stack

Vite · React · TypeScript · Tailwind v4 · PWA manuelle (`public/sw.js` + `manifest.json`)

## Open Food Facts

Fiches via [Open Food Facts](https://world.openfoodfacts.org/) (ODbL, images CC). Aucune clé API.
