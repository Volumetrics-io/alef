import React, { ErrorInfo } from 'react';

interface ErrorBoundaryProps {
	children: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
		};
	}

	static getDerivedStateFromError(_error: Error) {
		// Update state to indicate an error has occurred
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Error:', error);
		console.error('Error Info:', errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// You can customize the error message here
			return <h1>Something went wrong.</h1>;
		}

		return this.props.children;
	}
}
