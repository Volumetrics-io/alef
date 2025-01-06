import { Box, Button, Input, Label } from '@alef/sys';

export interface EmailCompleteSignupFormProps {
	code: string;
	email: string;
	className?: string;
}

export function EmailCompleteSignupForm({ code, email, className, ...rest }: EmailCompleteSignupFormProps) {
	return (
		<Box asChild className={className} stacked gapped {...rest}>
			<form action={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/auth/complete-email-signup`} method="post">
				<input type="hidden" name="code" value={code} />
				<input type="hidden" name="email" value={email} />
				<Label htmlFor="password">Password</Label>
				<Input type="password" name="password" id="password" required />
				<Button type="submit">Activate Account</Button>
			</form>
		</Box>
	);
}
