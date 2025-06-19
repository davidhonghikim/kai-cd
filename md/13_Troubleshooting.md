# 13_Troubleshooting.md
# kai-cd – Troubleshooting Guide

## Common issues & fixes
| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| Popup shows `undefined` for services | `browser.storage` not initialised | Reload extension; check background logs |
| Side-panel chat stuck on `Connecting…` | Connector `connect()` failed | Verify service URL & port, CORS headers |
| 401 errors from OpenAI | Bad API key | Update key in Service Manager |
| Build fails with `Manifest version mismatch` | Cached build in `dist/` | `rm -rf dist && npm run build` |

## Enabling verbose logging
Set `localStorage.debug = '*kai*'` in browser console to log all debug channels.

## Resetting extension
1. Delete from Chrome extensions page.
2. Remove `chrome.storage.local` via DevTools > Application > Storage.
3. Re-load unpacked `dist/`.

## Contact & Support
Open GitHub issue with:
* Browser + version
* OS
* Console logs
* Steps to reproduce

*Document last updated: <!--timestamp-->* 