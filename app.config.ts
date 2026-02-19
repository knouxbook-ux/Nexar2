import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Nexar Pro",
  slug: "knoux-nexar-pro",
  version: "3.0.0",
  orientation: "portrait",
  icon: "./assets/images/nexar-pro-logo.png",
  scheme: "nexarpro",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/nexar-pro-logo.png",
    resizeMode: "contain",
    backgroundColor: "#0a0a0f",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.knoux.nexarpro",
    buildNumber: "3.0.0",
    infoPlist: {
      NSCameraUsageDescription: "Nexar Pro needs camera access for recording",
      NSMicrophoneUsageDescription: "Nexar Pro needs microphone access for audio",
      NSPhotoLibraryUsageDescription: "Nexar Pro needs photo library access",
      NSPhotoLibraryAddUsageDescription: "Nexar Pro saves recorded videos",
      NSFaceIDUsageDescription: "Nexar Pro uses Face ID for secure access",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/nexar-pro-logo.png",
      backgroundColor: "#0a0a0f",
    },
    package: "com.knoux.nexarpro",
    versionCode: 300,
    permissions: [
      "CAMERA",
      "RECORD_AUDIO",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "FOREGROUND_SERVICE",
      "RECEIVE_BOOT_COMPLETED",
      "USE_BIOMETRIC",
      "USE_FINGERPRINT",
    ],
    googleServicesFile: "./google-services.json",
  },
  web: {
    bundler: "metro",
    output: "server",
    favicon: "./assets/images/nexar-pro-logo.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
    [
      "expo-camera",
      {
        cameraPermission: "Allow Nexar Pro to access your camera",
        microphonePermission: "Allow Nexar Pro to access your microphone",
        recordAudioAndroid: true,
      },
    ],
    [
      "expo-media-library",
      {
        photosPermission: "Allow Nexar Pro to access your photos",
        savePhotosPermission: "Allow Nexar Pro to save photos",
        isAccessMediaLocationEnabled: true,
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/nexar-pro-logo.png",
        color: "#A78BFA",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: 26,
          targetSdkVersion: 34,
          compileSdkVersion: 34,
          enableProguardInReleaseBuilds: false,
          enableShrinkResourcesInReleaseBuilds: false,
        },
        ios: {
          deploymentTarget: "15.1",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "knoux-nexar-pro-ultimate",
    },
  },
});
