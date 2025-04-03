import { usePlacingFurnitureId } from '@/stores/propertyStore/hooks/editing';
import { Box, Frame, Heading, Icon, Text } from '@alef/sys';
import { useIsHeadsetConnected } from '../presence/hooks';
import cls from './DesktopFurnitureMobileInstructions.module.css';

export interface DesktopFurnitureMobileInstructionsProps {}

export function DesktopFurnitureMobileInstructions({}: DesktopFurnitureMobileInstructionsProps) {
	const isHeadsetConnected = useIsHeadsetConnected();
	const placingFurniture = !!usePlacingFurnitureId();

	if (!isHeadsetConnected || !placingFurniture) {
		// advice is not relevant...
		return null;
	}

	return (
		<Frame p="small" stacked gapped color="primary" className={cls.root}>
			<Box gapped>
				<Icon name="glasses" />
				<Heading level={4}>Continue in headset</Heading>
			</Box>
			<Text>Use your controller or hand to point and place this furniture</Text>
		</Frame>
	);
}
