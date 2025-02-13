import { useMe } from '@/services/publicApi/userHooks';
import { Button, Icon, Logo, NavBarProps, NavBar as SysNavBar } from '@alef/sys';
import { Link, useMatchingRoutes } from '@verdant-web/react-router';
import { forwardRef } from 'react';
import { LogoutButton } from './auth/LogoutButton';

export const NavBar = forwardRef<HTMLDivElement, NavBarProps>(function NavBar(props, ref) {
	const { data: session } = useMe();
	const routes = useMatchingRoutes();
	const isProperties = routes.some((r) => r.path === '/properties');
	const isDevices = routes.some((r) => r.path === '/devices');

	return (
		<SysNavBar {...props} background="paper" ref={ref}>
			<SysNavBar.Start>
				<Link to="/">
					<Logo />
				</Link>
			</SysNavBar.Start>
			<SysNavBar.End gapped align="center" wrap>
				{session ? (
					<>
						<Button asChild color={isProperties ? 'suggested' : 'ghost'}>
							<Link to="/properties">
								<Icon name="house" />
								<Button.ResponsiveLabel>Properties</Button.ResponsiveLabel>
							</Link>
						</Button>
						<Button asChild color={isDevices ? 'suggested' : 'ghost'}>
							<Link to="/devices">
								<Icon name="glasses" />
								<Button.ResponsiveLabel>Headsets</Button.ResponsiveLabel>
							</Link>
						</Button>
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
