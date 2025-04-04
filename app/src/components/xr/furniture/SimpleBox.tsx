import { RoundedBox } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';
import { forwardRef } from 'react';
import { Group } from 'three';
import { VoluShaderMaterial } from '../shaders/VoluShader';

type GroupProps = ThreeElements['group'];
export interface SimpleBoxProps extends GroupProps {
	size: [number, number, number];
	transparent?: boolean;
}

export const SimpleBox = forwardRef<Group, SimpleBoxProps>(function SimpleBox({ size, transparent, ...rest }, ref) {
	console.log(size, rest);
	return (
		<group {...rest} ref={ref}>
			<RoundedBox args={size} radius={0.1}>
				<VoluShaderMaterial />
			</RoundedBox>
		</group>
	);
});
