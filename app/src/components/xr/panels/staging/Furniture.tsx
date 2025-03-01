import { FurnitureItem, useAllFurniture, useFurnitureAttributes } from '@/services/publicApi/furnitureHooks';
import { useEditorStageMode } from '@/stores/editorStore';
import {  useAddFurniture } from '@/stores/roomStore/roomStore';
import { Attribute, RoomType } from '@alef/common';
import { Container, ContainerRef, Image, Text } from '@react-three/uikit';
import { colors } from '../../ui/theme';
import { ArrowLeftIcon, ArrowRightIcon, PanelLeftCloseIcon, PanelLeftIcon, PlusIcon, SofaIcon } from '@react-three/uikit-lucide';
import { useState, useRef, useEffect } from 'react';
import { RoomTypePicker } from '../../ui/RoomTypePicker';
import { Surface } from '../../ui/Surface';
import { useFilterStore } from '@/stores/FilterStore';
import { FurnitureTypePicker } from '../../ui/FurnitureTypePicker';
import { Button } from '../../ui/Button';
import { animated, config, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';

const AnimatedSurface = animated(Surface);



export function Furniture() {
	const [, setMode] = useEditorStageMode();
	const { filters, type } = useFilterStore();

	const [showFilters, setShowFilters] = useState(false);

	return (
		<Surface height={500} width={600} flexDirection="column" justifyContent="space-between" flexWrap="no-wrap" gap={10} padding={10}>
			<FurnitureTypeFilters visible={showFilters} setVisible={setShowFilters} />
			<Container flexDirection="row" gap={4} width="100%" >
				<SmallButton onClick={() => setShowFilters(true)}>
					<PanelLeftIcon width={20} height={20} />
				</SmallButton>
				<Container marginX="auto" flexDirection="row" gap={4} alignItems="center" justifyContent="center">
					<SofaIcon width={20} height={20} />
					<Text fontSize={20}>Furniture</Text>
				</Container>
			</Container>
			<FurnitureCollection key={type?.value ?? 'all'} type={type?.value ?? null} attributes={type ? [...filters, type] : filters} />
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

function FurnitureTypeFilters({ visible, setVisible }: { visible: boolean; setVisible: (visible: boolean) => void }) {
	const scrollbarVisible = useRef(0);
	const { filters, setFilters } = useFilterStore();
	const { data: attributes } = useFurnitureAttributes('type');
	const [{ transformTranslateX }, api] = useSpring(() => ({ transformTranslateX: -180, config: config.default }));

	const [isVisible, setIsVisible] = useState(false);

	useFrame(() => {
		if (visible) {
			api.start({ transformTranslateX: 0 });
		} else {
			api.start({ transformTranslateX: -180 });
		}

		const newVisibility = visible || transformTranslateX.isAnimating;
		if (newVisibility !== isVisible) {
			setIsVisible(newVisibility);
		}
	});

	const handleEnter = () => {
		scrollbarVisible.current = 1;
	};

	const handleLeave = () => {
		scrollbarVisible.current = 0;
	};
	return (
		<Container
		width="30%"
		overflow="hidden"
		display={isVisible ? 'flex' : 'none'}
		flexDirection="column"
		zIndexOffset={2}
		flexGrow={1}
		flexShrink={0} 
		height="100%"
		positionType="absolute"
		positionTop={0}
		positionLeft={0}
		gap={8} 
		padding={6}>

		<AnimatedSurface 
			transformTranslateX={transformTranslateX}
			flexDirection="column" 
			height="100%" 
			width="100%" 
			onPointerEnter={handleEnter} onPointerLeave={handleLeave} 
			scrollbarOpacity={scrollbarVisible.current} 
			scrollbarWidth={8} 
			scrollbarBorderRadius={4} 
			overflow="scroll"
			scrollbarColor={colors.ink}
			gap={8}>
			<Container flexDirection="column" gap={2}>
				<Container paddingY={10} paddingX={4} flexDirection="row" justifyContent="space-between" alignItems="center">
					<Text>Categories</Text>
					<SmallButton onClick={() => setVisible(false)}>
					<PanelLeftCloseIcon width={20} height={20} />
				</SmallButton>
			</Container>
			<FilterControl filters={filters} setFilters={setFilters} />
			</Container>
			<Container flexDirection="column" gap={2}>
				<Text paddingY={10} paddingX={4}>Types</Text>
			<FurnitureTypePicker attributes={attributes} size="small" />
			</Container>
		</AnimatedSurface>
		</Container>
	);
}

function SmallButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
	return (
		<Button onClick={onClick} variant="ghost" padding={4} width={30} height={30}>
			{children}
		</Button>
	);
}

function FurnitureCollection({ attributes }: { type: string | null; attributes: Attribute[] }) {
	const { data: furniture } = useAllFurniture({
		attributeFilter: attributes,
	});

	const [scrollbarVisible, setScrollbarVisible] = useState(0);


	if (furniture.length === 0) {
		return null;
	}


	const handleEnter = () => {
		setScrollbarVisible(1);
	};

	const handleLeave = () => {
		setScrollbarVisible(0);
	};

	return (
			<Container flexDirection="column" gap={8} flexWrap="wrap" overflow="scroll" onPointerEnter={handleEnter} onPointerLeave={handleLeave} scrollbarOpacity={scrollbarVisible} scrollbarWidth={8} scrollbarBorderRadius={4} paddingBottom={8} scrollbarColor={colors.ink}>
				{furniture.map((furnitureItem) => (
					<FurnitureSelectItem key={furnitureItem.id} furnitureItem={furnitureItem} />
				))}
			</Container>
	);
}

function FurnitureSelectItem({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const [hovered, setHovered] = useState(false);
	return (
		<Surface
			height="48%"
			flexDirection="column"
			flexWrap="no-wrap"
			gap={3}
			flexShrink={0}
			alignItems="center"
			onHoverChange={(hovered) => setHovered(hovered)}
		>
			<Container
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				backgroundColor={colors.paper}
				borderRadius={5}
				width="100%"
			>
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
			variant="link"
			width={30}
			height={30}
			padding={4}
			onHoverChange={(hovered) => setHovered(hovered)}
			zIndexOffset={hovered ? 10 : 0}
			positionType="absolute"
			positionBottom={6}
			positionRight={6}
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
			direction="column"
			size="medium"
		/>
	);
}
