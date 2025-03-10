import { useActiveRoomLayoutId, useRoomLayout, useRoomLayoutIds } from '@/stores/roomStore';
import { PrefixedId, RoomType } from '@alef/common';
import { Box, Heading, ScrollArea, Sidebar } from '@alef/sys';
import { Suspense } from 'react';
import { DesktopLayoutEditor } from './DesktopLayoutEditor';
import { DesktopLayoutIcon } from './DesktopLayoutIcon';

export interface DesktopLayoutsPickerProps {
	className?: string;
}

export function DesktopLayoutsPicker({ className }: DesktopLayoutsPickerProps) {
	return (
		<Box stacked>
			<Heading level={3}>Layouts</Heading>
			<ScrollArea>
				<LayoutSelector />
			</ScrollArea>
			<DesktopLayoutEditor />
		</Box>
	);
}

function LayoutSelector() {
	const layoutIds = useRoomLayoutIds();
	return (
		<Sidebar>
			{layoutIds.map((layoutId) => (
				<Suspense key={layoutId} fallback={<Sidebar.Item />}>
					<LayoutItem layoutId={layoutId} />
				</Suspense>
			))}
		</Sidebar>
	);
}

function LayoutItem({ layoutId }: { layoutId: PrefixedId<'rl'> }) {
	const layoutData = useRoomLayout(layoutId);
	const [active, set] = useActiveRoomLayoutId();

	return (
		<Sidebar.Item onClick={() => set(layoutId)} data-active={active === layoutId}>
			<DesktopLayoutIcon type={(layoutData?.type as RoomType) ?? 'living-room'} />
			<Sidebar.Label>{layoutData?.name ?? '(deleted)'}</Sidebar.Label>
		</Sidebar.Item>
	);
}
