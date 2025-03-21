import { FurnitureModelQuality, PrefixedId } from '@alef/common';
import { hcWithType } from '@alef/services/admin-api';
import { useCallback, useMemo } from 'react';
import { fetch } from './fetch.js';

export const adminApiClient = hcWithType(import.meta.env.VITE_ADMIN_API_ORIGIN, {
	fetch,
});

export function useUploadFurnitureModels() {
	return useCallback(async (furnitureId: PrefixedId<'f'>, dir: File[]) => {
		const byQuality = dir.reduce(
			(acc, file) => {
				const filename = file.name.split('.')[0];
				if (Object.values(FurnitureModelQuality).includes(filename as FurnitureModelQuality)) acc[filename as FurnitureModelQuality] = file;
				return acc;
			},
			{} as Record<FurnitureModelQuality, File>
		);

		// upload models
		await Promise.all(
			Object.entries(byQuality).map(([quality, file]) =>
				adminApiClient.furniture[':id'].model.$put({
					param: { id: furnitureId },
					form: { file, quality: quality as FurnitureModelQuality },
				})
			)
		);
	}, []);
}

export function useValidateModelDirectory(
	directory: FileList | null,
	{
		nested = false,
	}: {
		nested?: boolean;
	} = {}
) {
	const directoryError = useMemo(() => {
		if (!directory) return false;
		for (let i = 0; i < directory.length; i++) {
			const file = directory[i];

			// ignore excess files
			if (file.name === '.DS_Store') continue;

			// file should be in a subfolder
			const subpath = file.webkitRelativePath.split('/');
			const requiredLength = nested ? 3 : 2;
			if (nested && subpath.length < requiredLength) return `File ${file.name} should be in a subfolder`;
			if (!nested && subpath.length !== requiredLength) return `File ${file.name} should not be in a subfolder`;

			// file should be a gltf
			if (!file.name.endsWith('.gltf') && !file.name.endsWith('.glb')) return `File ${file.name} should be a gltf`;
			// file should be named original, medium or low
			const filename = file.name.split('.')[0];
			if (!Object.values(FurnitureModelQuality).includes(filename as FurnitureModelQuality)) return `File ${file.name} should be named original, medium or low`;
		}
	}, [directory, nested]);
	return { error: directoryError };
}
