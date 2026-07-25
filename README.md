# Vortex Account Switcher

A Chrome extension that lets you switch between multiple [playvortex.io](https://playvortex.io) accounts instantly — no more logging out and back in.

![License](https://img.shields.io/badge/license-MIT-purple)
![Manifest](https://img.shields.io/badge/manifest-v3-blue)

---

## Installation

### Step 1 — Download the extension

Click the green **Code** button on this page → **Download ZIP** → Extract the ZIP file somewhere on your computer.

### Step 2 — Open Chrome Extensions

Open Google Chrome and go to this address in the URL bar:

```
chrome://extensions
```

### Step 3 — Enable Developer Mode

In the top-right corner of the Extensions page, toggle **Developer mode** ON.

### Step 4 — Load the extension

Click the **Load unpacked** button that appears on the top-left.

Select the folder you extracted in Step 1 (the folder that contains `manifest.json`).

### Step 5 — Done!

The extension is now installed. Go to [playvortex.io/home](https://playvortex.io/home) and you'll see a **⟳ switch icon** in the navbar.

---

## How to Use

1. Go to [playvortex.io/home](https://playvortex.io/home) while logged in
2. Click the **⟳ icon** in the top navbar
3. Your current account is saved automatically
4. Click **+ Add Account** → log into your second account
5. Come back and click **⟳** again → click **Switch** next to any saved account

---

## Features

- 🔄 Switch between saved accounts with one click
- 💾 Saves cookies, localStorage & sessionStorage per account
- ➕ Add new accounts without losing existing sessions
- 🎨 UI that matches the playvortex.io design

---

## Privacy

All account data (tokens, cookies) is stored **locally** in your browser using `chrome.storage.local`.  
Nothing is sent to any external server. The source code is fully open for anyone to verify.

---

## Disclaimer

This is an unofficial third-party tool. It is not affiliated with or endorsed by playvortex.io.

---

## License

MIT
