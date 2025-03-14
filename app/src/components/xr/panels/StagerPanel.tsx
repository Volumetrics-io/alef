import { useRescanRoom } from '@/hooks/useRescanRoom';
import { useEditorStageMode } from '@/stores/editorStore';
import { Container, Root } from '@react-three/uikit';
import { Defaults } from '../ui/Defaults';
import { BoxIcon, HouseIcon, Menu, SettingsIcon, Sofa, SunIcon, X } from '@react-three/uikit-lucide';
import { useXR } from '@react-three/xr';
import { Suspense, useMemo, useState } from 'react';
import { Vector3 } from 'three';
import { DraggableBodyAnchor } from '../anchors/DraggableBodyAnchor';
import { DragController } from '../controls/Draggable';
import { Button } from '../ui/Button';
import { Selector, SelectorItem } from '../ui/Selector';
import { colors } from '../ui/theme';
import { UndoControls } from './staging/common/UndoControls';
import { FurniturePanel } from './staging/furniture/FurniturePanel';
import { Layouts } from './staging/Layouts';
import { Lighting } from './staging/Lighting';
import { SettingsPanel } from './staging/SettingsPanel';
import { UpdatePrompt } from './UpdatePrompt';

export function StagerPanel() {
	const [mode, setMode] = useEditorStageMode();
	const [isOpen, setIsOpen] = useState(false);
	const isInXR = useXR((s) => !!s.session);

	const position = useMemo(() => {
		if (!isInXR) {
			return new Vector3(-0.1, 0, 0.75);
		}
		if (isOpen) {
			return new Vector3(0, -0.15, 0.75);
		}
		return new Vector3(0, 0.2, 0.75);
	}, [isOpen, isInXR]);

	const { canRescan, rescanRoom } = useRescanRoom();

	return (
		<DraggableBodyAnchor follow={!isOpen} position={position} lockY={true} distance={0.15}>
			<Root pixelSize={0.001} flexDirection="column" gap={10}>
				<Defaults>
					<Container alignItems="center" flexGrow={0} flexShrink={0} gap={4} marginX="auto">
						<Button
							size="icon"
							variant={isOpen ? 'destructive' : 'default'}
							onClick={() => {
								setMode(null);
								setIsOpen(!isOpen);
							}}
						>
							{isOpen ? <X /> : <Menu />}
						</Button>
						{isOpen && (
							<>
								<Selector flexDirection="row" size="small">
									<SelectorItem selected={mode === 'layout'} onClick={() => setMode('layout')}>
										<HouseIcon />
									</SelectorItem>
									<SelectorItem selected={mode === 'furniture'} onClick={() => setMode('furniture')}>
										<Sofa />
									</SelectorItem>
									<SelectorItem selected={mode === 'lighting'} onClick={() => setMode('lighting')}>
										<SunIcon />
									</SelectorItem>
									<SelectorItem selected={mode === 'settings'} onClick={() => setMode('settings')}>
										<SettingsIcon />
									</SelectorItem>
								</Selector>
								{canRescan && (
									<Button size="icon" onClick={() => rescanRoom()}>
										<BoxIcon />
									</Button>
								)}
							</>
						)}
						{isOpen && <UndoControls />}
					</Container>
					<UpdatePrompt />
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
