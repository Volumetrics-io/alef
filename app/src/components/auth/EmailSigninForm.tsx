import { fetch } from '@/services/fetch';
import { Box, Button, Dialog, Form, Input, Label } from '@alef/sys';
import { useState } from 'react';
import toast from 'react-hot-toast';

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

	return (
		<Box asChild className={className} {...rest} stacked gapped>
			<form action={url.toString()} method="post">
				<Label htmlFor="email">Email</Label>
				<Input type="email" name="email" id="email" required />
				<Label htmlFor="password">Password</Label>
				<Input autoComplete="current-password" type="password" name="password" id="password" required />
				<Button type="submit">Sign In</Button>
				<ForgotPassword />
			</form>
		</Box>
	);
}

function ForgotPassword() {
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<Button color="ghost" type="button">
					Forgot Password?
				</Button>
			</Dialog.Trigger>
			<Dialog.Content title="Reset Password">
				<Form
					initialValues={{
						email: '',
					}}
					onSubmit={async (values) => {
						try {
							const formData = new FormData();
							formData.append('email', values.email);
							let returnTo = window.location.pathname;
							if (window.location.search) {
								returnTo += window.location.search;
							}
							formData.append('returnTo', returnTo);
							const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/auth/begin-reset-password`, {
								method: 'post',
								body: formData,
							});
							if (response.ok) {
								setOpen(false);
								toast.success('Password reset email sent. Check your inbox.');
							} else {
								const json = await response.json();
								console.error(json);
								setErrorMessage('Failed to send reset email. Try again?');
							}
						} catch (err) {
							console.error(err);
							setErrorMessage('Failed to send reset email. Try again?');
						}
					}}
				>
					<Form.TextField label="Email" name="email" type="email" required />
					{errorMessage && <Box>{errorMessage}</Box>}
					<Dialog.Actions>
						<Dialog.Close asChild>
							<Button>Cancel</Button>
						</Dialog.Close>
						<Form.Submit>Send Reset Email</Form.Submit>
					</Dialog.Actions>
				</Form>
			</Dialog.Content>
		</Dialog>
	);
}
