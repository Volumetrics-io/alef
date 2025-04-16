import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value]);

	return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number = 500): T {
	const [debouncedCallback, setDebouncedCallback] = useState<T>(callback);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedCallback(() => callback);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [callback, delay]);

	return debouncedCallback;
}
