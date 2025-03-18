import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<{ fallback?: ReactNode; children?: ReactNode; onError?: (error: Error) => void }, { error: Error | null }> {
	state = { error: null };
	static getDerivedStateFromError(error: Error) {
		return { error };
	}
	componentDidCatch(error: Error) {
		if (this.props.onError) {
			this.props.onError(error);
		}
	}
	render() {
		if (this.state.error) {
			return this.props.fallback ?? 'Failed to render';
		}
		return this.props.children;
	}
}
