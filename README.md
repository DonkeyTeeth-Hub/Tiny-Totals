# NICU Nutrition / Fluid Calculator

Offline-capable NICU nutrition and fluid calculator for GitHub Pages.

## Included files
- index.html
- app.js
- style.css
- sw.js
- manifest.json
- icons/icon-192.png
- icons/icon-512.png

## Deploy to a new GitHub Pages site
1. Create a new public GitHub repository.
2. Upload all files and folders from this project.
3. In GitHub, go to Settings > Pages.
4. Under Build and deployment, choose Deploy from a branch.
5. Select the main branch and /(root).
6. Save and wait for the site to publish.
7. Open the live site once in a browser before installing it as a PWA.

## Notes
- Auto-calculates on input.
- Reset clears all fields.
- Enteral entry is mutually exclusive:
  - mL/Feed + Feeds/Day
  - or Total Enteral Volume
- Total PO % is calculated from Total PO Volume divided by total enteral volume.

Educational use only. Verify all outputs independently before clinical use.
