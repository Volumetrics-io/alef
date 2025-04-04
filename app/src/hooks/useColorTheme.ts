import { PreferredColorScheme, setPreferredColorScheme } from '@react-three/uikit';
import { useEffect } from 'react';
import { useLocalStorage } from './useStorage';

export function useColorTheme() {
	const [theme, setTheme] = useLocalStorage<PreferredColorScheme>('color-theme', 'system', false);
	useEffect(() => {
		setPreferredColorScheme(theme);
	}, [theme]);

	return [theme, setTheme] as const;
}
