import { useCallback } from 'react';

export function useHeightGlobal(varName: `--${string}`) {
	return useCallback(
		(node: HTMLDivElement | null) => {
			if (typeof window === 'undefined') return;

			if (!node) {
				document.body.style.removeProperty(varName);
				return;
			}

			requestAnimationFrame(() => {
				const height = node.offsetHeight;

				// immediately register the navbar size to the body on mount
				document.body.style.setProperty(varName, `${height}px`);
			});
		},
		[varName]
	);
}
