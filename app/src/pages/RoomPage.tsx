import { MainScene } from '@/components/xr/MainScene';
import { PropertySocketProvider } from '@/services/publicApi/PropertySocketProvider';
import { RoomStoreProvider } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { useParams } from '@verdant-web/react-router';

const RoomPage = () => {
	const { propertyId, roomId } = useParams<{ propertyId: PrefixedId<'p'>; roomId: PrefixedId<'r'> }>();
	return (
		<PropertySocketProvider propertyId={propertyId}>
			<RoomStoreProvider roomId={roomId}>
				<MainScene />
			</RoomStoreProvider>
		</PropertySocketProvider>
	);
};

export default RoomPage;
