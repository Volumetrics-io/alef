import { useMe } from '@/services/publicApi/userHooks';
import { Button, Icon, Logo, NavBarProps, NavMenu, NavBar as SysNavBar, Text } from '@alef/sys';
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
				{session && (
					<NavMenu>
						<NavMenu.Trigger asChild>
							<Button color="ghost">
								<NavMenu.ItemIcon>
									<Icon name="menu" />
								</NavMenu.ItemIcon>
							</Button>
						</NavMenu.Trigger>
						<NavMenu.Content>
							<NavMenu.ItemLink to="/">
								<NavMenu.ItemIcon>
									<Icon name="pencil-ruler" />
								</NavMenu.ItemIcon>
								<Text>Editor</Text>
							</NavMenu.ItemLink>
							<NavMenu.ItemLink to="/devices">
								<NavMenu.ItemIcon>
									<Icon name="glasses" />
								</NavMenu.ItemIcon>
								<Text>Device management</Text>
							</NavMenu.ItemLink>

							<NavMenu.ContentEnd>
								<LogoutButton />
								<Link to="https://alef.io/tos">Terms of Service</Link>
								<Link to="https://alef.io/privacy">Privacy Policy</Link>
							</NavMenu.ContentEnd>
						</NavMenu.Content>
					</NavMenu>
				)}
				<Link className={cls.logo} to="/">
					<Logo style={{ width: 40, height: 'auto' }} />
				</Link>
				<UpdatePrompt />
			</SysNavBar.Start>
			<SysNavBar.End gapped align="center" wrap>
				{!session && (
					<Button asChild color="suggested">
						<Link to="/login">Login</Link>
					</Button>
				)}
			</SysNavBar.End>
		</SysNavBar>
	);
});
