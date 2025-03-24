import { EmailSigninForm } from '@/components/auth/EmailSigninForm';
import { EmailSignupForm } from '@/components/auth/EmailSignupForm';
import { OAuthSigninButton } from '@/components/auth/OAuthSigninButton';
import { Box, Frame, Heading, Icon, Logo, Tabs } from '@alef/sys';
import { useSearchParams } from '@verdant-web/react-router';

const LoginPage = () => {
	const [searchParams, updateSearch] = useSearchParams();
	const returnTo = searchParams.get('returnTo') ?? undefined;
	const tab = searchParams.get('tab') ?? 'login';

	return (
		<Box full align="center" justify="center" p>
			<Frame gapped stacked p constrained>
				<Box full align="center" gapped>
					<Logo width={80} height={80} style={{ alignSelf: 'flex-start' }} />
					<Heading level={1} style={{ fontSize: '2rem' }}>
						alef
					</Heading>
				</Box>

				<Tabs
					value={tab}
					onValueChange={(value) =>
						updateSearch((s) => {
							s.set('tab', value);
							return s;
						})
					}
				>
					<Box align="stretch" stacked gapped>
						<Box justify="center">
							<Tabs.List>
								<Tabs.Trigger value="login">
									<Box gapped>
										<Icon name="hand" />
										Log&nbsp;in
									</Box>
								</Tabs.Trigger>
								<Tabs.Trigger value="signup">
									<Box gapped>
										<Icon name="square-check-big" />
										Sign&nbsp;up
									</Box>
								</Tabs.Trigger>
							</Tabs.List>
						</Box>
						<Tabs.Content value="login">
							<Box stacked gapped>
								<Heading level={1}>Log in</Heading>
								<OAuthSigninButton provider="google" returnTo={returnTo} style={{ margin: '0 auto' }}>
									Log in with Google
								</OAuthSigninButton>
								<Or />
								<EmailSigninForm returnTo={returnTo} />
							</Box>
						</Tabs.Content>
						<Tabs.Content value="signup">
							<Box stacked gapped>
								<Heading level={1}>Sign up</Heading>
								<OAuthSigninButton provider="google" returnTo={returnTo} style={{ margin: '0 auto' }}>
									Sign up with Google
								</OAuthSigninButton>
								<Or />
								<EmailSignupForm returnTo={returnTo} />
							</Box>
						</Tabs.Content>
					</Box>
				</Tabs>
			</Frame>
		</Box>
	);
};

const Or = () => (
	<Box justify="between" align="center" gapped>
		<Box full style={{ borderBottom: 'var(--border)' }} />
		<Box>or</Box>
		<Box full style={{ borderBottom: 'var(--border)' }} />
	</Box>
);

export default LoginPage;
