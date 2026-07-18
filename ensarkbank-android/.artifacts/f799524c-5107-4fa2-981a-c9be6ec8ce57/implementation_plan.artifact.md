# Update Android SDK version to 36

The build is failing because some dependencies require Android SDK 36 (Vanilla Ice Cream) to compile. The current project is configured with SDK 35.

## Proposed Changes

### [app](file:///F:/Wallpaper/ensarkbank/ensarkbank-android/app/build.gradle)

#### [MODIFY] [build.gradle](file:///F:/Wallpaper/ensarkbank/ensarkbank-android/app/build.gradle)
- Update `compileSdk` from 35 to 36.
- Update `targetSdk` from 35 to 36.

## Verification Plan

### Automated Tests
- Run `./gradlew :app:assembleDebug` to verify the build succeeds.
- Run `gradle_sync` to ensure the IDE is up to date.
