import { Box, Button, Input, Label } from '@alef/sys';
import { useState } from 'react';
import { ForgotPassword } from './ForgotPassword';

export interface EmailSigninFormProps {
	returnTo?: string;
	className?: string;
	appState?: unknown;
}

export function EmailSigninForm({ returnTo, className, appState, ...rest }: EmailSigninFormProps) {
	const url = new URL(`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/auth/email-login`);
	if (returnTo) {
		url.searchParams.append('returnTo', returnTo);
	}
	if (appState) {
		url.searchParams.append('appState', JSON.stringify(appState));
	}

	const [observedEmail, setObservedEmail] = useState('');

	return (
		<Box asChild className={className} {...rest} stacked gapped>
			<form action={url.toString()} method="post">
				<Label htmlFor="email">Email</Label>
				<Input
					type="email"
					name="email"
					id="email"
					required
					onChange={(ev) => {
						setObservedEmail(ev.target.value);
					}}
				/>
				<Label htmlFor="password">Password</Label>
				<Input autoComplete="current-password" type="password" name="password" id="password" required />
				<Button type="submit" color="suggested">
					Sign In
				</Button>
				<ForgotPassword email={observedEmail} />
			</form>
		</Box>
	);
}
