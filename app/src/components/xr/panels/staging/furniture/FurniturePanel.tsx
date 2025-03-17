import { useIsOnline } from '@/hooks/useIsOnline';
import { ErrorBoundary } from '@alef/sys';
import { Container, Text } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { Suspense } from 'react';
import { OfflineFurniturePanel } from './OfflineFurniturePanel';
import { OnlineFurniturePanel } from './OnlineFurniturePanel';
import { FurniturePanelRoot } from './common';

export function FurniturePanel({ visible }: { visible?: boolean }) {
	const isOnline = useIsOnline();

	return (
		<FurniturePanelRoot display={visible ? 'flex' : 'none'}>
			<ErrorBoundary
				fallback={
					<Container width="100%" height="100%" justifyContent="center" alignItems="center">
						<Text color={colors.mutedForeground}>Failed to load furniture</Text>
					</Container>
				}
			>
				<Suspense>{isOnline ? <OnlineFurniturePanel /> : <OfflineFurniturePanel />}</Suspense>
			</ErrorBoundary>
		</FurniturePanelRoot>
	);
}
