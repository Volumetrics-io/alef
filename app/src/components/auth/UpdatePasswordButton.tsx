import { Button, ButtonProps } from '@alef/sys';
import { useState } from 'react';
import toast from 'react-hot-toast';

export interface UpdatePasswordButtonProps extends ButtonProps {
	email: string;
}

export function UpdatePasswordButton({ email, ...rest }: UpdatePasswordButtonProps) {
	const [sent, setSent] = useState(false);
	return (
		<Button
			{...rest}
			onClick={async () => {
				try {
					const formData = new FormData();
					formData.append('email', email);
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
						toast.success('Password update email sent. Check your inbox.');
						setSent(true);
					} else {
						const json = await response.json();
						console.error(json);
						toast.error('Failed to send password update email. Try again?');
					}
				} catch (err) {
					console.error(err);
					toast.error('Failed to send password update email. Try again?');
				}
			}}
			disabled={sent || rest.disabled}
		>
			{sent ? 'Email Sent' : 'Update Password'}
		</Button>
	);
}
