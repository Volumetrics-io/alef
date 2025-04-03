import { PropertyRoomStoreProvider } from '@/components/core/PropertyRoomStoreProvider';
import { DesktopSelectRoomBlocker } from '@/components/desktop/DesktopSelectRoomBlocker';
import { DesktopUI } from '@/components/desktop/DesktopUI';
import { RoomRenderer } from '@/components/xr/room/RoomRenderer';
import { SceneWrapper } from '@/components/xr/SceneWrapper';
import { Box } from '@alef/sys';

const DesktopModePage = () => {
	return (
		<Box stacked stretched layout="stretch start" style={{ maxHeight: '100dvh', overflow: 'hidden' }}>
			<PropertyRoomStoreProvider>
				<DesktopSelectRoomBlocker>
					<DesktopUI>
						<SceneWrapper full disableEnterXR>
							<RoomRenderer />
						</SceneWrapper>
					</DesktopUI>
				</DesktopSelectRoomBlocker>
			</PropertyRoomStoreProvider>
		</Box>
	);
};

export default DesktopModePage;
