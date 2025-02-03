import { id, PrefixedId } from '@alef/common';
import { Context } from 'hono';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';
import { getRootDomain } from './domains';

const DEVICE_ID_COOKIE_NAME = 'alef-deviceId';

export async function assignOrRefreshDeviceId(ctx: Context) {
	console.log(ctx.env.DEVICE_ID_SIGNING_SECRET);
	const deviceIdCookie = await getSignedCookie(ctx, ctx.env.DEVICE_ID_SIGNING_SECRET, DEVICE_ID_COOKIE_NAME);
	if (deviceIdCookie) {
		// refresh cookie
		assignDeviceId(ctx, deviceIdCookie);
		return deviceIdCookie as PrefixedId<'d'>;
	} else {
		// assign new cookie
		const deviceId = id('d');
		assignDeviceId(ctx, deviceId);
		return deviceId;
	}
}

async function assignDeviceId(ctx: Context, id: string) {
	await setSignedCookie(ctx, DEVICE_ID_COOKIE_NAME, id, ctx.env.DEVICE_ID_SIGNING_SECRET, {
		domain: getRootDomain(ctx.env.API_ORIGIN),
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
		sameSite: 'lax',
		httpOnly: true,
		secure: ctx.env.NODE_ENV === 'production',
	});
}
