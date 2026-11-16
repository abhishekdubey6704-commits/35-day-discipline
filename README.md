# 35 Day Discipline

**Discipline creates freedom.**

An offline-first personal discipline tracker built with React, TypeScript, Vite and Capacitor.

## Current committed foundation
- Premium dark UI with saffron/gold accents
- Dashboard and module navigation for all 12 planned areas
- Local activity records and search
- Custom-duration challenges with editable daily rules, pause/resume and daily check-offs
- JSON backup export
- Android build workflow using GitHub Actions

## Run locally
```bash
npm install
npm run dev
```

## Android build
The GitHub Actions workflow builds a debug APK and debug AAB on pushes to `main` or via manual workflow dispatch. These are **debug artifacts**, not Play Store-ready signed releases.

## Data and implementation status
The current release stores records in browser/WebView local storage. It is an initial working foundation, not yet the full specification. Encrypted SQLite, biometric/PIN locking, Health Connect, native local notifications, barcode database/scanning, photo vault, advanced analytics, CSV/PDF exports, backup import and signed release builds remain to be implemented and tested. No backend or cloud sync is configured.
