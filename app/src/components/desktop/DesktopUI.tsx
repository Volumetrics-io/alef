import { StageMode, useEditorStageMode } from '@/stores/editorStore';
import { Box, Icon, Tabs } from '@alef/sys';

export interface DesktopUIProps {}

export function DesktopUI({}: DesktopUIProps) {
	const [mode, setMode] = useEditorStageMode();
	return (
		<Box>
			<Tabs value={mode || 'layouts'} onValueChange={(m) => setMode(m as StageMode)}>
				<Tabs.List>
					<Tabs.Trigger value="layouts">
						<Icon name="house" />
					</Tabs.Trigger>
					<Tabs.Trigger value="furniture">
						<Icon name="sofa" />
					</Tabs.Trigger>
					<Tabs.Trigger value="lighting">
						<Icon name="lightbulb" />
					</Tabs.Trigger>
				</Tabs.List>
			</Tabs>
			<Tabs.Content value="layouts"></Tabs.Content>
			<Tabs.Content value="furniture"></Tabs.Content>
			<Tabs.Content value="lighting"></Tabs.Content>
		</Box>
	);
}
