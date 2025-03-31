import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, ShaderMaterial } from 'three';
const vertex = `
varying vec3 vPosition;
void main() {
	vPosition = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Creates an undulating gradient using basic low resolution noise between three
 * colors: #ccffff, #ffe5ec, #fcfccf, using 3D coordinates for consistency across the object.
 */
const fragment = `
precision mediump float;
uniform float time;
uniform vec3 resolution;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform float speed;
uniform float scale;
varying vec3 vPosition;

float random(vec4 p) {
	return fract(sin(dot(p, vec4(12.9898, 78.233, 45.164, 94.673))) * 43758.5453);
}

float noise(vec4 p) {
	vec4 i = floor(p);
	vec4 f = fract(p);
	float a = random(i);
	float b = random(i + vec4(1.0, 0.0, 0.0, 0.0));
	float c = random(i + vec4(0.0, 1.0, 0.0, 0.0));
	float d = random(i + vec4(1.0, 1.0, 0.0, 0.0));
	float e = random(i + vec4(0.0, 0.0, 1.0, 0.0));
	float f1 = random(i + vec4(1.0, 0.0, 1.0, 0.0));
	float g = random(i + vec4(0.0, 1.0, 1.0, 0.0));
	float h = random(i + vec4(1.0, 1.0, 1.0, 0.0));
	float i1 = random(i + vec4(0.0, 0.0, 0.0, 1.0));
	float j = random(i + vec4(1.0, 0.0, 0.0, 1.0));
	float k = random(i + vec4(0.0, 1.0, 0.0, 1.0));
	float l = random(i + vec4(1.0, 1.0, 0.0, 1.0));
	float m = random(i + vec4(0.0, 0.0, 1.0, 1.0));
	float n = random(i + vec4(1.0, 0.0, 1.0, 1.0));
	float o = random(i + vec4(0.0, 1.0, 1.0, 1.0));
	float p1 = random(i + vec4(1.0, 1.0, 1.0, 1.0));
	vec4 u = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(
			mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
			mix(mix(e, f1, u.x), mix(g, h, u.x), u.y),
			u.z
		),
		mix(
			mix(mix(i1, j, u.x), mix(k, l, u.x), u.y),
			mix(mix(m, n, u.x), mix(o, p1, u.x), u.y),
			u.z
		),
		u.w
	);
}

void main() {
	vec4 p = vec4(vPosition * scale, time * speed);

	float n = noise(p);
	n = smoothstep(0.3, 0.7, n); // Adjusted to make the gradient blend larger

	// Map noise value to three color stops
	vec3 color;
	if (n < 0.5) {
		color = mix(color1, color2, smoothstep(0.0, 0.5, n));
	} else {
		color = mix(color2, color3, smoothstep(0.5, 1.0, n));
	}

	gl_FragColor = vec4(color, 0.5);
}
`;

export const VoluShaderMaterialBase = shaderMaterial(
	{
		time: 0,
		color1: new Color('#ccffff'),
		color3: new Color('#ffe5ec'),
		color2: new Color('#fcfccf'),
		speed: 0.1,
		scale: 0.5,
		resolution: [1, 1],
	},
	vertex,
	fragment,
	(mat) => {
		if (!mat) return;
		mat.transparent = true;
		mat.needsUpdate = true;
	}
);

extend({ VoluShaderMaterial: VoluShaderMaterialBase });

declare global {
	namespace JSX {
		interface IntrinsicElements {
			voluShaderMaterial: any;
		}
	}
}

export function VoluShaderMaterial() {
	const ref = useRef<ShaderMaterial | null>(null);
	useFrame(({ clock }) => {
		if (ref.current) {
			ref.current.uniforms.time.value = clock.getElapsedTime();
			ref.current.needsUpdate = true;
		}
	});
	return <voluShaderMaterial key={VoluShaderMaterialBase.key} ref={ref} />;
}
