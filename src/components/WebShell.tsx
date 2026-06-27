import { useCallback, useEffect, useRef, useState } from 'react';
import {
	AppState,
	BackHandler,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LinkingExpo from 'expo-linking';

import { APP_SCHEME, SITE_URL } from '../config';
import {
	completeOAuthInWebView,
	isAuthCallbackDeepLink,
	isOAuthProviderUrl,
	openOAuthInSystemBrowser,
} from '../utils/oauth';
import { openExternalUrl, shouldOpenExternally } from '../utils/webNavigation';
import { LoadingScreen } from './LoadingScreen';

const APP_USER_AGENT_SUFFIX = ' FinddelApp/3.0';

function buildAppBootstrapJs(topInset: number, bottomInset: number): string {
	return `
window.__FINDDEL_APP__=true;
document.documentElement.classList.add('finddel-app');
document.documentElement.style.setProperty('--finddel-safe-top', '${topInset}px');
document.documentElement.style.setProperty('--finddel-safe-bottom', '${bottomInset}px');
true;
`;
}

export function WebShell() {
	const webViewRef = useRef<WebView>(null);
	const insets = useSafeAreaInsets();
	const splashDismissed = useRef(false);
	const [showSplash, setShowSplash] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [canGoBack, setCanGoBack] = useState(false);

	const handleAuthCallback = useCallback((url: string) => {
		completeOAuthInWebView(webViewRef.current, url);
	}, []);

	const handleNavigation = useCallback(
		(request: WebViewNavigation) => {
			const { url } = request;

			if (url.startsWith('chrome-error://')) {
				setError('Соединение прервано. Проверьте интернет и нажмите «Повторить».');
				return false;
			}

			if (isAuthCallbackDeepLink(url)) {
				handleAuthCallback(url);
				return false;
			}

			if (isOAuthProviderUrl(url)) {
				void openOAuthInSystemBrowser(url);
				return false;
			}

			if (url.startsWith(`${APP_SCHEME}://`)) {
				void LinkingExpo.openURL(url);
				return false;
			}

			if (shouldOpenExternally(url)) {
				void openExternalUrl(url);
				return false;
			}

			return true;
		},
		[handleAuthCallback],
	);

	const reload = useCallback(() => {
		setError(null);
		splashDismissed.current = false;
		setShowSplash(true);
		webViewRef.current?.reload();
	}, []);

	useEffect(() => {
		const onDeepLink = ({ url }: { url: string }) => {
			if (isAuthCallbackDeepLink(url)) {
				handleAuthCallback(url);
			}
		};

		const subscription = LinkingExpo.addEventListener('url', onDeepLink);
		void LinkingExpo.getInitialURL().then((url) => {
			if (url && isAuthCallbackDeepLink(url)) onDeepLink({ url });
		});

		return () => subscription.remove();
	}, [handleAuthCallback]);

	useEffect(() => {
		if (Platform.OS !== 'android') return;
		const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
			if (canGoBack && webViewRef.current) {
				webViewRef.current.goBack();
				return true;
			}
			return false;
		});
		return () => subscription.remove();
	}, [canGoBack]);

	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextState) => {
			if (nextState !== 'active') return;
			webViewRef.current?.injectJavaScript(`
				(function () {
					if (document.title === 'Webpage not available') {
						window.location.reload();
					}
				})();
				true;
			`);
		});
		return () => subscription.remove();
	}, []);

	useEffect(() => {
		webViewRef.current?.injectJavaScript(buildAppBootstrapJs(insets.top, insets.bottom));
	}, [insets.top, insets.bottom]);

	const renderWebError = useCallback(
		() => (
			<View style={styles.errorOverlay}>
				<Text style={styles.errorText}>
					{error ?? 'Не удалось загрузить страницу. Проверьте интернет.'}
				</Text>
				<TouchableOpacity style={styles.retryButton} onPress={reload}>
					<Text style={styles.retryText}>Повторить</Text>
				</TouchableOpacity>
			</View>
		),
		[error, reload],
	);

	return (
		<View style={[styles.root, { paddingBottom: insets.bottom }]}>
			<WebView
				ref={webViewRef}
				source={{ uri: SITE_URL }}
				style={styles.webview}
				injectedJavaScriptBeforeContentLoaded={buildAppBootstrapJs(insets.top, insets.bottom)}
				onLoadStart={() => {
					setError(null);
					if (!splashDismissed.current) {
						setShowSplash(true);
					}
				}}
				onLoadEnd={() => {
					splashDismissed.current = true;
					setShowSplash(false);
				}}
				onError={() => {
					setShowSplash(false);
					setError('Не удалось загрузить сайт. Проверьте интернет и попробуйте снова.');
				}}
				onHttpError={() => {
					setShowSplash(false);
					setError('Сайт временно недоступен. Попробуйте позже.');
				}}
				onRenderProcessGone={() => {
					reload();
					return true;
				}}
				onContentProcessDidTerminate={() => {
					reload();
				}}
				onFileDownload={({ nativeEvent }) => {
					void openExternalUrl(nativeEvent.downloadUrl);
				}}
				onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
				onShouldStartLoadWithRequest={handleNavigation}
				renderError={renderWebError}
				javaScriptEnabled
				domStorageEnabled
				sharedCookiesEnabled
				thirdPartyCookiesEnabled
				allowsBackForwardNavigationGestures
				setSupportMultipleWindows={false}
				originWhitelist={['https://*', 'http://*', `${APP_SCHEME}://*`, 'tel:*', 'mailto:*']}
				applicationNameForUserAgent={APP_USER_AGENT_SUFFIX.trim()}
				allowFileAccess
				allowFileAccessFromFileURLs={false}
				allowsInlineMediaPlayback
			/>

			{showSplash ? <LoadingScreen /> : null}

			{error ? (
				<View style={styles.errorOverlay} pointerEvents="box-none">
					<View style={styles.errorCard}>
						<Text style={styles.errorText}>{error}</Text>
						<TouchableOpacity style={styles.retryButton} onPress={reload}>
							<Text style={styles.retryText}>Повторить</Text>
						</TouchableOpacity>
					</View>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#49AE49',
	},
	webview: {
		flex: 1,
		backgroundColor: '#49AE49',
	},
	errorOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: '#ffffff',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	errorCard: {
		alignItems: 'center',
		gap: 16,
		maxWidth: 320,
	},
	errorText: {
		color: '#1E4845',
		fontSize: 16,
		textAlign: 'center',
		lineHeight: 22,
	},
	retryButton: {
		backgroundColor: '#49AE49',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
	},
});
