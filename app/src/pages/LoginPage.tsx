import { EmailSigninForm } from '@/components/auth/EmailSigninForm';
import { Box, Heading } from '@alef/sys';
import { useSearchParams } from '@verdant-web/react-router';

const LoginPage = () => {
	const [searchParams] = useSearchParams();
	const returnTo = searchParams.get('returnTo') ?? undefined;

	return (
		<Box>
			<Heading level={1}>Login</Heading>
			<EmailSigninForm returnTo={returnTo} />
		</Box>
	);
};

export default LoginPage;
