import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { LOADING_GRADIENT } from '../config'
import { cssAngleToLinearGradientPoints } from '../utils/gradient'
import { FinddelLogo } from './FinddelLogo'

const gradientPoints = cssAngleToLinearGradientPoints(LOADING_GRADIENT.angleDeg)

export function LoadingScreen() {
	return (
		<LinearGradient
			colors={[...LOADING_GRADIENT.colors]}
			locations={[...LOADING_GRADIENT.locations]}
			start={gradientPoints.start}
			end={gradientPoints.end}
			style={styles.container}
		>
			<View style={styles.center}>
				<FinddelLogo />
			</View>
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFill,
	},
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
})
