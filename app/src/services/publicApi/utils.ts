import { AlefError } from '@alef/common';
import { ClientResponse } from 'hono/client';
import toast from 'react-hot-toast';

export async function handleErrors<TResponseData>(req: Promise<ClientResponse<TResponseData>>): Promise<TResponseData> {
	const res = await req;
	AlefError.throwIfFailed(res);
	return res.json() as unknown as TResponseData;
}

export async function fallbackWhenOfflineOrError<TResponseData, TFallback = null>(
	req: Promise<ClientResponse<TResponseData>>,
	fallback: TFallback
): Promise<TResponseData | TFallback> {
	try {
		const res = await req;
		if (!res.ok) {
			const asAlefError = AlefError.fromResponse(res);
			console.error(asAlefError);
			toast.error(!asAlefError ? 'Server error! Check your network.' : asAlefError.message);
			return fallback;
		}
		return res.json() as unknown as TResponseData;
	} catch (err) {
		console.error(err);
		return fallback;
	}
}
