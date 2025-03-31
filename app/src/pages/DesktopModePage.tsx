import { PropertyRoomStoreProvider } from '@/components/core/PropertyRoomStoreProvider';
import { DesktopUI } from '@/components/desktop/DesktopUI';
import { RoomRenderer } from '@/components/xr/room/RoomRenderer';
import { SceneWrapper } from '@/components/xr/SceneWrapper';
import { Box } from '@alef/sys';

const DesktopModePage = () => {
	return (
		<Box stacked stretched layout="stretch start" style={{ maxHeight: '100dvh', overflow: 'hidden' }}>
			<PropertyRoomStoreProvider>
				<DesktopUI>
					<SceneWrapper full disableEnterXR>
						<RoomRenderer />
					</SceneWrapper>
				</DesktopUI>
			</PropertyRoomStoreProvider>
		</Box>
	);
};

export default DesktopModePage;
