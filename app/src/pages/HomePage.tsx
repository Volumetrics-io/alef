import { publicApiClient } from '@/services/publicApi';
import { Box, Heading } from '@alef/sys';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@verdant-web/react-router';

const HomePage = () => {
	const {
		data: { session },
	} = useSuspenseQuery({
		queryKey: ['me'],
		queryFn: async () => {
			const response = await publicApiClient.auth.session.$get();
			return response.json();
		},
	});

	return (
		<Box stacked>
			<Heading level={1}>Home</Heading>
			<Link to="/login">Login</Link>
			{session && <div>Hi, {session.name}</div>}
		</Box>
	);
};

export default HomePage;
