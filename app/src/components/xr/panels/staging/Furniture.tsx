import { FurnitureItem, useAllFurniture } from '@/services/publicApi/furnitureHooks';
import { useEditorStageMode } from '@/stores/editorStore';
import { useActiveRoomLayout, useAddFurniture } from '@/stores/roomStore/roomStore';
import { Attribute, formatAttribute, RoomType } from '@alef/common';
import { Container, Image, Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { ArrowLeftIcon, ArrowRightIcon } from '@react-three/uikit-lucide';
import { useState } from 'react';
import { RoomTypePicker } from '../../ui/RoomTypePicker';
import { Surface } from '../../ui/Surface';

export function Furniture() {
	const [, setMode] = useEditorStageMode();
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
		<Surface width={430} height={300} flexDirection="column" flexWrap="no-wrap" gap={10} padding={10}>
			<FilterControl filters={filters} setFilters={setFilters} />
			{/* <ambientLight intensity={0.5} /> */}
			<Container overflow="scroll" flexShrink={1} scrollbarWidth={5} scrollbarBorderRadius={2} paddingRight={6} scrollbarColor={colors.primary} flexDirection="column">
				<Container flexDirection="row" gap={8} justifyContent="space-evenly" flexWrap="wrap">
					{furniture.map((furnitureItem) => (
						<FurnitureSelectItem key={furnitureItem.id} furnitureItem={furnitureItem} />
					))}
				</Container>
			</Container>
			<Container flexGrow={1} flexShrink={0} flexDirection="row" gap={4} width="100%" paddingRight={6} justifyContent="space-between">
				<Button onClick={() => setMode('layout')}>
					<ArrowLeftIcon />
				</Button>
				<Button onClick={() => setMode('lighting')}>
					<ArrowRightIcon />
				</Button>
			</Container>
		</Surface>
	);
}

function FurnitureSelectItem({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const addFurniture = useAddFurniture();
	return (
		<Surface
			flexDirection="column"
			gap={5}
			width={180}
			marginBottom={5}
			onClick={() =>
				addFurniture({
					furnitureId: furnitureItem.id,
					position: { x: 0, y: 0, z: 0 },
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
			<Container
				flexDirection="column"
				flexGrow={1}
				flexShrink={0}
				alignItems="center"
				justifyContent="center"
				backgroundColor={colors.accent}
				borderRadius={5}
				width="100%"
				height={120}
			>
				<Image src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureItem.id}/image.jpg`} width="100%" height="100%" objectFit="cover" />
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
		<RoomTypePicker
			multiple
			value={selectedRoomTypes}
			onValueChange={(newSelectedCategories) => {
				setFilters(filters.filter((f) => f.key !== 'category').concat(newSelectedCategories.map((category) => ({ key: 'category', value: category }))));
			}}
			direction="row"
			wrap
			size="small"
		/>
	);
}
