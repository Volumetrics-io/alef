import { TooltipProvider } from '@radix-ui/react-tooltip';
import { LinkProvider } from '../link/LinkContext.js';
import { ReactNode } from 'react';

/**
 * Composes all necessary providers for Sys.
 */
export const SysProvider = ({ children, pathname, originOverride }: { children: ReactNode; pathname: string; originOverride?: string }) => {
	return (
		<LinkProvider pathname={pathname} originOverride={originOverride}>
			<TooltipProvider>{children}</TooltipProvider>
		</LinkProvider>
	);
};
