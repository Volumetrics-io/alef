import { EmailCompleteSignupForm } from '@/components/auth/EmailCompleteSignupForm';
import { useSearchParams } from '@verdant-web/react-router';

const VerifyPage = () => {
	const [searchParams] = useSearchParams();
	const code = searchParams.get('code') ?? '';
	const email = searchParams.get('email') ?? '';

	if (!code || !email) {
		return <div>Invalid verification link</div>;
	}

	return <EmailCompleteSignupForm code={code} email={email} />;
};

export default VerifyPage;
