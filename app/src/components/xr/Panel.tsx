import { GroupProps } from '@react-three/fiber';
import { Container, Root } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { X } from '@react-three/uikit-lucide';
import { useState } from 'react';
import { Billboard } from './Billboard.js';
import { UIDragController, Draggable } from './controls/Draggable.tsx';

export function Panel({ open = true, onToggle, children, ...props }: { open?: boolean; onToggle: (isOpen: boolean) => void; children: React.ReactNode } & GroupProps) {
	const [isDragging, setIsDragging] = useState(true);

	const handleToggle = () => {
		onToggle(!open);
	};

	return (
		<Draggable>
			<group {...props}>
				<Billboard enabled={isDragging}>
					<Root
						pixelSize={0.001}
						flexDirection="column"
						gap={10}
						onPointerUp={() => setIsDragging(false)}
						onPointerLeave={() => setIsDragging(false)}
						onPointerDown={() => setIsDragging(true)}
					>
						{open && children}
						<UIDragController>
							<Container flexDirection="row" width="50%" gap={10} alignItems="center">
								<Container backgroundColor={colors.background} borderRadius={15} borderColor={colors.border} borderWidth={0.5} padding={5} onClick={handleToggle}>
									<X color={colors.primary} width={12} height={12} />
								</Container>
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
						</UIDragController>
					</Root>
				</Billboard>
			</group>
		</Draggable>
	);
}
