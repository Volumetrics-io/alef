import { useUploadFurnitureModels, useValidateModelDirectory } from '@/services/adminApi';
import { PrefixedId } from '@alef/common';
import { Box, Button, Dialog, Icon, Text } from '@alef/sys';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export interface FurnitureModelUploadProps {
	furnitureId: PrefixedId<'f'>;
}

export function FurnitureModelUpload({ furnitureId }: FurnitureModelUploadProps) {
	const queryClient = useQueryClient();
	const [directory, setDirectory] = useState<FileList | null>(null);
	const { error } = useValidateModelDirectory(directory);
	const uploadModels = useUploadFurnitureModels();

	const [loading, setLoading] = useState(false);
	const upload = async () => {
		if (!directory) return;
		setLoading(true);
		try {
			await uploadModels(furnitureId, Array.from(directory));
			setDirectory(null);
		} finally {
			queryClient.invalidateQueries({
				queryKey: ['furniture'],
			});
			setLoading(false);
		}
	};

	return (
		<div>
			<input
				type="file"
				multiple
				ref={(val) => {
					if (val) {
						val.webkitdirectory = true;
					}
				}}
				hidden
				id={`model-upload-${furnitureId}`}
				style={{ visibility: 'hidden', position: 'absolute', zIndex: -1 }}
				onChange={async (ev) => {
					const files = ev.target.files;
					if (files) {
						setDirectory(files);
					}
				}}
			/>
			<Button asChild color="suggested">
				<label htmlFor={`model-upload-${furnitureId}`}>
					<Icon name="upload" /> Upload/Replace
				</label>
			</Button>
			<Dialog
				open={!!directory}
				onOpenChange={(open) => {
					if (!open) {
						setDirectory(null);
					}
				}}
			>
				<Dialog.Content title="Upload/replace models">
					{error && (
						<Box p="small" style={{ backgroundColor: 'var(--color-destructive-paper)' }}>
							{error}
						</Box>
					)}
					{directory && (
						<Box stacked gapped>
							<Text>These models will be replaced</Text>
							<Text strong>Note: you should refresh the snapshot once this is done.</Text>
							{Array.from(directory).map((file) => (
								<Box key={file.name}>{file.webkitRelativePath}</Box>
							))}
						</Box>
					)}
					<Dialog.Actions>
						<Dialog.Close asChild>
							<Button>Cancel</Button>
						</Dialog.Close>
						<Button loading={loading} disabled={!!error} color="suggested" onClick={upload}>
							Upload
						</Button>
					</Dialog.Actions>
				</Dialog.Content>
			</Dialog>
		</div>
	);
}
