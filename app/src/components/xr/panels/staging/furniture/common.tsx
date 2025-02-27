import { RoomTypePicker } from '@/components/xr/ui/RoomTypePicker';
import { Surface } from '@/components/xr/ui/Surface';
import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { useEditorStageMode } from '@/stores/editorStore';
import { useAllFilters, useCategoryFilter, useSetFilters } from '@/stores/FilterStore';
import { Attribute, AttributeKey } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, PanelLeftCloseIcon, PanelLeftIcon, SofaIcon } from '@react-three/uikit-lucide';
import { ReactNode, Suspense, useState } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { FurnitureSelectItem } from './FurnitureSelectItem';

const panelState = proxy({
	showFilters: false,
});

export const FurniturePanelRoot = ({ children }: { children?: ReactNode }) => (
	<Surface height={500} width={600} flexDirection={'column'} justifyContent={'space-between'} flexWrap={'no-wrap'} gap={10} padding={10}>
		<Suspense>{children}</Suspense>
	</Surface>
);

export function SmallButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
	const [hovered, setHovered] = useState(false);
	return (
		<Button onClick={onClick} backgroundColor={hovered ? colors.accent : undefined} padding={4} width={30} height={30} onHoverChange={(hovered) => setHovered(hovered)}>
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
				<PanelLeftIcon color={colors.primary} width={20} height={20} />
			</SmallButton>
			<Container marginX="auto" flexDirection="row" gap={4} alignItems="center" justifyContent="center">
				<SofaIcon color={colors.primary} width={20} height={20} />
				<Text fontSize={20} color={colors.primary}>
					Furniture
				</Text>
			</Container>
		</Container>
	);
};

export const FurniturePanelFilterSidebar = ({ children }: { children?: ReactNode }) => {
	const visible = useSnapshot(panelState).showFilters;
	const [scrollbarVisible, setScrollbarVisible] = useState(0);
	const handleEnter = () => {
		setScrollbarVisible(1);
	};

	const handleLeave = () => {
		setScrollbarVisible(0);
	};
	return (
		<Container
			display={visible ? 'flex' : 'none'}
			flexDirection="column"
			zIndexOffset={2}
			flexGrow={1}
			flexShrink={0}
			height="100%"
			width="30%"
			positionType="absolute"
			positionTop={0}
			positionLeft={0}
			gap={8}
			overflow="scroll"
			padding={10}
			onPointerEnter={handleEnter}
			onPointerLeave={handleLeave}
			scrollbarOpacity={scrollbarVisible}
			scrollbarWidth={8}
			scrollbarBorderRadius={4}
			scrollbarColor={colors.primary}
		>
			<Surface flexDirection="column" height="100%" width="100%" gap={8}>
				{children}
			</Surface>
		</Container>
	);
};

export const FurniturePanelFilterSidebarSectionHeader = ({ children, label }: { children?: ReactNode; label: string }) => {
	return (
		<Container paddingY={10} borderBottomWidth={2} borderColor={colors.primary} justifyContent="space-between">
			<Text color={colors.primary}>{label}</Text>
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
			<PanelLeftCloseIcon color={colors.primary} width={20} height={20} />
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
			scrollbarColor={colors.primary}
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
				<Text color={colors.mutedForeground} fontSize={12}>
					No filters available
				</Text>
			</Container>
		);
	}

	return (
		<Container flexDirection="column" gap={4} flexShrink={0}>
			<FurnitureAttributePickerAllItem attributeKey={key} />
			{options.map((option) => (
				<FurnitureAttributePickerItem key={option.value} attribute={option} />
			))}
		</Container>
	);
}

function FurnitureAttributePickerItem({ attribute }: { attribute: Attribute }) {
	const value = useAllFilters();
	const selected = value.some((a) => a.key === attribute.key && a.value === attribute.value);
	const setValue = useSetFilters();

	return (
		<FurnitureAttributePickerItemButton
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
			{attribute.value[0].toUpperCase() + attribute.value.slice(1)}
		</FurnitureAttributePickerItemButton>
	);
}

function FurnitureAttributePickerAllItem({ attributeKey }: { attributeKey: AttributeKey }) {
	const value = useAllFilters();
	const selected = !value.some((a) => a.key === attributeKey);
	const setValue = useSetFilters();

	return (
		<FurnitureAttributePickerItemButton
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
			All
		</FurnitureAttributePickerItemButton>
	);
}

const FurnitureAttributePickerItemButton = ({ children, onClick, selected }: { children: string; onClick?: () => void; selected?: boolean }) => {
	const [hovered, setHovered] = useState(false);
	return (
		<Button
			onClick={onClick}
			backgroundColor={selected || hovered ? colors.accent : undefined}
			alignItems="center"
			flexDirection="row"
			width="100%"
			paddingY={8}
			paddingX={12}
			height="auto"
			gap={4}
			justifyContent="space-between"
			onHoverChange={(hovered) => setHovered(hovered)}
		>
			<Text fontSize={16} color={colors.foreground}>
				{children}
			</Text>
			{selected && <CheckIcon color={colors.foreground} width={16} height={16} />}
		</Button>
	);
};
