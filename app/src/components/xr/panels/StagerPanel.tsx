import { firstTimeUserXROnboarding } from '@/onboarding/firstTimeUserXR';
import { usePanelState } from '@/stores/editorStore';
import { useEditorMode } from '@/stores/roomStore/hooks/editing';
import { Container, Root, Text } from '@react-three/uikit';
import { HouseIcon, MinimizeIcon, SofaIcon, SunIcon } from '@react-three/uikit-lucide';
import { useXR } from '@react-three/xr';
import { Suspense, useMemo } from 'react';
import { Vector3 } from 'three';
import { DraggableBodyAnchor } from '../anchors/DraggableBodyAnchor';
import { DragController } from '../controls/Draggable';
import { OnboardingFrame } from '../onboarding/OnboardingFrame';
import { Defaults } from '../ui/Defaults';
import { colors } from '../ui/theme';
import { Navigation } from './navigation';
import { RescanPrompt } from './RescanPrompt';
import { UndoControls } from './staging/common/UndoControls';
import { FurniturePanel } from './staging/furniture/FurniturePanel';
import { SelectedFurnitureWidget } from './staging/furniture/SelectedFurnitureUI';
import { Layouts } from './staging/Layouts';
import { Lighting } from './staging/Lighting';
import { SettingsPanel } from './staging/SettingsPanel';
import { UpdatePrompt } from './UpdatePrompt';

export function StagerPanel() {
	const [panelState] = usePanelState();
	const [mode] = useEditorMode();
	const isInXR = useXR((s) => !!s.session);

	const position = useMemo(() => {
		if (!isInXR) {
			return new Vector3(-0.1, 0, 0.75);
		}
		if (panelState === 'open') {
			return new Vector3(0, -0.15, 0.75);
		}
		if (panelState === 'hidden') {
			return new Vector3(0.5, -0.3, 0.6);
		}
		return new Vector3(0, 0.2, 0.75);
	}, [panelState, isInXR]);

	return (
		<DraggableBodyAnchor follow={panelState !== 'open'} position={position} lockY={true} distance={0.15}>
			<Root pixelSize={0.001} alignItems={panelState === 'hidden' ? 'center' : undefined} flexDirection="column" positionType="relative" gap={10}>
				<Defaults>
					<Onboarding />
					<Suspense>{panelState === 'hidden' && mode === 'furniture' && <SelectedFurnitureWidget />}</Suspense>
					<Container flexDirection="row" justifyContent="space-between">
						<Navigation />
						{panelState === 'open' && (
							<Container flexGrow={0} flexShrink={0} gap={10}>
								<UndoControls />
							</Container>
						)}
					</Container>
					<UpdatePrompt />
					<RescanPrompt />
					{panelState === 'open' && (
						<>
							{mode === 'lighting' && <Lighting />}
							{mode === 'furniture' && (
								<Suspense>
									<FurniturePanel />
								</Suspense>
							)}
							{mode === 'layouts' && <Layouts />}
							{mode === 'settings' && <SettingsPanel />}
							{mode !== null && (
								<DragController>
									<Container flexDirection="row" width="70%" gap={10} alignItems="center">
										<Container backgroundColor={colors.surface} height={15} borderRadius={10} borderColor={colors.border} borderWidth={0.5} flexGrow={1} />
									</Container>
								</DragController>
							)}
						</>
					)}
				</Defaults>
			</Root>
		</DraggableBodyAnchor>
	);
}

function Onboarding() {
	const commonProps = {
		onboarding: firstTimeUserXROnboarding,
		positionType: 'absolute',
		positionTop: -20,
		positionLeft: 0,
		transformTranslateY: '-100%',
	} as const;
	return (
		<>
			<OnboardingFrame {...commonProps} step="welcome">
				<Text>Welcome to Alef! Tap this menu to get started</Text>
			</OnboardingFrame>
			<OnboardingFrame {...commonProps} step="layouts">
				<Text>Your room can have multiple layouts. We made an empty one for you to start with.</Text>
				<Container flexDirection={'row'} flexWrap="wrap" gap={5} alignItems="center">
					<Text>Point and select the </Text>
					<HouseIcon />
					<Text> icon to edit layouts.</Text>
				</Container>
			</OnboardingFrame>
			<OnboardingFrame {...commonProps} step="furniture">
				<Text>Choose from a variety of furniture to fill your room.</Text>
				<Container flexDirection={'row'} flexWrap="wrap" gap={5} alignItems="center">
					<Text>Point and select the </Text>
					<SofaIcon />
					<Text> icon to add furniture.</Text>
				</Container>
			</OnboardingFrame>
			<OnboardingFrame {...commonProps} step="lighting">
				<Text>Place lights on the ceiling to match your room, and Alef's lighting engine will compute furniture shadows and ambient light.</Text>
				<Container flexDirection={'row'} flexWrap="wrap" gap={5} alignItems="center">
					<Text>Point and select the </Text>
					<SunIcon />
					<Text> icon to adjust lighting.</Text>
				</Container>
			</OnboardingFrame>
			<OnboardingFrame {...commonProps} step="minimize">
				<Container flexDirection="row" flexWrap="wrap" gap={5} alignItems="center">
					<Text>Use the</Text>
					<MinimizeIcon />
					<Text>icon to minimize this menu while you're working.</Text>
				</Container>
			</OnboardingFrame>
		</>
	);
}
