import { AlefError } from '@alef/common';
import { ClientResponse } from 'hono/client';

export async function handleErrors<TResponseData>(req: Promise<ClientResponse<TResponseData>>): Promise<TResponseData> {
	const res = await req;
	AlefError.throwIfFailed(res);
	return res.json() as unknown as TResponseData;
}

export async function fallbackNullWhenOfflineOrError<TResponseData>(req: Promise<ClientResponse<TResponseData>>): Promise<TResponseData | null> {
	try {
		const res = await req;
		if (!res.ok) {
			const asAlefError = AlefError.fromResponse(res);
			console.error(asAlefError);
			return null;
		}
		return res.json() as unknown as TResponseData;
	} catch (err) {
		console.error(err);
		return null;
	}
}
