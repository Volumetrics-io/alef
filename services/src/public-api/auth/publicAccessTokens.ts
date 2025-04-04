import { PrefixedId } from '@alef/common';
import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();

export function getPublicAccessTokenSessionToken(propertyId: PrefixedId<'p'>, secret: string) {
	return new SignJWT({
		sub: propertyId,
		typ: 'pat',
	})
		.setProtectedHeader({
			alg: 'HS256',
		})
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(encoder.encode(secret));
}

export async function verifyPublicAccessTokenSessionToken(token: string, secret: string) {
	const result = await jwtVerify(token, encoder.encode(secret));
	return result.payload as { sub: PrefixedId<'p'>; typ: 'pat' };
}

export const PUBLIC_ACCESS_TOKEN_COOKIE = 'alef_pat';
