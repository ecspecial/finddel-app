import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

const keystorePath = path.join(projectRoot, 'keystore/finddel-upload.jks')
if (!fs.existsSync(keystorePath)) {
	console.log(
		'No upload keystore found at keystore/finddel-upload.jks — skipping release signing setup (release build will be signed with the debug key).',
	)
	process.exit(0)
}

const envPath = path.join(projectRoot, '.env')
const env = {}
if (fs.existsSync(envPath)) {
	for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
		const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
		if (match) env[match[1]] = match[2].trim()
	}
}

const alias = env.ANDROID_UPLOAD_KEYSTORE_ALIAS
const password = env.ANDROID_UPLOAD_KEYSTORE_PASSWORD
if (!alias || !password) {
	throw new Error(
		'keystore/finddel-upload.jks exists but ANDROID_UPLOAD_KEYSTORE_ALIAS / ANDROID_UPLOAD_KEYSTORE_PASSWORD are missing from .env',
	)
}

const gradlePropsPath = path.join(projectRoot, 'android/gradle.properties')
let gradleProps = fs.readFileSync(gradlePropsPath, 'utf8')
gradleProps = gradleProps.replace(/\nFINDDELAPP_UPLOAD_.*$/gms, '')
gradleProps += `
FINDDELAPP_UPLOAD_STORE_FILE=${keystorePath}
FINDDELAPP_UPLOAD_KEY_ALIAS=${alias}
FINDDELAPP_UPLOAD_STORE_PASSWORD=${password}
FINDDELAPP_UPLOAD_KEY_PASSWORD=${password}
`
fs.writeFileSync(gradlePropsPath, gradleProps)

const buildGradlePath = path.join(projectRoot, 'android/app/build.gradle')
let buildGradle = fs.readFileSync(buildGradlePath, 'utf8')

const debugSigningConfig = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`
const signingConfigsWithRelease = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file(FINDDELAPP_UPLOAD_STORE_FILE)
            storePassword FINDDELAPP_UPLOAD_STORE_PASSWORD
            keyAlias FINDDELAPP_UPLOAD_KEY_ALIAS
            keyPassword FINDDELAPP_UPLOAD_KEY_PASSWORD
        }
    }`
if (buildGradle.includes(debugSigningConfig)) {
	buildGradle = buildGradle.replace(debugSigningConfig, signingConfigsWithRelease)
}

const releaseUsesDebugSigning = `// Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`
const releaseUsesReleaseSigning = `// Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.release`
buildGradle = buildGradle.replace(releaseUsesDebugSigning, releaseUsesReleaseSigning)

fs.writeFileSync(buildGradlePath, buildGradle)

console.log(`Patched Android release signing: alias="${alias}", keystore=${keystorePath}`)
