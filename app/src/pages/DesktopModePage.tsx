import { PropertyRoomStoreProvider } from '@/components/core/PropertyRoomStoreProvider';
import { DesktopUI } from '@/components/desktop/DesktopUI';
import { RoomRenderer } from '@/components/xr/room/RoomRenderer';
import { SceneWrapper } from '@/components/xr/SceneWrapper';
import { Box } from '@alef/sys';

const DesktopModePage = () => {
	return (
		<Box full layout="stretch stretch">
			<PropertyRoomStoreProvider>
				<DesktopUI />
				<SceneWrapper>
					<RoomRenderer />
				</SceneWrapper>
			</PropertyRoomStoreProvider>
		</Box>
	);
};

export default DesktopModePage;
