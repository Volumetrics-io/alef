import { EmailSigninForm } from '@/components/auth/EmailSigninForm';
import { Box, Frame, Heading } from '@alef/sys';
import { useSearchParams } from '@verdant-web/react-router';

const LoginPage = () => {
	const [searchParams] = useSearchParams();
	const returnTo = searchParams.get('returnTo') ?? undefined;

	return (
		<Box full align="center" justify="center" p>
			<Frame gapped stacked p constrained>
				<Heading level={1}>Login</Heading>
				<EmailSigninForm returnTo={returnTo} />
			</Frame>
		</Box>
	);
};

export default LoginPage;
