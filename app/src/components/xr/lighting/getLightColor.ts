export function getLightColor(kelvin: number): string {
	return colorObjectToHextString(getLightColorObject(kelvin));
}

export function getLightColorObject(kelvin: number): { r: number; g: number; b: number } {
	// Invert the scale: 10 is warmest (lowest kelvin), 0 is coldest (highest kelvin)
	const invertedKelvin = 11.5 - kelvin;
	const clampedKelvin = Math.max(1.5, Math.min(10, invertedKelvin));
	const temperature = clampedKelvin * 10;

	// Calculate red
	let red: number;
	if (temperature <= 66) {
		red = 255;
	} else {
		red = temperature - 60;
		red = 329.698727446 * Math.pow(red, -0.1332047592);
		red = Math.max(0, Math.min(255, red));
	}

	// Calculate green
	let green: number;
	if (temperature <= 66) {
		green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
	} else {
		green = temperature - 60;
		green = 288.1221695283 * Math.pow(green, -0.0755148492);
	}
	green = Math.max(0, Math.min(255, green));

	// Calculate blue
	let blue: number;
	if (temperature >= 66) {
		blue = 255;
	} else {
		if (temperature <= 19) {
			blue = 0;
		} else {
			blue = temperature - 10;
			blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
			blue = Math.max(0, Math.min(255, blue));
		}
	}

	return { r: red, g: green, b: blue };
}

export function colorObjectToHextString(color: { r: number; g: number; b: number }): string {
	return `#${((1 << 24) + (Math.round(color.r) << 16) + (Math.round(color.g) << 8) + Math.round(color.b)).toString(16).slice(1).toUpperCase()}`;
}
