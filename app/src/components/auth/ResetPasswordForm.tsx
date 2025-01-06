import { Box, Button, Input } from '@alef/sys';

export interface ResetPasswordFormProps {
	code: string;
	email: string;
	className?: string;
}

export function ResetPasswordForm({ code, email, ...rest }: ResetPasswordFormProps) {
	return (
		<Box asChild stacked gapped {...rest}>
			<form action={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/auth/reset-password`} method="post">
				<input type="hidden" name="code" value={code} />
				<input type="hidden" name="email" value={email} />
				<label htmlFor="newPassword">New Password</label>
				<Input name="newPassword" type="password" autoComplete="new-password" required />
				<Button type="submit">Reset password</Button>
			</form>
		</Box>
	);
}
