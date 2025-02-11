import { Main, Text } from '@alef/sys';

import { NavBar } from '@/components/NavBar';
// import SunLight from '@/components/xr/lighting/SunLight.tsx';

import { PropertySelect } from '@/components/properties/PropertySelect';
import { HeadsetLogin } from '@/components/xr/auth/HeadsetLoginScene';
import { isHeadset } from '@/services/os';
import { useAllProperties } from '@/services/publicApi/propertyHooks';
import { useMe } from '@/services/publicApi/userHooks';
import { useNavigate } from '@verdant-web/react-router';
import { useEffect } from 'react';

const HomePage = () => {
	const { data: session } = useMe();
	const navigate = useNavigate();
	const incompleteProfile = session && !session.emailVerifiedAt;
	useEffect(() => {
		// don't bother people on headsets with this
		if (!isHeadset && incompleteProfile) {
			navigate('/complete-signup');
		}
	}, [incompleteProfile, navigate]);

	if (isHeadset) {
		// show in-XR device pairing experience for non-logged in headset
		if (!session) {
			return <HeadsetLogin />;
		}
		// logged in headset -- redirect to main experience
		return <PropertyRedirect />;
	}

	// not logged in -- XR devices show in-headset login flow,
	// non-XR redirect to login page.
	if (!session) {
		return <LoginRedirect />;
	}

	return (
		<>
			<NavBar />
			<Main full>
				<PropertySelect onValueChange={(id) => navigate(`/properties/${id}`)} />
				<Text>Select a property to view it</Text>
			</Main>
		</>
	);
};

export default HomePage;

function PropertyRedirect() {
	const navigate = useNavigate();
	// multiple properties not yet supported. select the first one.
	const { data: properties } = useAllProperties();
	const propertyId = properties?.[0]?.id;
	useEffect(() => {
		if (propertyId) {
			navigate(`/properties/${propertyId}`);
		}
	}, [propertyId, navigate]);
	return null;
}

function LoginRedirect() {
	const navigate = useNavigate();
	useEffect(() => {
		navigate('/login');
	}, [navigate]);
	return null;
}
