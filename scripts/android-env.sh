# Sourced by the android npm scripts (via `source scripts/android-env.sh`) so gradle/expo
# find a JDK and the Android SDK even when the shell profile doesn't export them.
# There is no system JDK on this machine — only the one bundled with Android Studio.
STUDIO_JBR="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
if [ -z "$JAVA_HOME" ] && [ -d "$STUDIO_JBR" ]; then
	export JAVA_HOME="$STUDIO_JBR"
fi
if [ -z "$ANDROID_HOME" ] && [ -d "$HOME/Library/Android/sdk" ]; then
	export ANDROID_HOME="$HOME/Library/Android/sdk"
fi
