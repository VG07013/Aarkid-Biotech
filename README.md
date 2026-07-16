# Aarkid Biotech Website

Static website for Aarkid Biotech Pvt. Ltd. It includes a responsive marketing site, product catalogue, professional motion effects, and a symptom-based medicine catalogue search.

## Features

- Responsive single-page website
- Clean professional animations with reduced-motion support
- Medicines top-bar section
- Catalogue search with ranked related results
- Safety messaging for urgent, clinician-only, and antibiotic-related searches
- Local assets only, suitable for GitHub Pages
- Node test suite for HTML, assets, navigation, and catalogue search behavior

## Project Structure

```text
.
+-- assets/
+-- tests/
+-- contact-responsive.css
+-- index.html
+-- medicine-matcher.js
+-- medicine-search.js
+-- package.json
+-- script.js
+-- styles.css
```

## Run Locally

This is a static site. Open `index.html` directly in a browser, or serve the folder with any static file server.

```bash
npm test
npm run check
```

## GitHub Pages

The site is ready for GitHub Pages from the repository root:

1. Push the project to GitHub.
2. Go to repository Settings > Pages.
3. Set the source to the default branch and root folder.
4. Save, then open the generated Pages URL.

The included `.nojekyll` file keeps GitHub Pages from applying Jekyll processing.

## Medical Notice

The medicine finder searches the local Aarkid Biotech catalogue only. It does not diagnose conditions, recommend dosage, or replace advice from a qualified doctor or healthcare professional.
