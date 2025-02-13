import { useNavigate } from '@verdant-web/react-router';
import { useEffect } from 'react';

export function Redirect({ to }: { to: string }) {
	const navigate = useNavigate();
	useEffect(() => {
		navigate(to);
	}, [navigate, to]);
	return null;
}
