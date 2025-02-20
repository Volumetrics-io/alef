import { PrefixedId } from '@alef/common';
import { proxy, useSnapshot } from 'valtio';

const snapshotNonces = proxy({} as Record<PrefixedId<'f'>, string>);

export function useSnapshotNonce(furnitureId: PrefixedId<'f'>) {
	return useSnapshot(snapshotNonces)[furnitureId];
}

export function setSnapshotNonce(furnitureId: PrefixedId<'f'>, nonce: string) {
	snapshotNonces[furnitureId] = nonce;
}
