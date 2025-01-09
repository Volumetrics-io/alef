import { useMe } from '@/services/publicApi/userHooks';
import { Box, Heading } from '@alef/sys';
import { Link } from '@verdant-web/react-router';

const HomePage = () => {
	const { data: session } = useMe();
	return (
		<Box stacked>
			<Heading level={1}>Home</Heading>
			<Link to="/login">Login</Link>
			{session && <div>Hi, {session.name}</div>}
		</Box>
	);
};

export default HomePage;
