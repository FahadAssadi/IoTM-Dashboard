# Welcome to your Smart Health Track Companion app 👋

This project is a hybrid mobile application built with **Expo** and **React Native**, embedding a hosted **Next.js web app** inside a native Android WebView.  
It integrates with **Android Health Connect** via custom Kotlin modules to read, sync, and upload user health metrics to a backend (.NET API).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Running and Debugging on Android Devices

Option A:
1. Enable Developer Options
2. Enable USB Debugging
3. Connect your device via a USB cable
4. Verify connections via
``` bash
adb devices
```
5. Run the app for debugging with
``` bash
npx expo run:android
```

This command will build the android native project and install the development APK on your device.

Option B:
1. Install Android Studio and created a virtual device.
2. Start your emulator from Android Studio.
3. Run the app with
```bash
npx expo run:android
```

## Building and Installing the App Manually

1. Build Release APK (for deployment)
From project root:
``` bash
cd android
./gradlew assembleRelease
```
This compiles the app into: android/app/build/outputs/apk/release/app-release.apk

2. Install it manually via ADB:
``` bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
