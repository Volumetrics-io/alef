import { useActiveRoomLayoutId, useCreateRoomLayout, useDeleteRoomLayout, useRoomLayout, useRoomLayoutIds, useUpdateRoomLayout } from '@/stores/roomStore';
import { PrefixedId, RoomType } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { Button, colors, Input } from '@react-three/uikit-default';
import { CheckIcon, PencilIcon } from '@react-three/uikit-lucide';
import { useEffect, useState } from 'react';
import { LayoutIcon } from '../../room/LayoutIcon';
import { RoomTypePicker } from '../../ui/RoomTypePicker';
import { Surface } from '../../ui/Surface';

export function Layouts() {
	const layoutIds = useRoomLayoutIds();

	const [editingId, setEditingId] = useState<PrefixedId<'rl'> | null>(null);

	return (
		<>
		<Surface flexDirection="column" flexWrap="no-wrap" flexGrow={1} height={300} gap={10} padding={10}>
			<Text fontSize={18} color={colors.foreground} textAlign="center" margin={10}>
				Layouts
			</Text>
			<Container flexDirection="column" gap={4} overflow="scroll" paddingRight={6} scrollbarWidth={5} scrollbarBorderRadius={2} scrollbarColor={colors.primary}>
				{layoutIds.map((layoutId) => (
					<LayoutItem key={layoutId} layoutId={layoutId} onEdit={() => setEditingId(layoutId)} />
				))}
			</Container>
			<NewLayoutButton onNew={(id) => setEditingId(id)} />
		</Surface>
		{editingId && <EditLayout layoutId={editingId} onClose={() => setEditingId(null)} />}
		</>
	);
}

function LayoutItem({ layoutId, onEdit }: { layoutId: PrefixedId<'rl'>; onEdit?: () => void }) {
	const [active, set] = useActiveRoomLayoutId();
	const layoutData = useRoomLayout(layoutId);
	return (
		<Container flexGrow={1} flexShrink={0} gap={4} onClick={() => set(layoutId)}>
			<Button onClick={() => set(layoutId)} flexGrow={1} gap={4} backgroundColor={active === layoutId ? colors.primary : colors.muted}>
				<LayoutIcon icon={layoutData?.icon ?? layoutData?.type ?? 'living-room'} color={active === layoutId ? colors.primaryForeground : colors.mutedForeground} />
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

function NewLayoutButton({ onNew }: { onNew: (id: PrefixedId<'rl'>) => void }) {
	const create = useCreateRoomLayout();
	return (
		<Button onClick={async () => {
			const id = await create();
			onNew(id);
		}}>
			<Text>New Layout</Text>
		</Button>
	);
}

function EditLayout({ layoutId, onClose }: { layoutId: PrefixedId<'rl'>; onClose: () => void }) {
	const layoutData = useRoomLayout(layoutId);

	const [editingType, setEditingType] = useState<RoomType>(layoutData?.type ?? 'living-room');

	useEffect(() => {
		setEditingType(layoutData?.type ?? 'living-room');
	}, [layoutData]);

	const updateLayout = useUpdateRoomLayout();
	const save = () => {
		updateLayout({ id: layoutId, name: editingType, type: editingType });
		onClose();
	};

	const [confirmRequired, setConfirmRequired] = useState(false);
	const deleteLayout = useDeleteRoomLayout();
	const deleteSelf = () => {
		if (!confirmRequired) {
			setConfirmRequired(true);
			return;
		}

		deleteLayout(layoutId);
		setConfirmRequired(false);
		onClose();
	};

	return (
		<Container positionType="absolute" alignItems="center" justifyContent="center" width="100%" height="100%" padding={10}>
			<Surface padding={10} zIndexOffset={10} flexDirection="column" gap={4} flexGrow={1} flexShrink={0} flexBasis={0}>
				<Text fontSize={18} color={colors.foreground} textAlign="center" marginBottom={5}>
					Choose Layout
				</Text>
			<RoomTypePicker value={[editingType]} onValueChange={(v) => {
				setEditingType(v[0]);
			}} />
			<Container flexDirection="row" gap={4} width="100%" justifyContent="flex-end">
				<Button backgroundColor={colors.destructive} onClick={deleteSelf} marginRight="auto">
					<Text color={colors.destructiveForeground}>{confirmRequired ? 'Confirm' : 'Delete'}</Text>
				</Button>
				<Button onClick={onClose} backgroundColor={colors.muted}>
					<Text color={colors.mutedForeground}>Close</Text>
				</Button>
				<Button onClick={save}>
					<Text>Save</Text>
				</Button>
			</Container>
			</Surface>
		</Container>
	);
}
