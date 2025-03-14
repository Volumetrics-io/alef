// flipping debug in search params sets the value for the rest of the session. it can also be
// set more permanently in localStorage
const debugFlag = typeof window !== 'undefined' && window.location.search.includes('debug');
if (debugFlag) {
	sessionStorage.setItem('debug', 'true');
}

export const DEBUG = !!sessionStorage.getItem('debug') || !!localStorage.getItem('debug');
