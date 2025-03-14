import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { ShaderMaterial } from 'three';

const _occlusion_vertex = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`;

const _occlusion_fragment = `
precision highp float;

uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;
uniform float depthRadius;
uniform float softness;
float sampleDepth(vec2 uv, float layer) {
    return texture(depthColor, vec3(uv.x - layer, uv.y, layer)).r;
}

void main() {
    vec2 coord = vec2(gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight);
    float layer = step(1.0, coord.x);

    // Sample multiple points around the current pixel
    float pixelSize = 1.0 / depthWidth;
    float depth = 0.0;

    // 3x3 sampling grid
    for(float x = -3.0; x <= 3.0; x++) {
        for(float y = -3.0; y <= 3.0; y++) {
            vec2 offset = vec2(x * pixelSize, y * pixelSize);
            depth += sampleDepth(coord + offset, layer);
        }
    }

    // Average the samples
    depth /= 49.0;

    gl_FragDepth = depth > depthRadius ? 1.0 : depth;

    // TODO: Trying to figure out how to soften the edges around the hand,
    // but can't quite get this one working. commenting it out for now.
    // vec4 color = gl_FragColor;
    // color.a = 1.0 - gl_FragDepth;
    // gl_FragColor = color;
}
`;

export const DepthShader = () => {
	const shaderSet = useRef(false);
	const shaderRef = useRef<ShaderMaterial | null>(null);

	useFrame(({ gl: renderer }) => {
		if (!renderer.xr.hasDepthSensing() || !renderer.xr.getDepthTexture) return;
		const depthTexture = renderer.xr.getDepthTexture();
		const depthMesh = renderer.xr.getDepthSensingMesh?.();

		if (!depthMesh) return null;

		// Get the current viewport dimensions
		const viewport = renderer.xr.getCamera().cameras[0]?.viewport;

		if (!viewport) return;

		if (!shaderSet.current) {
			const shader = new ShaderMaterial({
				vertexShader: _occlusion_vertex,
				fragmentShader: _occlusion_fragment,
				uniforms: {
					depthColor: { value: depthTexture },
					depthWidth: { value: viewport.z },
					depthHeight: { value: viewport.w },
					depthRadius: { value: 0.9 },
					softness: { value: 0.07 },
				},
			});
			// this should make it obvious if this is being done every frame
			console.debug('Updating depth shader');

			depthMesh.material = shader;
			shaderRef.current = shader;
			shaderSet.current = true;
		} else if (shaderRef.current) {
			// Update the viewport dimensions every frame
			shaderRef.current.uniforms.depthWidth.value = viewport.z;
			shaderRef.current.uniforms.depthHeight.value = viewport.w;
		}
	});

	return null;
};
