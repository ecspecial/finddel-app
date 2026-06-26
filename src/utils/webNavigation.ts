import { Alert, Linking, Platform } from 'react-native';

import { APP_SCHEME, SITE_URL } from '../config';

const EXTERNAL_SCHEMES = ['tel:', 'mailto:', 'sms:', 'geo:', 'yandexmaps:', 'yandexnavi:', 'tg:'];

const EXTERNAL_HOST_PATTERNS = [/^(www\.)?t\.me$/i, /^(www\.)?telegram\.me$/i];

const DOWNLOAD_EXTENSIONS = /\.(pdf|docx?)(\?|#|$)/i;

/** t.me/… → tg://resolve?domain=… — сразу в приложение Telegram, без web-прослойки. */
function telegramDeepLinkFromUrl(url: string): string | null {
	try {
		const parsed = new URL(url);
		if (!EXTERNAL_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) return null;
		const slug = parsed.pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
		if (!slug) return null;
		return `tg://resolve?domain=${encodeURIComponent(slug)}`;
	} catch {
		return null;
	}
}

function telNumberFromUrl(url: string): string {
	const raw = url.replace(/^tel:/i, '').split('?')[0]?.trim() ?? '';
	if (!raw) return '';
	try {
		return decodeURIComponent(raw);
	} catch {
		return raw;
	}
}

/** Android: подтверждение перед переходом в «Телефон» (на iOS диалог даёт система). */
function confirmAndroidPhoneCall(url: string): Promise<boolean> {
	return new Promise((resolve) => {
		const number = telNumberFromUrl(url);
		Alert.alert(
			'Позвонить?',
			number || 'Открыть приложение «Телефон»?',
			[
				{ text: 'Отмена', style: 'cancel', onPress: () => resolve(false) },
				{ text: 'Позвонить', onPress: () => resolve(true) },
			],
			{ cancelable: true, onDismiss: () => resolve(false) },
		);
	});
}

export function resolveSiteUrl(url: string): string {
	if (url.startsWith('http://') || url.startsWith('https://')) return url;
	if (url.startsWith('/')) return `${SITE_URL.replace(/\/$/, '')}${url}`;
	return url;
}

export function shouldOpenExternally(url: string): boolean {
	if (!url || url === 'about:blank') return false;
	if (url.startsWith('chrome-error://')) return false;
	if (url.startsWith(`${APP_SCHEME}://`)) return true;
	if (EXTERNAL_SCHEMES.some((scheme) => url.startsWith(scheme))) return true;
	if (DOWNLOAD_EXTENSIONS.test(url)) return true;

	try {
		const parsed = new URL(url);
		if (EXTERNAL_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) return true;
	} catch {
		return false;
	}

	return false;
}

export async function openExternalUrl(url: string): Promise<void> {
	const target = resolveSiteUrl(url);
	if (Platform.OS === 'android' && /^tel:/i.test(target)) {
		const confirmed = await confirmAndroidPhoneCall(target);
		if (!confirmed) return;
	}

	const tgDeepLink = telegramDeepLinkFromUrl(target);
	if (tgDeepLink) {
		try {
			await Linking.openURL(tgDeepLink);
			return;
		} catch {
			// Telegram не установлен — откроем https://t.me/…
		}
	}

	await Linking.openURL(target);
}
