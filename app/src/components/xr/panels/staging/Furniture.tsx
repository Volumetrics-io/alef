import { FurnitureItem, useAllFurniture } from '@/services/publicApi/furnitureHooks';
import { useEditorStageMode } from '@/stores/editorStore';
import { useActiveRoomLayout, useAddFurniture } from '@/stores/roomStore/roomStore';
import { Attribute, RoomType } from '@alef/common';
import { Container, Image, Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from '@react-three/uikit-lucide';
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
		<Surface height={420} width={600} flexDirection="column" justifyContent="space-between" flexWrap="no-wrap" gap={10} padding={10}>
			<FilterControl filters={filters} setFilters={setFilters} />
			<Container flexDirection="row" gap={8} overflow="scroll" flexShrink={0} scrollbarWidth={8} scrollbarBorderRadius={4} paddingBottom={8} scrollbarColor={colors.primary}>
				{furniture.map((furnitureItem) => (
					<FurnitureSelectItem key={furnitureItem.id} furnitureItem={furnitureItem} />
				))}
			</Container>
			<Container flexShrink={0} flexDirection="row" gap={4} width="100%" paddingRight={6} justifyContent="space-between">
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
	const [hovered, setHovered] = useState(false);
	return (
		<Surface
			flexDirection="column"
			flexWrap="no-wrap"
			gap={3}
			marginBottom={5}
			flexShrink={0}
			alignItems="center"
			onHoverChange={(hovered) => setHovered(hovered)}
		>
			<Container
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				backgroundColor={colors.accent}
				borderRadius={5}
				width="100%"
				height={250}
			>
				<Text fontSize={18} positionType="absolute" positionTop={10} positionLeft="auto" color={colors.primary}>
					{furnitureItem.name}
				</Text>
				{hovered && <FurnitureAddButton furnitureItem={furnitureItem} />}
				<Image src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureItem.id}/image.jpg`} width="100%" height="100%" objectFit="cover" />
			</Container>
		</Surface>
	);
}

function FurnitureAddButton({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const addFurniture = useAddFurniture();
	const [hovered, setHovered] = useState(false);
	return (
		<Button
			onHoverChange={(hovered) => setHovered(hovered)}
			zIndexOffset={hovered ? 10 : 0}
			height={30}
			width={30}
			padding={4}
			borderRadius={25}
			positionType="absolute"
			positionBottom={10}
			positionRight={10}
			onClick={() =>
				addFurniture({
					furnitureId: furnitureItem.id,
					position: { x: 0, y: 0, z: 0 },
					rotation: { x: 0, y: 0, z: 0, w: 1 },
				})}
		>
			<PlusIcon />
		</Button>
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
			size="medium"
		/>
	);
}
