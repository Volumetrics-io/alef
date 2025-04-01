import { useMe } from '@/services/publicApi/userHooks';
import { Box, Button, Icon, Logo, NavBarProps, Popover, NavBar as SysNavBar } from '@alef/sys';
import { Link } from '@verdant-web/react-router';
import { forwardRef } from 'react';
import { LogoutButton } from '../auth/LogoutButton';
import { UpdatePrompt } from '../updates/UpdatePrompt';
import cls from './NavBar.module.css';

export const NavBar = forwardRef<HTMLDivElement, NavBarProps>(function NavBar(props, ref) {
	const { data: session } = useMe();

	return (
		<SysNavBar {...props} background="paper" ref={ref}>
			<SysNavBar.Start className={cls.navbar}>
				{session ? (
					<Popover>
						<Popover.Trigger asChild>
							<Button color="ghost">
								<Icon name="menu" />
							</Button>
						</Popover.Trigger>
						<Popover.Content>
							<Box stacked gapped p>
								<LogoutButton />
								<Link to="https://alef.io/tos">Terms of Service</Link>
								<Link to="https://alef.io/privacy">Privacy Policy</Link>
							</Box>
						</Popover.Content>
					</Popover>
				) : (
					<Button asChild color="suggested">
						<Link to="/login">Login</Link>
					</Button>
				)}
				<Link className={cls.logo} to="/">
					<Logo style={{ width: 40, height: 'auto' }} />
				</Link>
				<UpdatePrompt />
			</SysNavBar.Start>
		</SysNavBar>
	);
});
