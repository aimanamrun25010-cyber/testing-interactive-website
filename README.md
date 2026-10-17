# 💗 Untuk Cinta Hati Saya — Interactive Website

A complete five-scene love story, built with plain HTML, CSS and JavaScript. It works on phones, laptops, and free static hosting such as **GitHub Pages**.

## 1. Open the website

Keep `index.html`, `style.css`, and `script.js` in the **same folder**. Double-click `index.html` to preview it. Alternatively, open the folder in VS Code and use Live Server. It works without installing Node.js or any dependencies.

## 2. Add YOUR own photos

Put your real photos in the `assets/` folder with these **exact file names**:

| File | Where it shows | Suggested photo |
| --- | --- | --- |
| `assets/portrait.jpg` | Scene 2, on the left | A portrait of yourself |
| `assets/standing.jpg` | Scene 5 | You standing normally |
| `assets/kiss.jpg` | Scene 5 | Same position, pretending to blow a kiss |

**Important:** Your photos were not supplied, so the current website shows clearly labelled placeholders. Photos can be JPGs renamed to these exact names; for PNG/WebP, edit the `src` in `index.html` to match the actual filenames. For an animated kiss, you can use a `.gif` and change `assets/kiss.jpg` to `assets/kiss.gif` in the HTML. Two photos at similar angles make the 10-second alternating animation look especially good.

## 3. Choose your dinner places

At the top of `script.js`, replace these four placeholder values with real restaurant/cafe names:

```js
restaurantNames: {
  western: 'Nama kedai western',
  'masakan panas': 'Nama kedai masakan panas',
  cafe: 'Nama cafe',
  burger: 'Nama kedai burger'
}
```

Each selection displays a matching restaurant card. No location or restaurant name was assumed for you.

## 4. Save answers to Google Sheets → Excel (IMPORTANT)

The three frontend files **cannot automatically change an `.xlsx` file stored on your laptop** when someone visits a published static website. To collect answers centrally, this project includes `Code.gs`: a tiny Google Apps Script backend. It records one row when the visitor chooses the last "I love you more si kacak" button. Then you can download the entire response spreadsheet as a real Excel `.xlsx` file.

### One-time setup

1. Open **https://sheets.google.com** and create a new spreadsheet. Name it, for example, `Date Night Responses`.
2. From that spreadsheet, choose **Extensions → Apps Script**.
3. Delete the default content in `Code.gs`, then copy-paste **all the code from the included `Code.gs` file**. Save the project.
4. Click **Deploy → New deployment**. Choose the type **Web app** (gear icon). Set **Execute as: Me** and **Who has access: Anyone**. Click **Deploy**, approve Google permissions when asked, then copy the **Web app URL**. Use the link that **ends in `/exec`**, not `/dev`.
5. At the top of `script.js`, replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with that exact HTTPS link:

   ```js
   sheetsWebAppUrl: 'https://script.google.com/macros/s/XXXXX/exec',
   ```

6. Save, open the website, and **complete all five scenes** once as a test. The spreadsheet should create a tab called `Responses` with a header row and your test response.
7. When you want the real Excel file, in Google Sheets select **File → Download → Microsoft Excel (.xlsx)**.

### What is recorded?

- When the response was saved
- Anonymous browser-session ID to prevent duplicate rows
- Time that the story began and answer was submitted
- Time zone
- Dinner accepted (`Ya`)
- Food preference (western / masakan panas / cafe / burger)
- Clothing selection and colour (including custom colour from “Other”)
- Last love reply

**No names, email addresses, or precise location are requested.** If you want, add a short note in Scene 1 or Scene 2 informing the visitor that their choices will be saved. Do not share or publish the responses spreadsheet itself.

**Important caveat:** The browser sends answers in a `no-cors` request. This lets static GitHub Pages submit to Google Apps Script, but the browser cannot confirm whether the sheet accepted a row. **Test your own complete run and check your spreadsheet before sending the website link.** You need internet for the upload. The backend is publicly callable, so its endpoint can be spammed if widely shared.

If you edit `Code.gs` AFTER deploying, make a **new deployment version** under **Deploy → Manage deployments → Edit → Version → New version → Deploy**. Otherwise the existing `/exec` URL may still use your previous code.

### Excel example file

The included `responses_template.xlsx` is a **layout example**, not an automatically updated database. The live source is your Google Sheet after you complete the deployment steps above. Its exported `.xlsx` will contain the actual answers.

## 5. Publish for free on GitHub Pages

1. Make a GitHub repository (e.g., `cinta-hati-saya`), then upload `index.html`, `style.css`, `script.js` and the complete `assets` folder (with your actual images).
2. Go to **Settings → Pages**. Choose **Deploy from a branch**, `main`, and `/ (root)`. Save.
3. After deployment, the live URL normally looks like `https://YOUR-USERNAME.github.io/cinta-hati-saya/`.
4. **Do not upload `Code.gs`, `responses_template.xlsx`, or this README unless you want them public.** The Apps Script code stays in Google Apps Script, not on GitHub.

The live website is phone-friendly. You do not need to buy a domain.

## Website storyline

- **Scene 1:** Plain white page with heartbeat love. Tap to begin.
- **Scene 2:** Night sky, your portrait, greeting, “sihat?”, dinner invitation; “Tak nak” escapes.
- **Scene 3:** Special date-night story, a four-way food choice, matching restaurant card, “Jom”.
- **Scene 4:** Matching clothes, four colour choices including custom “Other”, sweet replies; “Tak nak” escapes.
- **Scene 5:** Standing / pretend-kissing frames switch back and forth for **10 seconds**, throwing cute hearts, then fade smoothly to complete black.

## Quick customizations

Open `script.js` and change `CONFIG.messageDelayMs` (typing speed), `CONFIG.finalPlayDurationMs` (currently 10000 ms), or `CONFIG.photoFlipMs` (currently 750 ms). Edit message strings in `beginScene2`, `beginScene3`, `beginScene4`, and `completeColorSelection`. Edit colours/layout/animation in `style.css`.

**Privacy:** Save only responses you actually need. Do not include secret API keys/passwords in `script.js` because browser JavaScript is public. Google Sheets contents should remain accessible only to your Google account.
