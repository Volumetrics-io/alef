import { PropertyRoomStoreProvider } from '@/components/core/PropertyRoomStoreProvider';
import { DesktopUI } from '@/components/desktop/DesktopUI';
import { NavBar } from '@/components/NavBar';
import { RoomRenderer } from '@/components/xr/room/RoomRenderer';
import { SceneWrapper } from '@/components/xr/SceneWrapper';
import { Box } from '@alef/sys';

const DesktopModePage = () => {
	return (
		<Box stacked stretched layout="stretch start" style={{ maxHeight: '100vh', overflow: 'hidden' }}>
			<NavBar />
			<PropertyRoomStoreProvider>
				<DesktopUI>
					<SceneWrapper full>
						<RoomRenderer />
					</SceneWrapper>
				</DesktopUI>
			</PropertyRoomStoreProvider>
		</Box>
	);
};

export default DesktopModePage;
