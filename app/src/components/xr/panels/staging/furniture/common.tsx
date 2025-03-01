import { RoomTypePicker } from '@/components/xr/ui/RoomTypePicker';
import { Surface } from '@/components/xr/ui/Surface';
import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { useEditorStageMode } from '@/stores/editorStore';
import { useAllFilters, useCategoryFilter, useSetFilters } from '@/stores/FilterStore';
import { Attribute, AttributeKey } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { Button } from '@/components/xr/ui/Button';
import { colors } from '@/components/xr/ui/theme';
import { ArrowLeftIcon, ArrowRightIcon, PanelLeftCloseIcon, PanelLeftIcon, SofaIcon } from '@react-three/uikit-lucide';
import { ReactNode, Suspense, useRef, useState } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { FurnitureSelectItem } from './FurnitureSelectItem';
import { config, useSpring, animated } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import { Selector } from '@/components/xr/ui/Selector';
import { SelectorItem } from '@/components/xr/ui/Selector';
import { Heading } from '@/components/xr/ui/Heading';
const AnimatedSurface = animated(Surface);

const panelState = proxy({
	showFilters: false,
});

export const FurniturePanelRoot = ({ children }: { children?: ReactNode }) => (
	<Surface height={500} width={600} flexDirection={'column'} justifyContent={'space-between'} flexWrap={'no-wrap'} gap={10} padding={10}>
		<Suspense>{children}</Suspense>
	</Surface>
);

function SmallButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
	return (
		<Button onClick={onClick} variant="ghost" padding={4} width={30} height={30}>
			{children}
		</Button>
	);
}

export const FurniturePanelHeader = () => {
	return (
		<Container flexDirection="row" flexGrow={0} gap={4} width="100%">
			<SmallButton
				onClick={() => {
					panelState.showFilters = true;
				}}
			>
				<PanelLeftIcon width={20} height={20} />
			</SmallButton>
			<Container marginX="auto" flexDirection="row" gap={4} alignItems="center" justifyContent="center">
				<SofaIcon width={20} height={20} />
				<Heading level={3}>
					Furniture
				</Heading>
			</Container>
		</Container>
	);
};

export const FurniturePanelFilterSidebar = ({ children }: { children?: ReactNode }) => {
	const visible = useSnapshot(panelState).showFilters;
	const scrollbarVisible = useRef(0);
	const [isVisible, setIsVisible] = useState(false);

	const [{ transformTranslateX }, api] = useSpring(() => ({ transformTranslateX: -180, config: config.default }));

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
				{children}
		</AnimatedSurface>
		</Container>
	);
};

export const FurniturePanelFilterSidebarSectionHeader = ({ children, label }: { children?: ReactNode; label: string }) => {
	return (
		<Container paddingY={10} justifyContent="space-between">
			<Text>{label}</Text>
			{children}
		</Container>
	);
};

export const FurniturePanelFilterSidebarCloseButton = () => {
	return (
		<SmallButton
			onClick={() => {
				panelState.showFilters = false;
			}}
		>
			<PanelLeftCloseIcon width={20} height={20} />
		</SmallButton>
	);
};

export const FurnitureCollection = ({ furniture }: { furniture: FurnitureItem[] }) => {
	const [scrollbarVisible, setScrollbarVisible] = useState(0);

	const handleEnter = () => {
		setScrollbarVisible(1);
	};

	const handleLeave = () => {
		setScrollbarVisible(0);
	};

	return (
		<Container
			flexDirection="column"
			flexGrow={1}
			gap={8}
			flexWrap="wrap"
			overflow="scroll"
			onPointerEnter={handleEnter}
			onPointerLeave={handleLeave}
			scrollbarOpacity={scrollbarVisible}
			scrollbarWidth={8}
			scrollbarBorderRadius={4}
			paddingBottom={8}
			scrollbarColor={colors.ink}
		>
			{furniture.map((furnitureItem) => (
				<FurnitureSelectItem key={furnitureItem.id} furnitureItem={furnitureItem} />
			))}
		</Container>
	);
};

export function CategoryFilter() {
	const [selectedRoomTypes, setSelectedRoomTypes] = useCategoryFilter();

	return <RoomTypePicker multiple value={selectedRoomTypes} onValueChange={setSelectedRoomTypes} direction="column" size="medium" />;
}

export function FurniturePanelNavigation() {
	const [, setMode] = useEditorStageMode();

	return (
		<Container flexShrink={0} flexDirection="row" gap={4} width="100%" paddingRight={6} justifyContent="space-between">
			<Button onClick={() => setMode('layout')}>
				<ArrowLeftIcon />
			</Button>
			<Button onClick={() => setMode('lighting')}>
				<ArrowRightIcon />
			</Button>
		</Container>
	);
}

export function FurnitureAttributePicker({ options }: { options: Attribute[] }) {
	const key = options[0]?.key;

	if (!key) {
		return (
			<Container padding={5}>
				<Text color={colors.faded} fontSize={12}>
					No filters available
				</Text>
			</Container>
		);
	}

	return (
		<Selector flexWrap="wrap" flexDirection="column" size="small">
            <FurnitureAttributePickerAllItem key="all" attributeKey={key} />
			{options.map((option) => (
				<FurnitureAttributePickerItem key={option.value} attribute={option} />
			))}
		</Selector>
	);
}

function FurnitureAttributePickerItem({ attribute }: { attribute: Attribute }) {
	const value = useAllFilters();
	const selected = value.some((a) => a.key === attribute.key && a.value === attribute.value);
	const setValue = useSetFilters();

	return (
		<SelectorItem
			onClick={() =>
				setValue((prev) => {
					if (selected) {
						return prev.filter((a) => !(a.key === attribute.key && a.value === attribute.value));
					} else {
						return [...prev, attribute];
					}
				})
			}
			selected={selected}
		>
			<Text>
				{attribute.value[0].toUpperCase() + attribute.value.slice(1)}
			</Text>
		</SelectorItem>
	);
}

function FurnitureAttributePickerAllItem({ attributeKey }: { attributeKey: AttributeKey }) {
	const value = useAllFilters();
	const selected = !value.some((a) => a.key === attributeKey);
	const setValue = useSetFilters();

	return (
		<SelectorItem
			// does nothing when already active
			onClick={
				selected
					? undefined
					: () =>
							setValue((prev) => {
								// removes all applied filters on this key when selected
								return prev.filter((a) => a.key !== attributeKey);
							})
			}
			selected={selected}
		>
			<Text>
				All
			</Text>
		</SelectorItem>
	);
}
