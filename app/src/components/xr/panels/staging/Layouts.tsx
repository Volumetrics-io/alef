import { useActiveRoomLayoutId, useCreateRoomLayout, useRoomLayout, useRoomLayoutIds, useUpdateRoomLayout } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { Button, colors, Input } from '@react-three/uikit-default';
import { CheckIcon, PencilIcon } from '@react-three/uikit-lucide';
import { useEffect, useState } from 'react';
import { LayoutIcon, layoutIcons } from '../../room/LayoutIcon';
import { Surface } from '../../ui/Surface';

export function Layouts() {
	const layoutIds = useRoomLayoutIds();

	const [editingId, setEditingId] = useState<PrefixedId<'rl'> | null>(null);

	return (
		<Container flexDirection="row" gap={8} alignItems="flex-start">
			<Surface flexDirection="column" flexGrow={1} flexShrink={0}>
				<Text fontSize={14} fontWeight="bold" marginLeft={10} marginBottom={5}>
					Layouts
				</Text>
				{layoutIds.map((layoutId) => (
					<LayoutItem key={layoutId} layoutId={layoutId} onEdit={() => setEditingId(layoutId)} />
				))}
				<NewLayoutButton />
			</Surface>
			{editingId && <EditLayout layoutId={editingId} onClose={() => setEditingId(null)} />}
		</Container>
	);
}

function LayoutItem({ layoutId, onEdit }: { layoutId: PrefixedId<'rl'>; onEdit?: () => void }) {
	const [active, set] = useActiveRoomLayoutId();
	const layoutData = useRoomLayout(layoutId);
	return (
		<Container gap={4} onClick={() => set(layoutId)}>
			<Button onClick={() => set(layoutId)} flexGrow={1} gap={4} backgroundColor={active === layoutId ? colors.primary : colors.muted}>
				<LayoutIcon icon={layoutData?.icon ?? 'livingroom'} color={active === layoutId ? colors.primaryForeground : colors.mutedForeground} />
				<Text marginRight="auto" color={active === layoutId ? colors.primaryForeground : colors.mutedForeground}>
					{layoutData?.name ?? 'Unnamed layout'}
				</Text>
				{active === layoutId ? <CheckIcon /> : <Container width={24} height={24} />}
			</Button>
			{onEdit && (
				<Button onClick={onEdit} flexShrink={0} backgroundColor={colors.muted}>
					<PencilIcon color={colors.mutedForeground} />
				</Button>
			)}
		</Container>
	);
}

function NewLayoutButton() {
	const create = useCreateRoomLayout();
	return (
		<Button onClick={() => create()}>
			<Text>New Layout</Text>
		</Button>
	);
}

function EditLayout({ layoutId, onClose }: { layoutId: PrefixedId<'rl'>; onClose: () => void }) {
	const layoutData = useRoomLayout(layoutId);

	const [editingName, setEditingName] = useState(layoutData?.name ?? '');
	const [editingIcon, setEditingIcon] = useState(layoutData?.icon ?? 'livingroom');

	useEffect(() => {
		setEditingName(layoutData?.name ?? '');
		setEditingIcon(layoutData?.icon ?? 'livingroom');
	}, [layoutData]);

	const updateLayout = useUpdateRoomLayout();
	const save = () => {
		updateLayout({ id: layoutId, name: editingName, icon: editingIcon });
		onClose();
	};

	return (
		<Surface padding={10} flexDirection="column" gap={4} flexGrow={1} flexShrink={0} flexBasis={0}>
			<Text fontSize={14} fontWeight="bold" marginBottom={5}>
				Edit Layout
			</Text>
			<Input value={editingName} onValueChange={(v) => setEditingName(v)} />
			<Container flexDirection="row" gap={4} alignItems="center">
				{layoutIcons.map((icon) => (
					<Button key={icon} onClick={() => setEditingIcon(icon)} backgroundColor={editingIcon === icon ? colors.accent : undefined}>
						<LayoutIcon icon={icon} color={colors.foreground} />
					</Button>
				))}
			</Container>
			<Container flexDirection="row" gap={4} width="100%" justifyContent="flex-end">
				<Button onClick={onClose} backgroundColor={colors.muted}>
					<Text color={colors.mutedForeground}>Close</Text>
				</Button>
				<Button onClick={save}>
					<Text>Save</Text>
				</Button>
			</Container>
		</Surface>
	);
}
