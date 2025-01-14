import { LogoutButton } from '@/components/auth/LogoutButton';
import { useMe } from '@/services/publicApi/userHooks';
import { Box, Hero, Main, NavBar } from '@alef/sys';
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
		<Main>
			<NavBar>
				<NavBar.Start>Alef</NavBar.Start>
				<NavBar.End>{session ? <LogoutButton /> : <Link to="/login">Login</Link>}</NavBar.End>
			</NavBar>
			<Hero>
				<Hero.Title>Home</Hero.Title>
			</Hero>
			<Box constrained>{session && <div>Hi, {session.name}</div>}</Box>
		</Main>
	);
};

export default HomePage;
