import { Button } from '@alef/sys';

export function LoginButton() {
	return (
		<Button color="suggested" asChild>
			<a href={`https://app.alef.io/login`} target="_blank" rel="noreferrer noopener">
				Log in
			</a>
		</Button>
	);
}
