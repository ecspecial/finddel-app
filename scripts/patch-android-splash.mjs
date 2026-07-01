import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resDir = path.join(__dirname, '../android/app/src/main/res')
const drawableDir = path.join(resDir, 'drawable')
const stylesPath = path.join(resDir, 'values/styles.xml')

const appConfigPath = path.join(__dirname, '../app.config.ts')
const displayNameMatch = fs.readFileSync(appConfigPath, 'utf8').match(/APP_DISPLAY_NAME\s*=\s*['"]([^'"]+)['"]/)
const appDisplayName = displayNameMatch?.[1] ?? 'ИщуДоставку'

const stringsPath = path.join(resDir, 'values/strings.xml')
if (fs.existsSync(stringsPath)) {
	let strings = fs.readFileSync(stringsPath, 'utf8')
	strings = strings.replace(
		/<string name="app_name">[^<]*<\/string>/,
		`<string name="app_name">${appDisplayName}</string>`,
	)
	fs.writeFileSync(stringsPath, strings)
}

const transparentSplashIcon = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@android:color/transparent" />
</layer-list>
`

fs.mkdirSync(drawableDir, { recursive: true })
fs.writeFileSync(path.join(drawableDir, 'splashscreen_logo.xml'), transparentSplashIcon)

if (fs.existsSync(stylesPath)) {
	let styles = fs.readFileSync(stylesPath, 'utf8')
	if (!styles.includes('android:windowBackground')) {
		styles = styles.replace(
			'<item name="android:navigationBarColor">@android:color/transparent</item>',
			`<item name="android:navigationBarColor">@android:color/transparent</item>
    <item name="android:windowBackground">@color/splashscreen_background</item>`,
		)
	}
	styles = styles.replace(
		'<item name="android:windowSplashScreenBehavior">icon_preferred</item>',
		'<item name="android:windowSplashScreenBehavior">icon_preferred</item>\n    <item name="android:windowSplashScreenIconBackgroundColor">@android:color/transparent</item>',
	)
	fs.writeFileSync(stylesPath, styles)
}

const gradlePropsPath = path.join(__dirname, '../android/gradle.properties')
if (fs.existsSync(gradlePropsPath)) {
	let gradle = fs.readFileSync(gradlePropsPath, 'utf8')
	if (!/reactNativeArchitectures=arm64-v8a/.test(gradle)) {
		gradle = gradle.replace(/reactNativeArchitectures=.*/, 'reactNativeArchitectures=arm64-v8a')
		fs.writeFileSync(gradlePropsPath, gradle)
	}
}

console.log(`Patched Android native: app_name="${appDisplayName}", transparent splash, arm64-v8a`)
