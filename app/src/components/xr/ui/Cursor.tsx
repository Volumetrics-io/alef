import { ColorRepresentation } from '@pmndrs/uikit';
import { colors } from './theme';
import { forwardRef } from 'react';
import { DoubleSide, Group } from 'three';
import { GroupProps } from '@react-three/fiber';

export const Cursor = forwardRef<Group, { visible: boolean; color?: ColorRepresentation | string; children?: React.ReactNode } & GroupProps>(
	({ visible, color, children, ...props }, ref) => {
		return (
			<group visible={visible} ref={ref} position={[0, 0.1, 0]} {...props}>
				{children}
				{/* @ts-ignore - pointerEvents not included in typings */}
				<mesh renderOrder={1000} rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
					<ringGeometry args={[0.25, 0.3, 64]} />
					<meshBasicMaterial color={color ?? colors.focus.value} side={DoubleSide} />
				</mesh>
				{/* @ts-ignore - pointerEvents not included in typings */}
				<mesh renderOrder={1000} rotation={[-Math.PI / 2, 0, 0]} pointerEvents="none">
					<ringGeometry args={[0.4, 0.43, 64]} />
					<meshBasicMaterial color={color ?? colors.focus.value} side={DoubleSide} />
				</mesh>
			</group>
		);
	}
);
