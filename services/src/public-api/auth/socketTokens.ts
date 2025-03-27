import { Session } from '@a-type/auth';
import { PrefixedId } from '@alef/common';
import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();

/**
 * Encodes a JWT to give access to a live websocket for a room layout.
 */
export function getSocketToken(session: Session, roomLayoutId: PrefixedId<'p'>, secret: string) {
	const builder = new SignJWT({
		sub: session.userId,
		aud: roomLayoutId,
		dev: session.deviceId,
		name: session.name,
		exp: Math.floor(Date.now() / 1000) + 60 * 60,
	})
		.setProtectedHeader({
			alg: 'HS256',
		})
		.setIssuedAt()
		.setExpirationTime('1h')
		.setSubject(session.userId)
		.setAudience(roomLayoutId);
	return builder.sign(encoder.encode(secret));
}

export async function verifySocketToken(token: string, secret: string) {
	const result = await jwtVerify(token, encoder.encode(secret));
	return result.payload as { sub: PrefixedId<'u'>; aud: string; dev?: PrefixedId<'d'>; name?: string };
}
