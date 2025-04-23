import { useSuspenseQuery } from '@tanstack/react-query';
import { publicApiClient } from './client';
import { handleErrors } from './utils';

export function useOrganization() {
	return useSuspenseQuery({
		queryKey: ['organization'],
		queryFn: () => handleErrors(publicApiClient.organizations.default.$get({})),
	});
}
