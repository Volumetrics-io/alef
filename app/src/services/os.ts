const ua = navigator.userAgent.toLowerCase();
function getOS() {
	if (ua.includes('windows')) {
		return 'Windows';
	}
	if (ua.includes('mac')) {
		return 'Mac';
	}
	if (ua.includes('linux')) {
		return 'Linux';
	}
	if (ua.includes('android')) {
		return 'Android';
	}
	if (ua.includes('iphone')) {
		return 'iOS';
	}
	if (ua.includes('ipad')) {
		return 'iOS';
	}
	if (ua.includes('ipod')) {
		return 'iOS';
	}
	return 'Unknown';
}
function getBrowser() {
	if (ua.includes('firefox')) {
		return 'Firefox';
	}
	if (ua.includes('chrome')) {
		return 'Chrome';
	}
	if (ua.includes('safari')) {
		return 'Safari';
	}
	if (ua.includes('edge')) {
		return 'Edge';
	}
	if (ua.includes('msie')) {
		return 'IE';
	}
	return 'Unknown';
}
function getDeviceType() {
	if (ua.includes('mobile')) {
		return 'Mobile';
	}
	if (ua.includes('tablet')) {
		return 'Tablet';
	}
	return 'Desktop';
}

export const userAgent = navigator.userAgent;

export const os = getOS();
export const browser = getBrowser();
export const deviceType = getDeviceType();

// used for heuristics
const isTall = window.innerHeight > window.innerWidth;

const emulateHeadset = new URLSearchParams(window.location.search).get('emulateHeadset') || sessionStorage.getItem('emulateHeadset');
if (emulateHeadset) {
	// once emulate headset is set, keep it set.
	sessionStorage.setItem('emulateHeadset', 'true');
	console.log('emulating headset');
}
export const supportsXR = 'xr' in window.navigator || emulateHeadset;

// only Oculus Browser seems to expose a custom name in the UA...
export const isQuest = userAgent.includes('OculusBrowser') || userAgent.includes('Quest');

/** Best guess as to whether this device is an XR headset */
export const isHeadset = supportsXR && (emulateHeadset || isQuest || os === 'iOS' || (deviceType === 'Mobile' && !isTall));

/** Best guess as to what to call this device */
export const deviceName = isHeadset ? (isQuest ? 'Quest' : os === 'iOS' ? 'Vision Pro' : 'Headset') : browser === 'Unknown' ? 'Browser' : browser;
