import { Link, Logo, NavBar, Text } from '@alef/sys';
import { LoginButton } from './LoginButton';

export const Navigation = () => {
	return (
		<NavBar background="paper">
			<NavBar.Start>
				<Link to="/">
					<Logo />
				</Link>
				<Link to="/">
					<Text>alef.io</Text>
				</Link>
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
