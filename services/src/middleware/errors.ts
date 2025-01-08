import { AuthError } from '@a-type/auth';
import { AlefError } from '@alef/common';
import { ZodError } from 'zod';

export function handleError(reason: unknown): Response {
	if (AlefError.isInstance(reason)) {
		if (reason.code > AlefError.Code.InternalServerError) {
			console.error('Unexpected AlefError:', reason);
		}
		return new Response(JSON.stringify(reason.body), {
			status: reason.statusCode,
			headers: {
				'Content-Type': 'application/json',
				...reason.headers,
			},
		});
	}

	if (reason instanceof AuthError) {
		return new Response(reason.message, {
			status: reason.statusCode,
			headers: {
				'Content-Type': 'text/plain',
			},
		});
	}

	if (reason instanceof ZodError) {
		return new Response(JSON.stringify(reason.errors), {
			status: 400,
			headers: {
				'Content-Type': 'application/json',
				'x-long-game-error': AlefError.Code.BadRequest.toString(),
			},
		});
	}

	console.error('Unknown error:', reason);
	return new Response('Internal Server Error', {
		status: 500,
		headers: {
			'Content-Type': 'text/plain',
			'x-long-game-error': AlefError.Code.InternalServerError.toString(),
		},
	});
}
