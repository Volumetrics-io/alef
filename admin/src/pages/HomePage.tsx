import { publicApiClient } from '@/services/publicApi.js';
import { Box, Heading } from '@alef/sys';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@verdant-web/react-router';

const HomePage = () => {
	const { data: session } = useSuspenseQuery({
		queryKey: ['me'],
		queryFn: async () => {
			const response = await publicApiClient.users.me.$get();
			return response.json();
		},
	});

	return (
		<Box stacked>
			<Heading level={1}>Alef Admin</Heading>
			{session && <div>Hi, {session.name}</div>}
			<Link to="/users">Users</Link>
			<Link to="/furniture">Furniture</Link>
		</Box>
	);
};

export default HomePage;
