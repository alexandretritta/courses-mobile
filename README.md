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
- Progression `X/Y cochés` + coût restant estimé
- Effacer les cochés / réinitialiser la liste type
- Sauvegarde `localStorage`
