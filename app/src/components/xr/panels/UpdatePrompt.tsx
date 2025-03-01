import { useUpdateApp } from '@/services/updateState';
import { Container, Text } from '@react-three/uikit';
import { UploadIcon } from '@react-three/uikit-lucide';
import { Surface } from '../ui/Surface';
import { Button } from '../ui/Button';
import { colors } from '../ui/theme';


const TEST = false;

export function UpdatePrompt() {
	const { update, updateAvailable, updating } = useUpdateApp();

	if (!updateAvailable && !TEST) {
		return null;
	}

	return (
		<Surface backgroundColor={colors.paper} flexDirection="row" alignItems="center" justifyContent="space-between" gap={10} padding={5}>
			<Container flexDirection="row" alignItems="center" gap={10}>
				<UploadIcon width={12} height={12} marginLeft={10} />
				<Text fontSize={12}>
					App update available!
				</Text>
			</Container>
			<Button disabled={updating} paddingX={10} paddingY={5} onClick={() => update()}>
				<Text fontSize={12}>Get the latest</Text>
			</Button>
		</Surface>
	);
}
