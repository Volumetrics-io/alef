import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Box, Frame } from '@alef/sys';
import { useSearchParams } from '@verdant-web/react-router';

const ResetPasswordPage = () => {
	const [params] = useSearchParams();
	const email = params.get('email') ?? '';
	const code = params.get('code') ?? '';

	if (!email || !code) {
		return <div>Invalid reset link</div>;
	}

	return (
		<Box full layout="center center" p>
			<Frame gapped stacked p constrained>
				<ResetPasswordForm email={email} code={code} />
			</Frame>
		</Box>
	);
};

export default ResetPasswordPage;
