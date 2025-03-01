import { Billboard } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';
import { Container, Root } from '@react-three/uikit';
import { colors } from './ui/theme';
import { X } from '@react-three/uikit-lucide';
import { useState } from 'react';
import { DragController, Draggable } from './controls/Draggable.tsx';

type GroupProps = ThreeElements['group'];

export function Panel({ open = true, onToggle, children, ...props }: { open?: boolean; onToggle: (isOpen: boolean) => void; children: React.ReactNode } & GroupProps) {
	const [isDragging, setIsDragging] = useState(true);

	const handleToggle = () => {
		onToggle(!open);
	};

	return (
		<Draggable>
			<group {...props}>
				<Billboard follow={isDragging}>
					<Root
						pixelSize={0.001}
						flexDirection="column"
						gap={10}
						onPointerUp={() => setIsDragging(false)}
						onPointerLeave={() => setIsDragging(false)}
						onPointerDown={() => setIsDragging(true)}
					>
						{open && children}
						<DragController>
							<Container flexDirection="row" width="50%" gap={10} alignItems="center">
								<Container backgroundColor={colors.surface} borderRadius={15} borderColor={colors.border} borderWidth={0.5} padding={5} onClick={handleToggle}>
									<X color={colors.ink} width={12} height={12} />
								</Container>
								<Container
									backgroundColor={colors.surface}
									height={15}
									borderRadius={10}
									borderColor={colors.border}
									borderWidth={0.5}
									flexGrow={1}
									marginRight={18}
								></Container>
							</Container>
						</DragController>
					</Root>
				</Billboard>
			</group>
		</Draggable>
	);
}
