import { Link, Logo, NavBar, Text } from '@alef/sys';
import { LoginButton } from './LoginButton';

export const Navigation = () => {
	return (
		<NavBar background="paper">
			<NavBar.Start>
				<Logo />
				<Text>alef.io</Text>
			</NavBar.Start>
			<NavBar.End>
				<Link text to="https://blog.alef.io">
					Blog
				</Link>
				<LoginButton />
			</NavBar.End>
		</NavBar>
	);
};
