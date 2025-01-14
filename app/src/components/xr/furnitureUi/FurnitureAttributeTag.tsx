import { AttributeKey } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';

export interface FurnitureAttributeTagProps {
	value: { key: AttributeKey; value: string };
}

export function FurnitureAttributeTag({ value }: FurnitureAttributeTagProps) {
	return (
		<Container borderWidth={1} borderRadius={12} borderColor={colors.border} paddingX={8} paddingY={2}>
			<Text fontWeight="black" fontSize={8}>
				{value.key}:
			</Text>
			<Text fontSize={8}>{value.value}</Text>
		</Container>
	);
}
