import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useSearchParams } from '@verdant-web/react-router';

const ResetPasswordPage = () => {
	const [params] = useSearchParams();
	const email = params.get('email') ?? '';
	const code = params.get('code') ?? '';

	if (!email || !code) {
		return <div>Invalid reset link</div>;
	}

	return <ResetPasswordForm email={email} code={code} />;
};

export default ResetPasswordPage;
