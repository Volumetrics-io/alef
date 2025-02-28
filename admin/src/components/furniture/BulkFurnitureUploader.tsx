import { adminApiClient } from '@/services/adminApi';
import { handleErrors } from '@/services/utils';
import { Attribute, FurnitureModelQuality } from '@alef/common';
import { Box, Button, CardGrid, Dialog, Frame, Heading, Icon, ScrollArea } from '@alef/sys';
import { ChangeEvent, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { proxy, useSnapshot } from 'valtio';
import { AttributePicker } from './AttributePicker';
import { AttributePill } from './AttributePill';

const progressState = proxy({
	completed: {} as Record<string, boolean>,
});

export function BulkFurnitureUploader() {
	const [attributes, setAttributes] = useState<Attribute[]>([
		{
			key: 'package',
			value: 'core',
		},
	]);
	const [directory, setDirectory] = useState<FileList | null>(null);
	const onDirectory = (ev: ChangeEvent<HTMLInputElement>) => {
		const files = ev.target.files;
		if (files) {
			setDirectory(files);
		}
	};
	const [uploading, setUploading] = useState(false);

	const directoryError = useMemo(() => {
		if (!directory) return false;
		for (let i = 0; i < directory.length; i++) {
			const file = directory[i];

			// ignore excess files
			if (file.name === '.DS_Store') continue;

			// file should be in a subfolder
			const subpath = file.webkitRelativePath.split('/');
			if (subpath.length !== 3) return `File ${file.name} should be in a subfolder`;
			// file should be a gltf
			if (!file.name.endsWith('.gltf') && !file.name.endsWith('.glb')) return `File ${file.name} should be a gltf`;
			// file should be named original, medium or low
			const filename = file.name.split('.')[0];
			if (!Object.values(FurnitureModelQuality).includes(filename as any)) return `File ${file.name} should be named original, medium or low`;
		}
	}, [directory]);

	const grouped = useMemo<Record<string, File[]>>(() => {
		if (!directory) return {};
		const groups = {} as Record<string, File[]>;
		for (let i = 0; i < directory.length; i++) {
			const file = directory[i];
			const subpath = file.webkitRelativePath.split('/');
			const group = subpath[1];

			// filter out excess files
			if (group === '.DS_Store') continue;

			if (!groups[group]) groups[group] = [];
			groups[group].push(file);
		}
		return groups;
	}, [directory]);

	const singleUpload = async (name: string, dir: File[]) => {
		const byQuality = dir.reduce(
			(acc, file) => {
				const filename = file.name.split('.')[0];
				if (Object.values(FurnitureModelQuality).includes(filename as any)) acc[filename as FurnitureModelQuality] = file;
				return acc;
			},
			{} as Record<FurnitureModelQuality, File>
		);

		// create furniture entry
		const furniture = await handleErrors(
			adminApiClient.furniture.$post({
				json: {
					name,
					attributes,
				},
			})
		);

		// upload models
		await Promise.all(
			Object.entries(byQuality).map(([quality, file]) =>
				adminApiClient.furniture[':id'].model.$put({
					param: { id: furniture.id },
					form: { file, quality: quality as FurnitureModelQuality },
				})
			)
		);
	};

	const bulkUpload = async () => {
		if (!directory) return;
		setUploading(true);
		progressState.completed = {};
		try {
			const results = await Promise.allSettled(
				Object.entries(grouped).map(async ([name, dir]) => {
					await singleUpload(name, dir);
					progressState.completed[name] = true;
				})
			);
			const errors = results.filter((res) => res.status === 'rejected');
			if (errors.length) {
				console.error(errors);
				toast.error(`Some models failed to upload. Check console for errors`);
			} else {
				toast.success('All models uploaded');
			}
		} catch (err) {
			console.error(err);
		} finally {
			setUploading(false);
		}
	};

	return (
		<Dialog>
			<Dialog.Trigger asChild>
				<Button color="suggested">Upload Bulk Furniture</Button>
			</Dialog.Trigger>
			<Dialog.Content title="Bulk furniture" width="large">
				<Dialog.Description>
					Select a folder with subfolders containing furniture LOD models "original.gltf/glb", "medium.gltf/glb", "low.gltf/glb", "collision.gltf/glb"
				</Dialog.Description>
				<Frame p stacked gapped>
					<AttributePicker onSubmit={(attr) => setAttributes((v) => [...v, attr])} actionText="Add" />
					<Box gapped wrap>
						{attributes.map((attr, idx) => (
							<AttributePill attribute={attr} key={`${attr.key}:${attr.value}`} onRemove={() => setAttributes(attributes.filter((_, i) => i !== idx))} />
						))}
					</Box>
				</Frame>
				<div>
					<input
						ref={(val) => {
							if (val) {
								val.webkitdirectory = true;
							}
						}}
						type="file"
						multiple
						hidden
						id={`bulk-upload`}
						style={{ visibility: 'hidden', position: 'absolute', zIndex: -1 }}
						onChange={onDirectory}
					/>
					<Button asChild>
						<label htmlFor={`bulk-upload`}>Select directory</label>
					</Button>
				</div>
				{directoryError && (
					<Frame p style={{ color: 'darkred' }}>
						{directoryError}
					</Frame>
				)}
				<ScrollArea style={{ maxHeight: '40vh' }}>
					<CardGrid>
						{grouped &&
							Object.entries(grouped).map(([group, files]) => (
								<Frame padded="small" stacked gapped key={group} style={{ flexShrink: 0 }}>
									<Box gapped>
										<ProgressIndicator modelName={group} />
										<Heading level={3}>{group}</Heading>
									</Box>
									<Box gapped>
										{files.map((file) => (
											<Frame p="squeeze" key={file.name}>
												{file.name}
											</Frame>
										))}
									</Box>
								</Frame>
							))}
					</CardGrid>
				</ScrollArea>
				<Dialog.Actions>
					<Dialog.Close asChild disabled={uploading}>
						<Button>Cancel</Button>
					</Dialog.Close>
					<Button loading={uploading} onClick={bulkUpload} color="suggested" disabled={!!directoryError || !directory || directory.length === 0}>
						Upload
					</Button>
				</Dialog.Actions>
			</Dialog.Content>
		</Dialog>
	);
}

function ProgressIndicator({ modelName }: { modelName: string }) {
	const completed = useSnapshot(progressState).completed[modelName];

	if (!completed) {
		return <Icon name="circle" />;
	}

	return <Icon name="circle-check" color="rgb(0, 215, 61)" />;
}
