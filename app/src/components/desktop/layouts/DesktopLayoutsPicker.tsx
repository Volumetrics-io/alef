import { useActiveRoomLayoutId, useRoomLayout, useRoomLayoutIds } from '@/stores/roomStore';
import { PrefixedId, RoomType } from '@alef/common';
import { Box, Button, Icon, ScrollArea } from '@alef/sys';
import { Suspense } from 'react';
import { DesktopLayoutIcon } from '../common/DesktopLayoutIcon';

export interface DesktopLayoutsPickerProps {
	className?: string;
}

export function DesktopLayoutsPicker({ className }: DesktopLayoutsPickerProps) {
	return (
		<Box stacked gapped className={className}>
			<ScrollArea>
				<LayoutSelector />
			</ScrollArea>
		</Box>
	);
}

function LayoutSelector() {
	const layoutIds = useRoomLayoutIds();
	return (
		<Box gapped stacked p="small">
			{layoutIds.map((layoutId) => (
				<Suspense key={layoutId} fallback={<Button />}>
					<LayoutItem layoutId={layoutId} />
				</Suspense>
			))}
		</Box>
	);
}

function LayoutItem({ layoutId }: { layoutId: PrefixedId<'rl'> }) {
	const layoutData = useRoomLayout(layoutId);
	const [active, set] = useActiveRoomLayoutId();

	return (
		<Box full gapped>
			<Button grow justify="start" onClick={() => set(layoutId)}>
				<DesktopLayoutIcon type={(layoutData?.type as RoomType) ?? 'living-room'} />
				{layoutData?.name ?? '(deleted)'}
				{active === layoutId && <Icon name="check" style={{ marginLeft: 'auto' }} />}
			</Button>
		</Box>
	);
}
