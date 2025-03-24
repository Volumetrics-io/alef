import { EmailCompleteSignupForm } from '@/components/auth/EmailCompleteSignupForm';
import { Box, Frame } from '@alef/sys';
import { useSearchParams } from '@verdant-web/react-router';

const VerifyPage = () => {
	const [searchParams] = useSearchParams();
	const code = searchParams.get('code') ?? '';
	const email = searchParams.get('email') ?? '';

	if (!code || !email) {
		return <div>Invalid verification link</div>;
	}

	return (
		<Box full align="center" justify="center" p>
			<Frame gapped stacked p constrained>
				<EmailCompleteSignupForm code={code} email={email} />
			</Frame>
		</Box>
	);
};

export default VerifyPage;
