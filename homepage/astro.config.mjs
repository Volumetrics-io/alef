// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	integrations: [react({})],
	env: {
		schema: {
			PUBLIC_API_ORIGIN: envField.string({ context: 'client', access: 'public', optional: true }),
		},
	},
});
