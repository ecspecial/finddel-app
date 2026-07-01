import Constants from 'expo-constants'

const extra = Constants.expoConfig?.extra as { siteUrl?: string } | undefined

export const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? extra?.siteUrl ?? 'https://finddel.ru'

export const APP_SCHEME = 'appfinddel'

export const LOADING_GRADIENT = {
	angleDeg: 199.55,
	colors: ['#49AE49', '#1E4845'] as const,
	locations: [0.2528, 1] as const,
}

export const LOGO_SIZE = {
	width: 271,
	height: 59,
}
