import { GroupProps } from '@react-three/fiber';
import { forwardRef, useMemo } from 'react';
import { Box3, Group } from 'three';

export interface SimpleBoxProps extends GroupProps {
	size: [number, number, number];
	pointerEvents?: 'none' | 'auto';
	transparent?: boolean;
}

export const SimpleBox = forwardRef<Group, SimpleBoxProps>(function SimpleBox({ size, transparent, ...rest }, ref) {
	const box = useMemo(() => new Box3().setFromArray([-size[0] / 2, -size[1] / 2, -size[2] / 2, size[0] / 2, size[1] / 2, size[2] / 2]), [size[0], size[1], size[2]]);
	return (
		<group {...rest} ref={ref}>
			<box3Helper
				args={[box, 0x6b6bff]}
				onUpdate={(self) => {
					self.computeLineDistances();
				}}
			>
				<lineDashedMaterial color={0x6b6bff} dashSize={0.05} gapSize={0.05} transparent={transparent} />
			</box3Helper>
		</group>
	);
});
