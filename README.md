# Roman & Vane — Wedding

A password-protected wedding site with three full-page panels: **Intro** (marriage, date & place), **Our moments** (photo slideshow), and **RSVP** (invite code + guest names, saved to Google Sheets).

## Hosting on GitHub Pages

1. Create a new repository (e.g. `roman-vane-wedding`).
2. Upload this folder: `index.html`, `styles.css`, `main.js`, the `wedding_photos` folder (with your photos), and optionally this README.
3. **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main** → folder: **/ (root)** → Save.
4. Site URL: `https://YOUR_USERNAME.github.io/roman-vane-wedding/`

## Password

Guests use: **RomanAndVaneLove**

## RSVP → Google Sheet

RSVPs are appended to your Google Sheet (invite code + names). To connect the site to the sheet:

1. Open the sheet:  
   [Wedding sheet](https://docs.google.com/spreadsheets/d/1-TJeJ8hccvMClkLwL0KELyRtEE5j9Ht6df7hc5Bg_js/edit?gid=785370606#gid=785370606)
2. **Extensions → Apps Script**. Remove any sample code and paste in the contents of **Code.gs** from this repo.
3. Save (Ctrl+S). Click **Run** once and authorize the app when prompted.
4. **Deploy → New deployment** → type **Web app**:
   - **Execute as:** Me  
   - **Who has access:** Anyone  
5. Copy the **Web app URL** (e.g. `https://script.google.com/macros/s/.../exec`).
6. In **main.js**, set `RSVP_SCRIPT_URL` to that URL:
   ```js
   const RSVP_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
   ```
7. Redeploy your site (or push to GitHub if it auto-deploys).

The script appends one row per guest: **Column A** = guest name, **Column B** = 8-digit invite code, on the sheet with gid `785370606` (or the first sheet if that gid is not found).
