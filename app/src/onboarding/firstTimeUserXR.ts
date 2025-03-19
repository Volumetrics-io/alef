import { createOnboarding } from '@a-type/onboarding';

export const firstTimeUserXROnboarding = createOnboarding('firstTimeUser', ['welcome', 'layouts', 'furniture', 'lighting', 'minimize'] as const, true);
