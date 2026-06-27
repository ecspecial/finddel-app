import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { LOADING_GRADIENT } from './src/config';
import { WebShell } from './src/components/WebShell';

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			void SplashScreen.hideAsync().catch(() => {});
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<SafeAreaProvider>
			<View style={styles.root}>
				<WebShell />
				<StatusBar style="light" />
			</View>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: LOADING_GRADIENT.colors[0],
	},
});
