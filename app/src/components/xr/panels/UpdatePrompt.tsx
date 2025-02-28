import { useUpdateApp } from '@/services/updateState';
import { Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { UploadIcon } from '@react-three/uikit-lucide';
import { Surface } from '../ui/Surface';

const TEST = false;

export function UpdatePrompt() {
	const { update, updateAvailable, updating } = useUpdateApp();

	if (!updateAvailable && !TEST) {
		return null;
	}

	return (
		<Surface backgroundColor={colors.accent} flexDirection="row" alignItems="center" gap={10} padding={5}>
			<UploadIcon color={colors.accentForeground} width={12} height={12} marginLeft={10} />
			<Text color={colors.accentForeground} fontSize={12}>
				App update available!
			</Text>
			<Button disabled={updating} paddingX={10} paddingY={5} onClick={() => update()}>
				<Text fontSize={12}>Get the latest</Text>
			</Button>
		</Surface>
	);
}
