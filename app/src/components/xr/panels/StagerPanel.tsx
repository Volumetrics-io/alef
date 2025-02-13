import { useRescanRoom } from '@/hooks/useRescanRoom';
import { StageMode, useStageStore } from '@/stores/stageStore';
import { Container, Root } from '@react-three/uikit';
import { Button, colors, Toggle } from '@react-three/uikit-default';
import { ArrowLeftIcon, ArrowRightIcon, BoxIcon, HouseIcon, LampDesk, Menu, Sofa, X } from '@react-three/uikit-lucide';
import { Suspense, useState } from 'react';
import { DraggableBodyAnchor } from '../anchors/DraggableBodyAnchor';
import { DragController } from '../controls/Draggable';
import { Surface } from '../ui/Surface';
import { Furniture } from './staging/Furniture';
import { Layouts } from './staging/Layouts';
import { Lighting } from './staging/Lighting';

export function StagerPanel({ onToggle }: { onToggle?: () => void }) {
	const { mode, setMode } = useStageStore();
	const [isOpen, setIsOpen] = useState(false);

	const modes: StageMode[] = ['layout', 'furniture', 'lighting'];

	const back = () => {
		setMode(modes[modes.indexOf(mode) - 1]);
	};

	const forward = () => {
		setMode(modes[modes.indexOf(mode) + 1]);
	};

	const { canRescan, rescanRoom } = useRescanRoom();

	return (
		<DraggableBodyAnchor follow={!isOpen} position={[0, isOpen ? 0.01 : 0.3, isOpen ? 0.8 : 0.5]} lockY={true} distance={0.15}>
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
						<Toggle onClick={() => setMode('layout')}>
							<HouseIcon color={colors.primary} />
						</Toggle>
						<Toggle onClick={() => setMode('furniture')}>
							<Sofa color={colors.primary} />
						</Toggle>
						<Toggle onClick={() => setMode('lighting')}>
							<LampDesk color={colors.primary} />
						</Toggle>
						{canRescan && (
							<Toggle onClick={() => rescanRoom()}>
								<BoxIcon color={colors.primary} />
							</Toggle>
						)}
					</Container>
				</Surface>
				{isOpen && (
					<>
						{mode === 'lighting' && <Lighting />}
						{mode === 'furniture' && (
							<Suspense>
								<Furniture />
							</Suspense>
						)}
						{mode === 'layout' && <Layouts />}
						{mode !== null && (
							<DragController>
								<Container flexDirection="row" width="100%" gap={10} alignItems="center">
									<Button backgroundColor={colors.background} onClick={back}>
										<ArrowLeftIcon color={colors.primary} />
									</Button>
									<Container backgroundColor={colors.background} height={15} borderRadius={10} borderColor={colors.border} borderWidth={0.5} flexGrow={1} />
									<Button backgroundColor={colors.background} onClick={forward}>
										<ArrowRightIcon color={colors.primary} />
									</Button>
								</Container>
							</DragController>
						)}
					</>
				)}
			</Root>
		</DraggableBodyAnchor>
	);
}
