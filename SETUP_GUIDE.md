# Copyright © Knoux. All rights reserved.

# 🚀 Knoux Nexar Pro — Setup Guide

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and fill in required values (see comments inside)
```

**Minimum required to run:**
- `DATABASE_URL` — MySQL connection (free: PlanetScale or Railway)
- `JWT_SECRET` — any random 32+ char string

## 3. Initialize Database

```bash
pnpm db:push
# Runs: drizzle-kit generate + drizzle-kit migrate
```

## 4. Run in Development (Expo Go — limited features)

```bash
pnpm dev
# Opens Expo Go — screen recording will NOT work here (see below)
```

## 5. Build for Android (Full Features)

```bash
# Step 1: Generate native Android project
npx expo prebuild --platform android

# Step 2: Build with EAS (free tier available)
eas build --platform android --profile preview

# Step 3: Production APK
eas build --platform android --profile production
```

## Feature Availability by Build Type

| Feature | Expo Go | EAS Dev Build | EAS Production |
|---------|---------|---------------|----------------|
| Screen Recording | ❌ | ✅ | ✅ |
| Audio Recording | ✅ | ✅ | ✅ |
| Video Editing (FFmpeg) | ❌ | ✅ | ✅ |
| AI Features | ✅ (needs key) | ✅ | ✅ |
| Cloud Sync | ✅ (needs Firebase) | ✅ | ✅ |
| Streaming (RTMP) | ❌ | ✅ | ✅ |
| Multi-Camera | ✅ | ✅ | ✅ |
| Gestures | ✅ | ✅ | ✅ |
| Payments | ✅ (sandbox) | ✅ | ✅ |
| All UI Screens | ✅ | ✅ | ✅ |

## Free Services (No Key Needed)

- ✅ **Database**: PlanetScale free tier (5 GB)
- ✅ **Firebase**: Spark plan (5 GB storage)
- ✅ **Stripe**: Test keys from dashboard
- ✅ **PayPal**: Sandbox from developer portal
- ✅ **FFmpegKit**: Open source, Apache 2.0
- ✅ **Expo / React Native**: Free & open source

## Critical Notes

### Screen Recording
Requires `NexarScreenCapture` native Android module.
Set `NATIVE_MODULE_LINKED = true` in `app/(tabs)/screen-recording.tsx`
**after** running `npx expo prebuild` and rebuilding.

### AI Features
Without `OPENAI_API_KEY`, the AI features screen shows a clear
"Add your API key in Settings" message. No silent failure.

### Payments
Without Stripe/PayPal keys, the payment screen shows
"Configure payment provider" — no silent failure.

