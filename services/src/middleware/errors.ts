import { AuthError } from '@a-type/auth';
import { AlefError } from '@alef/common';
import { ZodError } from 'zod';
import { sessions } from '../public-api/auth/session';

export function handleError(reason: unknown): Response {
	if (AlefError.isInstance(reason)) {
		if (reason.code > AlefError.Code.InternalServerError) {
			console.error('Unexpected AlefError:', reason);
		}
		return reason.toResponse();
	}

	if (reason instanceof AuthError) {
		// for invalid sessions, log the user out.
		if (reason.message === AuthError.Messages.InvalidSession || reason.message === AuthError.Messages.InvalidRefreshToken) {
			const { headers } = sessions.clearSession({} as any);
			return new Response(reason.message, {
				status: 401,
				headers: {
					'Content-Type': 'text/plain',
					'x-alef-error': AlefError.Code.Unauthorized.toString(),
					...headers,
				},
			});
		}
		return reason.toResponse();
	}

	if (reason instanceof ZodError) {
		return new Response(JSON.stringify(reason.errors), {
			status: 400,
			headers: {
				'Content-Type': 'application/json',
				'x-alef-error': AlefError.Code.BadRequest.toString(),
			},
		});
	}

	console.error('Unknown error:', reason);
	return new Response('Internal Server Error', {
		status: 500,
		headers: {
			'Content-Type': 'text/plain',
			'x-alef-error': AlefError.Code.InternalServerError.toString(),
		},
	});
}
