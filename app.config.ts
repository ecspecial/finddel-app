import type { ExpoConfig } from 'expo/config'

const VERSION = '3.0.0'
const BUILD_NUMBER = '2'

/** Solid green only — logo/gradient only in JS LoadingScreen. */
const SPLASH_BACKGROUND = '#49AE49'
const APP_DISPLAY_NAME = 'ИщуДоставку'

const config: ExpoConfig = {
	name: APP_DISPLAY_NAME,
	slug: 'Finddel',
	version: VERSION,
	scheme: 'appfinddel',
	orientation: 'portrait',
	icon: './assets/icon.png',
	userInterfaceStyle: 'light',
	splash: {
		backgroundColor: SPLASH_BACKGROUND,
	},
	plugins: [
		[
			'expo-splash-screen',
			{
				backgroundColor: SPLASH_BACKGROUND,
			},
		],
	],
	ios: {
		bundleIdentifier: 'com.app.finddel',
		buildNumber: BUILD_NUMBER,
		appleTeamId: '52R5Y6MTR2',
		supportsTablet: false,
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
			CFBundleDevelopmentRegion: 'ru_RU',
			CFBundleDisplayName: APP_DISPLAY_NAME,
			LSApplicationQueriesSchemes: ['tg', 'telegram'],
		},
	},
	android: {
		package: 'com.finddel.finddel',
		versionCode: Number(BUILD_NUMBER),
		predictiveBackGestureEnabled: false,
		adaptiveIcon: {
			foregroundImage: './assets/adaptive-icon.png',
			backgroundColor: SPLASH_BACKGROUND,
		},
	},
	extra: {
		siteUrl: process.env.EXPO_PUBLIC_SITE_URL ?? 'https://finddel.ru',
	},
}

export default config
