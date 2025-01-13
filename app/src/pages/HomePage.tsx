import { useMe } from '@/services/publicApi/userHooks';
import { Box, Heading } from '@alef/sys';
import { Link, useNavigate } from '@verdant-web/react-router';
import { useEffect } from 'react';

const HomePage = () => {
	const { data: session } = useMe();
	const navigate = useNavigate();
	useEffect(() => {
		if (!session?.emailVerifiedAt) {
			navigate('/complete-signup');
		}
	}, [session?.emailVerifiedAt, navigate]);

	return (
		<Box stacked>
			<Heading level={1}>Home</Heading>
			<Link to="/login">Login</Link>
			{session && <div>Hi, {session.name}</div>}
		</Box>
	);
};

export default HomePage;
