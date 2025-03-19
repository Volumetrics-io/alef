import { useNeedsRoomScan, useRescanRoom } from '@/hooks/useRescanRoom';
import { Text } from '@react-three/uikit';
import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';
import { Surface } from '../ui/Surface';
import { colors } from '../ui/theme';

export function RescanPrompt() {
	const needsRescan = useNeedsRoomScan();
	const { rescanRoom } = useRescanRoom();

	if (!needsRescan) {
		return null;
	}

	return (
		<Surface backgroundColor={colors.attentionSurface} width={300} flexDirection="column" gap={10} padding={10}>
			<Heading level={2}>Room scan needed!</Heading>
			<Text>It looks like your headset hasn't scanned this room. Alef needs room scans to place furniture.</Text>
			<Button backgroundColor={colors.attentionPaper} onClick={rescanRoom}>
				<Text color={colors.attentionInk}>Scan now</Text>
			</Button>
		</Surface>
	);
}
