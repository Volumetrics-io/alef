import { EmailSigninForm } from '@/components/auth/EmailSigninForm';
import { Box, Frame, Heading, Link, Logo } from '@alef/sys';
import { useSearchParams } from '@verdant-web/react-router';

const LoginPage = () => {
	const [searchParams] = useSearchParams();
	const returnTo = searchParams.get('returnTo') ?? undefined;
	const error = searchParams.get('error') ?? undefined;

	return (
		<Box full stacked align="center" justify="center" p>
			<Frame gapped stacked p constrained>
				<Box full align="center" gapped>
					<Logo width={80} height={80} style={{ alignSelf: 'flex-start' }} />
					<Heading level={1} style={{ fontSize: '2rem' }}>
						alef
					</Heading>
				</Box>

				<Heading level={1}>Login</Heading>
				{error && (
					<Box p style={{ backgroundColor: 'var(--error-paper)', color: 'var(--error-ink)' }}>
						{error}
					</Box>
				)}
				<EmailSigninForm returnTo={returnTo} />
			</Frame>
			<Box gapped p="small" style={{ fontSize: '0.8rem', color: 'var(--faded)' }}>
				<Link to="https://alef.io/tos">Terms of Service</Link>
				<Link to="https://alef.io/privacy">Privacy Policy</Link>
			</Box>
		</Box>
	);
};

export default LoginPage;
