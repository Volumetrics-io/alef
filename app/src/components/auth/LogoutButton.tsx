import { Button, ButtonProps } from '@alef/sys';

export function LogoutButton({ children, ...rest }: ButtonProps) {
	return (
		<form action={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/auth/logout`} method="post">
			<Button type="submit" {...rest}>
				{children || 'Log out'}
			</Button>
		</form>
	);
}
