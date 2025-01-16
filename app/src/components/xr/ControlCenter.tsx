import { Container, FontFamilyProvider, Root } from '@react-three/uikit';
import { Toggle } from '@react-three/uikit-default';
import { Menu, X } from '@react-three/uikit-lucide';
import { useState } from 'react';

import { colors } from '@react-three/uikit-default';
import { BodyAnchor } from './anchors/BodyAnchor.js';

export function ControlCenter({ onToggle, children }: { onToggle?: () => void; children?: React.ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<BodyAnchor follow={true} position={[0, isOpen ? 0.1 : 0.3, isOpen ? -0.8 : -1]} lockY={true} distance={0.15}>
			<Root pixelSize={0.001} flexDirection="column" gap={10}>
				{/* <FontFamilyProvider
					jetbrainsmono={{
						normal: 'https://cdn.volu.dev/fonts/fixed-jetbrainsmono.json',
					}}
				> */}
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
								setIsOpen(!isOpen);
								onToggle?.();
							}}
						>
							{isOpen ? <X color={colors.primary} /> : <Menu color={colors.primary} />}
						</Toggle>
						<Container display={isOpen ? 'flex' : 'none'} flexDirection="row" alignItems={'center'} gap={10}>
							{children}
						</Container>
					</Container>
				{/* </FontFamilyProvider> */}
			</Root>
		</BodyAnchor>
	);
}
