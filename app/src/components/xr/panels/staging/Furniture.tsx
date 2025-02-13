import { usePositionInFrontOfUser } from '@/hooks/usePositionInFrontOfUser';
import { FurnitureItem, useAllFurniture } from '@/services/publicApi/furnitureHooks';
import { useActiveRoomLayout, useAddFurniture } from '@/stores/roomStore/roomStore';
import { Attribute, formatAttribute, RoomType } from '@alef/common';
import { Container, Content, Text } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { useState } from 'react';
import { FurnitureModel } from '../../furniture/FurnitureModel';
import { RoomTypePicker } from '../../ui/RoomTypePicker';
import { Surface } from '../../ui/Surface';

export function Furniture() {
	const layout = useActiveRoomLayout();
	const [filters, setFilters] = useState<Attribute[]>(() => {
		// initial filter selects furniture of the same type as the layout
		if (layout?.type) {
			return [{ key: 'category', value: layout.type }];
		}
		return [];
	});
	const { data: furniture } = useAllFurniture({
		attributeFilter: filters,
	});

	return (
		<Surface width={800} flexDirection="column" alignItems="flex-start" gap={8}>
			<FilterControl filters={filters} setFilters={setFilters} />
			<Container flexDirection="row" gap={8} flexWrap="wrap">
				{furniture.map((furnitureItem) => (
					<FurnitureSelectItem key={furnitureItem.id} furnitureItem={furnitureItem} />
				))}
			</Container>
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
			width={100}
			onClick={() =>
				addFurniture({
					furnitureId: furnitureItem.id,
					position: getInitialPosition().setY(0),
					rotation: { x: 0, y: 0, z: 0, w: 1 },
				})
			}
		>
			<Text fontSize={14} color={colors.primary}>
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
	value: Attribute;
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

function FilterControl({ filters, setFilters }: { filters: Attribute[]; setFilters: (filters: Attribute[]) => void }) {
	const selectedRoomTypes = filters.filter((f) => f.key === 'category').map((f) => f.value as RoomType);

	return (
		<Container flexDirection="column" gap={4} alignItems="flex-start" alignSelf="center">
			<RoomTypePicker
				multiple
				value={selectedRoomTypes}
				onValueChange={(newSelectedCategories) => {
					setFilters(filters.filter((f) => f.key !== 'category').concat(newSelectedCategories.map((category) => ({ key: 'category', value: category }))));
				}}
			/>
		</Container>
	);
}
