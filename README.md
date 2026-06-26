# Finddel mobile shell

WebView wrapper around the production Finddel site.

## Setup

```bash
cd finddel-app
npm install
cp .env.example .env
```

## Development

```bash
npm start
npm run android
```

## Builds

### Android APK (local test)

**Windows:** use a **short path** (e.g. `C:\finddel\finddel-app`). Deep paths like `Desktop\freelance\finddel\...` can fail with `Filename longer than 260 characters`.

```bash
npm run prebuild:android
npm run build:apk
```

APK path: `android/app/build/outputs/apk/release/app-release.apk`

### Android AAB (Google Play)

```bash
npm run build:aab
```

### iOS (requires Mac or EAS cloud)

```bash
eas build --platform ios --profile production
```

Preview APK via EAS:

```bash
eas build --platform android --profile preview
```

## Config

- Site URL: `EXPO_PUBLIC_SITE_URL` (default `https://finddel.ru`)
- Bundle IDs match the legacy app: `com.app.finddel` (iOS), `com.finddel.finddel` (Android)
- Deep link scheme: `appfinddel://` for OAuth redirects

## Loading screen

Green gradient `linear-gradient(199.55deg, #49AE49 25.28%, #1E4845 204.03%)` with centered logo (271×59).

Regenerate white logo asset after SVG changes:

```bash
node scripts/gen-loading-logo.mjs
```
