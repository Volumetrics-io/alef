import { forwardRef } from 'react';
import { Logo } from '@alef/sys';
import { Link } from '@verdant-web/react-router';
import { NavBar as SysNavBar, NavBarProps } from '@alef/sys';

export const NavBar = forwardRef<HTMLDivElement, NavBarProps>(function NavBar(props, ref) {
	return (
		<SysNavBar {...props} ref={ref}>
			<SysNavBar.Start>
				<Link to="/">
					<Logo />
				</Link>
			</SysNavBar.Start>
			<SysNavBar.End>
				<Link to="/login">Login</Link>
			</SysNavBar.End>
		</SysNavBar>
	);
});
