# 🚀 Deployment Guide

This guide covers the deployment process for both the Web application and the Android mobile application.

## 🌐 Web Deployment

The application is built with Vite and can be deployed to any static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

### Build for Production

To create a production build:

```bash
pnpm run build
```

This will generate a `dist/` directory containing the compiled assets.

### Vercel (Recommended)

1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project root.
3.  Follow the prompts. Vercel detects Vite automatically.
4.  **Environment Variables**: Ensure you add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel dashboard settings.

### Netlify

1.  Drag and drop the `dist/` folder to Netlify Drop, or connect your GitHub repository.
2.  **Build Command**: `pnpm run build`
3.  **Publish Directory**: `dist`
4.  **Environment Variables**: Add them in Site Settings > Build & Deploy > Environment.

---

## 📱 Android Deployment (Capacitor)

We use Capacitor to bundle the web app into a native Android application.

### Prerequisites

- **Android Studio** installed.
- **Java JDK** (version 17 recommended).
- **Android SDK** installed via Android Studio.

### 1. Sync Web Assets

Before building the Android app, you must build the web app and sync the assets to the native project:

```bash
pnpm run sync:android
```

This command runs `pnpm run build` and then `npx cap sync android`.

### 2. Open in Android Studio

```bash
npx cap open android
```

### 3. Run on Emulator/Device

- In Android Studio, select your device or emulator.
- Click the **Run** (Play) button.

### 4. Build Signed APK/Bundle for Play Store

1.  In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2.  Select **Android App Bundle** (recommended for Play Store) or **APK**.
3.  Create a new KeyStore (keep this file safe!) or choose an existing one.
4.  Fill in the key details (password, alias).
5.  Select **Release** build variant.
6.  Click **Finish**.
7.  Locate the generated file in `android/app/release/`.

---

## 🔄 Continuous Integration (CI)

For automated builds, ensure your CI pipeline (GitHub Actions, etc.) has the necessary secrets set up:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
