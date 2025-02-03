type RemoveDisposable<T> = T extends infer U & Disposable ? U : never;
/**
 * Removes the 'Disposable' type from the data type, making it
 * consumable by Hono RPC type instantiation.
 */
export function wrapRpcData<T>(data: T): RemoveDisposable<T> {
	return data as unknown as RemoveDisposable<T>;
}
