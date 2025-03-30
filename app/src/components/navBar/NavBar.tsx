import { useMe } from '@/services/publicApi/userHooks';
import { Button, Text, NavMenu, Icon, Logo, NavBarProps, NavBar as SysNavBar } from '@alef/sys';
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
						<NavMenu.Trigger>
							<Button asChild color="ghost">
								<NavMenu.ItemIcon>
									<Icon name="menu" />
								</NavMenu.ItemIcon>
							</Button>
						</NavMenu.Trigger>
						<NavMenu.Content>
							<NavMenu.ItemLink to="/properties">
								<NavMenu.ItemIcon>
									<Icon name="house" />
								</NavMenu.ItemIcon>
								<Text>Properties</Text>
							</NavMenu.ItemLink>
							<NavMenu.ItemLink to="/devices">
								<NavMenu.ItemIcon>
									<Icon name="glasses" />
								</NavMenu.ItemIcon>
								<Text>Headsets</Text>
							</NavMenu.ItemLink>
							<NavMenu.Item>
								<LogoutButton />
							</NavMenu.Item>
						</NavMenu.Content>
					</NavMenu>
				)}
				<Link className={cls.logo} to="/">
					<Logo style={{ width: 40, height: 'auto' }} />
				</Link>
				<UpdatePrompt />
			</SysNavBar.Start>
			{!session && (
				<SysNavBar.End gapped align="center" wrap>
					<Button asChild color="suggested">
						<Link to="/login">Login</Link>
					</Button>
				</SysNavBar.End>
			)}
		</SysNavBar>
	);
});
