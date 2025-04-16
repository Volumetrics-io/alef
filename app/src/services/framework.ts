// Begins loading the framework code in the background as soon as the app launches.
// This makes it take less time to start up sandboxes.
// eslint-disable-next-line no-async-promise-executor
export const frameworkCodePromise = new Promise<string>(async (resolve, reject) => {
	try {
		// don't bother on the server
		if (typeof window === 'undefined') {
			resolve('');
			return;
		}

		const code = await import('@alef/framework/runtime?raw');
		resolve(code.default);
	} catch (error) {
		reject(error);
	}
});
