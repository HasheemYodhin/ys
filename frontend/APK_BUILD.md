# building the Android APK

This guide explains how to build an Android APK for the `frontend` project using Capacitor and Vite.

## Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (and npm)
2.  **Java Development Kit (JDK)**: Java 17 or later is recommended.
    *   Verify with: `java -version`
3.  **Android Studio**: The official IDE for Android development.
    *   During installation, ensure the **Android SDK** and **Android Virtual Device** components are selected.
    *   Open Android Studio -> SDK Manager -> SDK Tools tab -> Check **Android SDK Command-line Tools**.

## Step-by-Step Build Instructions

### 1. Build the Web Application

First, you need to compile your React application into static assets (HTML, CSS, JS) that Capacitor will use.

Run the following command in the `frontend` directory:

```bash
npm run build
```

This will create a `dist` folder containing your compiled web app.

### 2. Sync with Capacitor

Next, copy the built web assets to the native Android project and update any native plugins/dependencies.

Run:

```bash
npx cap sync
```

### 3. Build the APK

You can build the APK using either Android Studio (recommended for first-time setup) or the command line.

#### Option A: Using Android Studio (Recommended)

1.  Open the Android project in Android Studio:
    ```bash
    npx cap open android
    ```
2.  Wait for Gradle to sync the project (this might take a while the first time).
3.  Go to the top menu and select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4.  Once the build is complete, a notification will appear. Click **locate** to find your `.apk` file (usually in `android/app/build/outputs/apk/debug/`).

#### Option B: Using Command Line (Faster)

If you have your environment set up correctly, you can build directly from the terminal without opening Android Studio.

Navigate to the `android` directory and run the Gradle wrapper:

**Windows (PowerShell):**
```powershell
cd android
./gradlew assembleDebug
```

> **Note:** If you get a "JAVA_HOME is not set" error and have Android Studio installed, you can use the bundled Java by running this command instead:
> ```powershell
> $env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; ./gradlew assembleDebug
> ```

**Mac/Linux:**
```bash
cd android
./gradlew assembleDebug
```

The APK will be located at:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## Troubleshooting

*   **"SDK location not found"**: Create a `local.properties` file in the `android` directory and add your SDK path:
    *   Windows: `sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk`
    *   Mac: `sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk`
*   **Gradle Errors**: Try running `./gradlew clean` inside the `android` folder to clear the build cache, then try building again.
