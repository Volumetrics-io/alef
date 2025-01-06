import { fetch } from '@/services/fetch';
import { Box, Text } from '@alef/sys';
import { useState } from 'react';
import { Form } from '../forms/forms';

export interface EmailSignupFormProps {
	returnTo?: string | null;
	actionText?: string;
	disabled?: boolean;
	className?: string;
	appState?: unknown;
	onError?: (error: Error) => void;
}

export function EmailSignupForm({ returnTo, actionText = 'Verify email', disabled, className, appState, onError, ...rest }: EmailSignupFormProps) {
	const [success, setSuccess] = useState(false);

	if (success) {
		return (
			<Box stacked gapped className={className} {...rest}>
				<Text>Check your email for a verification link.</Text>
			</Box>
		);
	}

	return (
		<Form
			initialValues={{
				name: '',
				email: '',
			}}
			onSubmit={async (values) => {
				if (disabled) return;
				try {
					const formData = new FormData();
					formData.append('name', values.name);
					formData.append('email', values.email);
					if (returnTo) {
						formData.append('returnTo', returnTo);
					}
					if (appState) {
						formData.append('appState', JSON.stringify(appState));
					}
					const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/auth/begin-email-signup`, {
						method: 'POST',
						body: formData,
						credentials: 'include',
					});
					if (!response.ok) {
						throw new Error(response.statusText);
					}
					setSuccess(true);
				} catch (err) {
					onError?.(err as Error);
				}
			}}
		>
			<Form.TextField name="name" label="Name" required autoComplete="given-name" />
			<Form.TextField name="email" label="Email" type="email" required autoComplete="email" />
			<Form.Submit disabled={disabled} type="submit">
				{actionText}
			</Form.Submit>
		</Form>
	);
}
