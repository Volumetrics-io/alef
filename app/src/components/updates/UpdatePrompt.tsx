import { useUpdateApp } from '@/services/updateState.js';
import { Box, BoxProps, Button, Icon, Text } from '@alef/sys';

export interface UpdatePromptProps extends BoxProps {}

const TEST = false;

export function UpdatePrompt(props: UpdatePromptProps) {
	const { update, updateAvailable, updating } = useUpdateApp();

	if (!updateAvailable && !TEST) {
		return null;
	}

	return (
		<Box gapped align="center" p="squeeze" {...props}>
			<Icon name="upload" />
			<Text>App update available!</Text>
			<Button loading={updating} color="default" onClick={() => update()}>
				Get the latest
			</Button>
		</Box>
	);
}
