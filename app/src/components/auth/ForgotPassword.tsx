import { Box, Button, Dialog, Form } from '@alef/sys';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function ForgotPassword({ email }: { email?: string }) {
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
						email: email ?? '',
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
