import { RoundedBox } from '@react-three/drei';
import { GroupProps } from '@react-three/fiber';
import { forwardRef } from 'react';
import { Group } from 'three';
import { VoluShaderMaterial } from '../shaders/VoluShader';

export interface SimpleBoxProps extends GroupProps {
	size: [number, number, number];
	pointerEvents?: 'none' | 'auto';
	transparent?: boolean;
}

export const SimpleBox = forwardRef<Group, SimpleBoxProps>(function SimpleBox({ size, transparent, ...rest }, ref) {
	return (
		<group {...rest} ref={ref}>
			<RoundedBox args={size} radius={0.1}>
				<VoluShaderMaterial />
			</RoundedBox>
		</group>
	);
});
