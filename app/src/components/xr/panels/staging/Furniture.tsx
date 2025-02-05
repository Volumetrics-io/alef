import { usePositionInFrontOfUser } from '@/hooks/usePositionInFrontOfUser';
import { FurnitureItem, useAllFurniture } from '@/services/publicApi/furnitureHooks';
import { useAddFurniture } from '@/stores/roomStore/roomStore';
import { AttributeKey, formatAttribute } from '@alef/common';
import { Container, Content, Text } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { FurnitureModel } from '../../furniture/FurnitureModel';
import { Surface } from '../../ui/Surface';

export function Furniture() {
	const { data: furniture } = useAllFurniture();

	return (
		<Surface maxWidth={1200}>
			{furniture.map((furnitureItem) => (
				<FurnitureSelectItem key={furnitureItem.id} furnitureItem={furnitureItem} />
			))}
		</Surface>
	);
}

function FurnitureSelectItem({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const addFurniture = useAddFurniture();
	const getInitialPosition = usePositionInFrontOfUser();
	return (
		<Surface
			flexDirection="column"
			gap={5}
			width="25%"
			onClick={() =>
				addFurniture({
					furnitureId: furnitureItem.id,
					worldPosition: getInitialPosition().setY(0),
					rotation: { x: 0, y: 0, z: 0, w: 1 },
				})
			}
		>
			<Text fontSize={18} color={colors.primary}>
				{furnitureItem.name}
			</Text>
			<Container flexDirection="row" gap={2} flexWrap="wrap">
				{furnitureItem.attributes.map((attr) => (
					<FurnitureAttributeTag key={formatAttribute(attr)} value={attr} />
				))}
			</Container>
			<Container flexDirection="column" flexGrow={1} flexShrink={0} backgroundColor={colors.accent} borderRadius={5} padding={4} height={120}>
				<Content marginY="auto">
					<ambientLight intensity={0.5} />
					<FurnitureModel furnitureId={furnitureItem.id} />
				</Content>
			</Container>
		</Surface>
	);
}

interface FurnitureAttributeTagProps {
	value: { key: AttributeKey; value: string };
}
function FurnitureAttributeTag({ value }: FurnitureAttributeTagProps) {
	return (
		<Container borderWidth={1} borderRadius={12} borderColor={colors.border} paddingX={8} paddingY={2}>
			<Text fontSize={8} color={colors.primary}>
				{value.key}:
			</Text>
			<Text fontSize={8} color={colors.primary}>
				{value.value}
			</Text>
		</Container>
	);
}
