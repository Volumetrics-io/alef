import { useStageStore } from '@/stores/stageStore';
import { Container, Root } from '@react-three/uikit';
import { colors, Toggle } from '@react-three/uikit-default';
import { LampDesk, Menu, Sofa, X } from '@react-three/uikit-lucide';
import { useState } from 'react';
import { DraggableBodyAnchor } from '../anchors/DraggableBodyAnchor';
import { DragController } from '../controls/Draggable';
import { Furniture } from './staging/Furniture';
import { Lighting } from './staging/Lighting';

export function StagerPanel({ onToggle, children }: { onToggle?: () => void; children?: React.ReactNode }) {
	const { mode, setMode } = useStageStore();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<DraggableBodyAnchor follow={!isOpen} position={[0, isOpen ? -0.1 : -0.3, isOpen ? 0.8 : 0.5]} lockY={true} distance={0.15}>
			<Root pixelSize={0.001} flexDirection="column" gap={10}>
				<Container
					backgroundColor={colors.background}
					borderColor={colors.border}
					borderWidth={1}
					borderRadius={10}
					padding={5}
					flexGrow={0}
					flexShrink={0}
					marginX="auto"
					flexDirection="row"
					gap={5}
				>
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
						<Toggle onClick={() => setMode('furniture')}>
							<Sofa color={colors.primary} />
						</Toggle>
						<Toggle onClick={() => setMode('lighting')}>
							<LampDesk color={colors.primary} />
						</Toggle>
					</Container>
				</Container>
				{isOpen && (
					<>
						{mode === 'lighting' && <Lighting />}
						{mode === 'furniture' && <Furniture />}
						{mode !== null && (
							<DragController>
								<Container flexDirection="row" width="50%" gap={10} alignItems="center">
									<Container
										backgroundColor={colors.background}
										height={15}
										borderRadius={10}
										borderColor={colors.border}
										borderWidth={0.5}
										flexGrow={1}
										marginRight={18}
									></Container>
								</Container>
							</DragController>
						)}
					</>
				)}
			</Root>
		</DraggableBodyAnchor>
	);
}
