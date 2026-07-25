# Vortex Account Switcher

A Chrome extension that lets you switch between multiple [playvortex.io](https://playvortex.io) accounts instantly — no more logging out and back in.

![License](https://img.shields.io/badge/license-MIT-purple)
![Manifest](https://img.shields.io/badge/manifest-v3-blue)

## Features

- 🔄 Switch between saved accounts with one click
- 💾 Saves cookies, localStorage & sessionStorage per account
- ➕ Add new accounts without losing existing sessions
- 🎨 UI that matches the playvortex.io design

## Installation

This extension is not on the Chrome Web Store yet. Load it manually:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the folder containing this extension's files

## Usage

1. Go to [playvortex.io/home](https://playvortex.io/home)
2. Click the **⟳ switch icon** in the navbar
3. Your current account is automatically saved
4. Click **+ Add Account** to log into another account
5. Switch between accounts anytime from the modal or the toolbar popup

## Privacy

All account data (tokens, cookies) is stored **locally** in your browser using `chrome.storage.local`.  
Nothing is sent to any external server.

## Disclaimer

This extension is an unofficial third-party tool and is not affiliated with or endorsed by playvortex.io.

## License

MIT
