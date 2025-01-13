import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<{ fallback?: ReactNode; children?: ReactNode }, { error: Error | null }> {
	state = { error: null };
	static getDerivedStateFromError(error: Error) {
		return { error };
	}
	render() {
		if (this.state.error) {
			return this.props.fallback ?? 'Failed to render';
		}
		return this.props.children;
	}
}
