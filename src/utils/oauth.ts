import { Linking } from 'react-native'
import type { WebView } from 'react-native-webview'

import { APP_SCHEME, SITE_URL } from '../config'
import { resolveSiteUrl } from './webNavigation'

const OAUTH_LOGIN_PATH = /\/auth\/(google|yandex)\/login\/?$/i

export function isOAuthProviderUrl(url: string): boolean {
	if (!url) return false
	try {
		const parsed = new URL(url)
		if (/^(accounts\.google\.com|oauth\.yandex\.(ru|com))$/i.test(parsed.hostname)) return true
		return OAUTH_LOGIN_PATH.test(parsed.pathname)
	} catch {
		return false
	}
}

export function oauthUrlWithMobileFlag(url: string): string {
	const target = new URL(resolveSiteUrl(url))
	target.searchParams.set('mobile', 'true')
	return target.toString()
}

export async function openOAuthInSystemBrowser(url: string): Promise<void> {
	await Linking.openURL(oauthUrlWithMobileFlag(url))
}

export function isAuthCallbackDeepLink(url: string): boolean {
	return url.startsWith(`${APP_SCHEME}://auth/callback`)
}

export function buildAuthCallbackPageUrl(callbackUrl: string): string | null {
	const query = callbackUrl.split('?')[1]
	if (!query) return null
	const params = new URLSearchParams(query)
	const accessToken = params.get('access_token')
	if (!accessToken) return null
	const refreshToken = params.get('refresh_token')
	const page = new URL('/auth/callback', SITE_URL.replace(/\/$/, ''))
	page.searchParams.set('access_token', accessToken)
	if (refreshToken) page.searchParams.set('refresh_token', refreshToken)
	return page.toString()
}

export function completeOAuthInWebView(webView: WebView | null, callbackUrl: string): boolean {
	const pageUrl = buildAuthCallbackPageUrl(callbackUrl)
	if (!pageUrl || !webView) return false
	webView.injectJavaScript(`window.location.replace(${JSON.stringify(pageUrl)}); true;`)
	return true
}
