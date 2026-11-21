# FastPlay Pro

A basketball playbook studio that runs in the browser: draw plays, animate them, and export PDFs, images, video and GIFs.

**Live app:** https://mp42871.github.io/Fast-Play-Pro/

- **Works offline.** After the first visit the app is cached on the device (`sw.js`) and opens with no internet. It can be installed to a phone's home screen or as a desktop app.
- **Saves on the device.** Playbooks are stored in the browser's IndexedDB, with no 5 MB cap. The app asks the browser not to clear them.
- **Syncs through Google Drive** (optional). Every playbook stays in sync across a coach's devices through one file in their own Drive.
  On a new computer or browser, the "Your Playbook is Empty" screen offers **Load My Plays from Google Drive**: one sign-in brings everything back.
- **Zoom.** Pinch the court, use Ctrl + scroll, or the − / + buttons. While zoomed in, move around with two fingers, scroll / Shift + scroll, or Space + drag.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole app |
| `sw.js` | Offline cache (service worker) |
| `manifest.webmanifest`, `icons/` | App name and icons for installing |
| `vendor/` | Offline copies of Tailwind CSS, Phosphor Icons and jsPDF |
| `tools/build-vendor.sh` | Rebuilds `vendor/tailwind.js` |

## Publishing an update

1. Change `index.html`.
2. If you used Tailwind classes that aren't already in the page, run `tools/build-vendor.sh` (needs Node.js).
3. In `sw.js`, change `VERSION` (for example, bump the last number). Open copies of the app then show an **Update** button.
4. Push to `main`. GitHub Pages publishes it within a minute or two.

## Turning on Google Drive sync (one-time setup)

Drive sync needs a Google **OAuth Client ID** that tells Google the app at `https://mp42871.github.io` may ask coaches for access to *its own file* in their Drive. It's free and takes about 10 minutes. The Client ID is not a secret; it's meant to sit in the page.

1. Go to <https://console.cloud.google.com/> and create a project (for example, "FastPlay Pro").
2. **Enable the Drive API:** APIs & Services → Library → search for **Google Drive API** → **Enable**.
3. **Set up the consent screen:** open **Google Auth Platform** (APIs & Services → OAuth consent screen) → **Get started**.
   - App name: `FastPlay Pro`. User support email: yours.
   - Audience: **External**.
   - Contact email: yours. Agree to the policy, then **Create**.
4. **Allow only the app's own file:** go to **Data Access** → **Add or remove scopes**, tick `.../auth/drive.file` ("See, edit, create, and delete only the specific Google Drive files you use with this app") → **Update** → **Save**.
   This is a non-sensitive scope, so Google doesn't need to review the app.
5. **Let anyone sign in:** go to **Audience** → **Publish app** → confirm.
   If you leave it in *Testing*, only the Google accounts you list as test users can connect.
6. **Create the Client ID:** go to **Clients** → **Create client**.
   - Application type: **Web application**. Name: `FastPlay Pro web`.
   - Authorized JavaScript origins: `https://mp42871.github.io`
   - **Create**, then copy the **Client ID** (it ends in `.apps.googleusercontent.com`).
7. Paste it into `index.html` at `clientId: ''` (search for `const FP_DRIVE`), bump `VERSION` in `sw.js`, and push.

To try a Client ID without editing the code, open the app, open the browser console, and run:
`localStorage.setItem('fastplay_google_client_id', '<your id>')`, then reload.

### How sync behaves

- The app saves to one file, `FastPlay Pro Sync.json`, in each coach's own Drive. The `drive.file` permission means the app can't see anything else in their Drive.
- Each play is compared with the last synced version:
  - A play changed on one device takes that device's version.
  - A play changed on two devices keeps both. The second copy is marked "(other device)".
  - A play deleted on one device and untouched on the other is deleted everywhere.
- Google sign-ins from a web page last about an hour. After that, the status at the top shows **Tap to sync**, and one tap signs back in. Work keeps saving on the device meanwhile.
