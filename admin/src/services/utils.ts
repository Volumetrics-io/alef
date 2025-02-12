import { AlefError } from '@alef/common';
import { ClientResponse } from 'hono/client';

export async function handleErrors<TResponseData>(req: Promise<ClientResponse<TResponseData>>): Promise<TResponseData> {
	const res = await req;
	AlefError.throwIfFailed(res);
	return res.json() as unknown as TResponseData;
}
