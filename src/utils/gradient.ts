export function cssAngleToLinearGradientPoints(angleDeg: number) {
	const radians = ((angleDeg - 90) * Math.PI) / 180;
	return {
		start: {
			x: 0.5 - Math.cos(radians) * 0.5,
			y: 0.5 - Math.sin(radians) * 0.5,
		},
		end: {
			x: 0.5 + Math.cos(radians) * 0.5,
			y: 0.5 + Math.sin(radians) * 0.5,
		},
	};
}
