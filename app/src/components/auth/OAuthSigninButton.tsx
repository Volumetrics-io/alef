import { Button, ButtonProps } from '@alef/sys';
import { ReactNode } from 'react';

export function OAuthSigninButton({
	returnTo,
	children,
	className,
	inviteId,
	appState,
	provider,
	...rest
}: {
	returnTo?: string | null;
	children?: ReactNode;
	inviteId?: string | null;
	appState?: unknown;
	provider: string;
} & ButtonProps) {
	const url = new URL(`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/auth/provider/${provider}/login`);
	if (returnTo) {
		url.searchParams.set('returnTo', returnTo);
	}
	if (inviteId) {
		url.searchParams.set('inviteId', inviteId);
	}
	if (appState) {
		url.searchParams.set('appState', JSON.stringify(appState));
	}

	return (
		<form action={url.toString()} className={className} method="post">
			<Button type="submit" {...rest}>
				{children}
			</Button>
		</form>
	);
}
