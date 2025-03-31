import { useMedia } from '@/hooks/useMedia';
import { Box, Button, Dialog, Frame, Heading, Icon } from '@alef/sys';
import { ReactNode } from 'react';

export interface DesktopSecondaryContentProps {
	children: ReactNode;
	title: string;
	open: boolean;
	onOpenChange: (isOpen: boolean) => void;
}

export function DesktopSecondaryContent({ children, title, open, onOpenChange }: DesktopSecondaryContentProps) {
	const isMobile = useMedia('(max-width: 768px)');

	if (isMobile) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<Dialog.Content title={title}>{children}</Dialog.Content>
			</Dialog>
		);
	}

	if (!open) return null;

	return (
		<Frame float="top-left" p stacked gapped style={{ minWidth: 300 }}>
			<Box justify="between">
				<Heading level={2}>{title}</Heading>
			</Box>
			<Button variant="action" float="top-right" onClick={() => onOpenChange(false)} aria-label="close">
				<Icon name="x" />
			</Button>
			{children}
		</Frame>
	);
}
