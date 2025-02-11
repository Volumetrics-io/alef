import { useProperty } from '@/services/publicApi/propertyHooks';
import { PrefixedId } from '@alef/common';
import { useNavigate, useParams } from '@verdant-web/react-router';
import { useEffect } from 'react';

const PropertyPage = () => {
	const { propertyId } = useParams<{ propertyId: PrefixedId<'p'> }>();
	const { data: property } = useProperty(propertyId);

	// just redirect to the first room
	const firstRoomId = Object.keys(property)[0];

	const navigate = useNavigate();

	useEffect(() => {
		if (firstRoomId) {
			navigate(`/properties/${propertyId}/rooms/${firstRoomId}`);
		}
	}, [firstRoomId, navigate, propertyId]);

	if (!firstRoomId) {
		// the backend should insert a default room
		return <div>No rooms found</div>;
	}

	return null;
};

export default PropertyPage;
