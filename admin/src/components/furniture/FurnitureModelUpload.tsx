import { adminApiClient } from '@/services/adminApi';
import { Button, Icon } from '@alef/sys';
import toast from 'react-hot-toast';

export interface FurnitureModelUploadProps {
	furnitureId: string;
}

export function FurnitureModelUpload({ furnitureId }: FurnitureModelUploadProps) {
	return (
		<div>
			<input
				type="file"
				hidden
				id={`model-upload-${furnitureId}`}
				style={{ visibility: 'hidden', position: 'absolute', zIndex: -1 }}
				onChange={async (ev) => {
					const file = (ev.target as HTMLInputElement).files?.[0];
					if (!file) return;
					const formData = new FormData();
					formData.append('model', file);
					try {
						await adminApiClient.furniture[':id'].model.$put({
							param: {
								id: furnitureId,
							},
							form: {
								file,
							},
						});
					} catch (err) {
						console.error(err);
						toast.error('Error uploading model, check console');
					} finally {
						ev.target.value = '';
					}
				}}
			/>
			<Button asChild>
				<label htmlFor={`model-upload-${furnitureId}`}>
					<Icon name="upload" />
				</label>
			</Button>
		</div>
	);
}
