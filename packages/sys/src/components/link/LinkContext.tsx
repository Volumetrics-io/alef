import { createContext, ReactNode, useContext } from 'react';

const LinkContext = createContext({
	pathname: '/',
	origin: '',
});

export const LinkProvider = ({ pathname, originOverride = '', children }: { pathname: string; originOverride?: string; children: ReactNode }) => (
	<LinkContext.Provider value={{ pathname, origin: originOverride }}>{children}</LinkContext.Provider>
);
export function useLinkContext() {
	return useContext(LinkContext);
}
