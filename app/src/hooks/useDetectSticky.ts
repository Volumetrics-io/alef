import { useEffect, useRef } from 'react';

export function useDetectSticky<TEl extends HTMLElement>({ containerSelector, offset }: { containerSelector?: string; offset?: number }) {
	const ref = useRef<TEl>(null);
	useEffect(() => {
		if (!ref.current) return;
		let container = undefined;
		if (containerSelector) {
			container = document.querySelector(containerSelector);
			if (!container) {
				console.warn(`Container with selector "${containerSelector}" not found.`);
				return;
			}
		}
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					entry.target.classList.toggle('stuck', entry.intersectionRatio < 1);
				});
			},
			{ threshold: [1], rootMargin: `-${1 + (offset ?? 0)}px 0px 0px 0px`, root: container }
		);
		if (ref.current) {
			observer.observe(ref.current);
		}
		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
		};
	}, [containerSelector]);

	return ref;
}
