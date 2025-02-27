import { useRescanRoom } from '@/hooks/useRescanRoom';
import { useMe } from '@/services/publicApi/userHooks';
import { useEditorStageMode } from '@/stores/editorStore';
import { Container, Root } from '@react-three/uikit';
import { colors, Toggle } from '@react-three/uikit-default';
import { BoxIcon, HouseIcon, Menu, SettingsIcon, Sofa, SunIcon, X } from '@react-three/uikit-lucide';
import { useXR } from '@react-three/xr';
import { Suspense, useMemo, useState } from 'react';
import { Vector3 } from 'three';
import { DraggableBodyAnchor } from '../anchors/DraggableBodyAnchor';
import { DragController } from '../controls/Draggable';
import { Surface } from '../ui/Surface';
import { FurniturePanel } from './staging/furniture/FurniturePanel';
import { Layouts } from './staging/Layouts';
import { Lighting } from './staging/Lighting';
import { SettingsPanel } from './staging/SettingsPanel';

export function StagerPanel({ onToggle }: { onToggle?: () => void }) {
	const [mode, setMode] = useEditorStageMode();
	const [isOpen, setIsOpen] = useState(false);
	const isInXR = useXR((s) => !!s.session);

	const position = useMemo(() => {
		if (!isInXR) {
			return new Vector3(0, -0.1, 0.75);
		}
		if (isOpen) {
			return new Vector3(0, -0.15, 0.75);
		}
		return new Vector3(0, 0.2, 0.75);
	}, [isOpen, isInXR]);

	const { canRescan, rescanRoom } = useRescanRoom();

	const { data: session } = useMe();
	const isLoggedIn = !!session;

	return (
		<DraggableBodyAnchor follow={!isOpen} position={position} lockY={true} distance={0.15}>
			<Root pixelSize={0.001} flexDirection="column" gap={10}>
				<Surface flexGrow={0} flexShrink={0} marginX="auto">
					<Toggle
						onClick={() => {
							setMode(null);
							setIsOpen(!isOpen);
							onToggle?.();
						}}
					>
						{isOpen ? <X color={colors.primary} /> : <Menu color={colors.primary} />}
					</Toggle>
					<Container display={isOpen ? 'flex' : 'none'} flexDirection="row" alignItems={'center'} gap={10}>
						<Toggle checked={mode === 'layout'} onClick={() => setMode('layout')}>
							<HouseIcon color={colors.primary} />
						</Toggle>
						<Toggle checked={mode === 'furniture'} onClick={() => setMode('furniture')}>
							<Sofa color={colors.primary} />
						</Toggle>
						<Toggle checked={mode === 'lighting'} onClick={() => setMode('lighting')}>
							<SunIcon color={colors.primary} />
						</Toggle>
						{canRescan && (
							<Toggle onClick={() => rescanRoom()}>
								<BoxIcon color={colors.primary} />
							</Toggle>
						)}
						{!isLoggedIn && (
							<Toggle onClick={() => setMode('settings')}>
								<SettingsIcon color={colors.secondaryForeground} />
							</Toggle>
						)}
					</Container>
				</Surface>
				{isOpen && (
					<>
						{mode === 'lighting' && <Lighting />}
						{mode === 'furniture' && (
							<Suspense>
								<FurniturePanel />
							</Suspense>
						)}
						{mode === 'layout' && <Layouts />}
						{mode === 'settings' && <SettingsPanel />}
						{mode !== null && (
							<DragController>
								<Container flexDirection="row" width="70%" gap={10} alignItems="center">
									<Container backgroundColor={colors.background} height={15} borderRadius={10} borderColor={colors.border} borderWidth={0.5} flexGrow={1} />
								</Container>
							</DragController>
						)}
					</>
				)}
			</Root>
		</DraggableBodyAnchor>
	);
}
