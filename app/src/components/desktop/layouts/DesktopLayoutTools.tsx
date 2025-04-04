import { useActiveRoomLayoutId } from '@/stores/propertyStore';
import { Box } from '@alef/sys';
import { DesktopAddLayout } from './DesktopAddLayout';
import { DesktopDeleteLayout } from './DesktopDeleteLayout';
import { DesktopLayoutEditor } from './DesktopLayoutEditor';

export function DesktopLayoutTools({ className }: { className?: string }) {
	const [activeLayoutId] = useActiveRoomLayoutId();

	return (
		<Box full="width" gapped className={className}>
			<DesktopAddLayout />
			{activeLayoutId && <DesktopLayoutEditor />}
			{activeLayoutId && <DesktopDeleteLayout />}
		</Box>
	);
}
