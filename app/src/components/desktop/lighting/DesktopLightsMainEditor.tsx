import { Box, Heading, Text } from '@alef/sys';
import { DesktopGlobalLightEditor } from './DesktopGlobalLightEditor';

export function DesktopLightsMainEditor() {
	return (
		<Box stacked gapped full p="small">
			<DesktopGlobalLightEditor />
			<Box stacked gapped>
				<Heading level={3}>Room lights</Heading>
				<Text>Tap or click the ceiling to place a new light.</Text>
			</Box>
		</Box>
	);
}
