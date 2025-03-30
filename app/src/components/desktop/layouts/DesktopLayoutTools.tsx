import { Box } from '@alef/sys';
import { DesktopAddLayout } from './DesktopAddLayout';
import { useActiveRoomLayoutId } from '@/stores/roomStore';
import { DesktopLayoutEditor } from './DesktopLayoutEditor';
import { DesktopDeleteLayout } from './DesktopDeleteLayout';
export function DesktopLayoutTools() {
	const [activeLayoutId] = useActiveRoomLayoutId();

	return (
		<Box full="width" gapped>
			<DesktopAddLayout />
			{activeLayoutId && <DesktopLayoutEditor />}
			{activeLayoutId && <DesktopDeleteLayout />}
		</Box>
	);
}
