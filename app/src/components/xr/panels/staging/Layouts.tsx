import { useActiveRoomLayoutId, useCreateRoomLayout, useRoomLayouts } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { CheckIcon } from '@react-three/uikit-lucide';
import { Surface } from '../../ui/Surface';

export function Layouts() {
	const layoutIds = useRoomLayouts();

	return (
		<Surface flexDirection="column">
			<Text fontSize={14} fontWeight="bold" marginLeft={10} marginBottom={5}>
				Layouts
			</Text>
			{layoutIds.map((layoutId) => (
				<LayoutItem key={layoutId} layoutId={layoutId} />
			))}
			<NewLayoutButton />
		</Surface>
	);
}

function LayoutItem({ layoutId }: { layoutId: PrefixedId<'rl'> }) {
	const [active, set] = useActiveRoomLayoutId();
	return (
		<Surface padding={10} onClick={() => set(layoutId)} backgroundColor={active === layoutId ? colors.accent : undefined}>
			{active === layoutId ? <CheckIcon /> : <Container width={24} height={24} />}
			<Text>{layoutId}</Text>
		</Surface>
	);
}

function NewLayoutButton() {
	const create = useCreateRoomLayout();
	return (
		<Button onClick={create}>
			<Text>New Layout</Text>
		</Button>
	);
}
