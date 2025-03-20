import { Text } from '@react-three/uikit';
import { useState } from 'react';
import { Button } from '../ui/Button';

export function ErrorSimulatorButton() {
	const [error, setError] = useState(false);

	if (!import.meta.env.DEV) {
		return null;
	}

	if (error) {
		throw new Error('Fake error');
	}

	return (
		<Button onClick={() => setError(true)}>
			<Text>Throw Error</Text>
		</Button>
	);
}
