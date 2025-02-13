import { EmailSigninForm } from '@/components/auth/EmailSigninForm';
import { Box, Frame, Heading, Logo } from '@alef/sys';
import { useSearchParams } from '@verdant-web/react-router';

const LoginPage = () => {
	const [searchParams] = useSearchParams();
	const returnTo = searchParams.get('returnTo') ?? undefined;

	return (
		<Box full align="center" justify="center" p>
			<Frame gapped stacked p constrained>
				<Box full align="center" gapped>
					<Logo width={80} height={80} style={{ alignSelf: 'flex-start' }} />
					<Heading level={1} style={{ fontSize: '2rem' }}>
						Alef
					</Heading>
				</Box>

				<Heading level={1}>Login</Heading>
				<EmailSigninForm returnTo={returnTo} />
			</Frame>
		</Box>
	);
};

export default LoginPage;
