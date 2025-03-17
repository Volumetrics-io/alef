import { useEditorStageMode, usePanelState } from '@/stores/editorStore';
import { Container, Root } from '@react-three/uikit';
import { Defaults } from '../ui/Defaults';
import { useXR } from '@react-three/xr';
import { Suspense, useMemo } from 'react';
import { Vector3 } from 'three';
import { DraggableBodyAnchor } from '../anchors/DraggableBodyAnchor';
import { DragController } from '../controls/Draggable';
import { colors } from '../ui/theme';
import { FurniturePanel } from './staging/furniture/FurniturePanel';
import { Layouts } from './staging/Layouts';
import { Lighting } from './staging/Lighting';
import { SettingsPanel } from './staging/SettingsPanel';
import { UpdatePrompt } from './UpdatePrompt';
import { Navigation } from './navigation';
import { UndoControls } from './staging/common/UndoControls';
import { SelectedFurnitureWidget } from './staging/furniture/SelectedFurniturUI';
export function StagerPanel() {
	const [panelState] = usePanelState();
	const [mode] = useEditorStageMode();
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
			<Root pixelSize={0.001} alignItems={panelState === 'hidden' ? 'center' : undefined} flexDirection="column" gap={10}>
				<Defaults>
					{panelState === 'hidden' && mode === 'furniture' && <SelectedFurnitureWidget />}
					<Container flexDirection="row" justifyContent="space-between">
						<Navigation />
						{panelState === 'open' && (
							<Container flexGrow={0} flexShrink={0} gap={10}>
								<UndoControls />
							</Container>
						)}
					</Container>
					<UpdatePrompt />
					{panelState === 'open' && (
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
