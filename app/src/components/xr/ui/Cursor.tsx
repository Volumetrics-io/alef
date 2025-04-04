import { ThreeElements } from '@react-three/fiber';
import { ColorRepresentation } from '@react-three/uikit';
import { forwardRef } from 'react';
import { DoubleSide, Group } from 'three';
import { colors } from './theme';

type GroupProps = ThreeElements['group'];
export const Cursor = forwardRef<Group, { visible: boolean; color?: ColorRepresentation | string; children?: React.ReactNode } & GroupProps>(
	({ visible, color, children, ...props }, ref) => {
		return (
			<group visible={visible} ref={ref} position={[0, 0.1, 0]} {...props} scale={1}>
				{children}
				{/* @ts-ignore - pointerEvents not included in typings */}
				<mesh renderOrder={1000} rotation={[-Math.PI / 2, 0, 0]} scale={props.scale} pointerEvents="none">
					<ringGeometry args={[0.25, 0.3, 64]} />
					<meshBasicMaterial color={color ?? colors.focus.value} side={DoubleSide} />
				</mesh>
				{/* @ts-ignore - pointerEvents not included in typings */}
				<mesh renderOrder={1000} rotation={[-Math.PI / 2, 0, 0]} scale={props.scale} pointerEvents="none">
					<ringGeometry args={[0.4, 0.43, 64]} />
					<meshBasicMaterial color={color ?? colors.focus.value} side={DoubleSide} />
				</mesh>
			</group>
		);
	}
);
