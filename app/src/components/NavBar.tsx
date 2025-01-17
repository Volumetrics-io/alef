import { useMe } from '@/services/publicApi/userHooks';
import { Button, Logo, NavBarProps, NavBar as SysNavBar, Text } from '@alef/sys';
import { Link } from '@verdant-web/react-router';
import { forwardRef } from 'react';
import { LogoutButton } from './auth/LogoutButton';

export const NavBar = forwardRef<HTMLDivElement, NavBarProps>(function NavBar(props, ref) {
	const { data: session } = useMe();

	return (
		<SysNavBar {...props} ref={ref}>
			<SysNavBar.Start>
				<Link to="/">
					<Logo />
				</Link>
			</SysNavBar.Start>
			<SysNavBar.End gapped align="center">
				{session ? (
					<>
						<Text>Hi, {session.friendlyName}</Text>
						<LogoutButton />
					</>
				) : (
					<Button asChild color="suggested">
						<Link to="/login">Login</Link>
					</Button>
				)}
			</SysNavBar.End>
		</SysNavBar>
	);
});
