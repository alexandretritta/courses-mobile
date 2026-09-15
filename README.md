# Courses — liste mobile

Liste de courses ultra-simple (Lidl / Super U / Autre) pour Voiron / Saint-Cassien.  
Thème sombre type Nutrition Pro · français · PWA (écran d’accueil).

## Lancer en local

```bash
cd courses-mobile
npm install
npm run dev
```

Ouvre l’URL affichée (ex. `http://localhost:5174`).

Build production :

```bash
npm run build
npm run preview
```

## Ouvrir sur le téléphone

**Même Wi‑Fi :**

1. Sur le PC : `npm run dev` (ou `npm run preview` après build).
2. Note l’IP locale affichée par Vite (`Network: http://192.168.x.x:5174`).
3. Sur l’iPhone / Android, ouvre cette URL dans Safari / Chrome.

Si l’IP n’apparaît pas, lance avec `npm run dev -- --host` (déjà activé dans `vite.config.ts`).

## Installer sur l’écran d’accueil (PWA)

**iPhone (Safari)**  
Partager → **Sur l’écran d’accueil** → Ajouter.

**Android (Chrome)**  
Menu ⋮ → **Ajouter à l’écran d’accueil** / **Installer l’application**.

L’icône « Courses » s’ouvre en plein écran (thème sombre).

## Fonctionnalités

- Cases à cocher larges, onglets Lidl / Super U / Autre
- Ajout article (nom, qté, magasin, prix)
- **Scanner** un code-barres (caméra) ou saisie manuelle → fiche produit → ajout Lidl / Super U / Autre
- Progression `X/Y cochés` + coût restant estimé
- Effacer les cochés / réinitialiser la liste type
- Sauvegarde `localStorage`

## Scanner un code-barres

Bouton **Scanner** (à côté d’Ajouter) :

1. Autorise la caméra, vise le code du produit (EAN-13, EAN-8, UPC).
2. Ou saisis le code à la main (pratique sur ordinateur).
3. La fiche s’affiche (nom, marque, Nutri-Score, photo) via Open Food Facts.
4. Ajuste la qté (préremplie à `1`) et le prix, puis **Ajouter à Lidl** (défaut), Super U ou Autre.

Produit inconnu : tu peux quand même taper un nom et l’ajouter.

### Caméra & permissions

- La caméra ne fonctionne qu’en **HTTPS** ou sur `localhost`.
- Si le navigateur bloque l’accès : réglages du site → Caméra → Autoriser.
- Sur iPhone : Safari (ou l’app PWA ajoutée à l’écran d’accueil) ; accorde la caméra au premier scan.
- Fallback : saisie manuelle du code, toujours disponible.

Exemples pour tester sans caméra :

- Nutella : `3017620422003`
- Produit inconnu : `0000000000000`

## Open Food Facts

Fiches produits fournies par [Open Food Facts](https://world.openfoodfacts.org/), base libre et collaborative (données ODbL, images Creative Commons). Aucune clé API.
