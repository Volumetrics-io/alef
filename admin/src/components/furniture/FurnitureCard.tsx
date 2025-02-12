import { adminApiClient } from '@/services/adminApi';
import { FurnitureData } from '@/services/publicApi';
import { queryClient } from '@/services/queryClient';
import { handleErrors } from '@/services/utils';
import { Box, Button, Card, Dialog, Form, Frame, Icon, Input } from '@alef/sys';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AttributesField } from './AttributesField';
import { FurnitureModelUpload } from './FurnitureModelUpload';
import { FurniturePreview } from './FurniturePreview';

export interface FurnitureCardProps {
	furniture: FurnitureData;
}

export function FurnitureCard({ furniture }: FurnitureCardProps) {
	const { mutate: deleteSelf, isPending: isDeleting } = useMutation({
		mutationFn: () => handleErrors(adminApiClient.furniture[':id'].$delete({ param: { id: furniture.id } })),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['furniture'],
			});
		},
	});

	const { mutate: updateSelf, isPending: isUpdating } = useMutation({
		mutationFn: (data: { name: string }) => handleErrors(adminApiClient.furniture[':id'].$put({ param: { id: furniture.id }, json: data })),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['furniture'],
			});
		},
	});

	const { mutateAsync: updateAttributes } = useMutation({
		mutationFn: async (data: { key: string; value: string }[]) => {
			await Promise.all(data.map((attribute) => handleErrors(adminApiClient.furniture[':id'].attribute.$put({ param: { id: furniture.id }, json: attribute }))));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['furniture'],
			});
		},
	});

	return (
		<Card key={furniture.id}>
			<Card.Main>
				<FurniturePreview furnitureId={furniture.id} key={furniture.modelUpdatedAt} nonce={furniture.modelUpdatedAt} />
				<Box float="top-left" gapped align="center">
					<AttributesEditor value={furniture.attributes} onChange={updateAttributes} />
					{furniture.attributes.map((attr) => (
						<Frame key={attr.key} p="squeeze">
							{attr.key}: {attr.value}
						</Frame>
					))}
				</Box>
			</Card.Main>
			<Card.Details justify="between">
				<NameEditor value={furniture.name} onChange={(name) => updateSelf({ name })} disabled={isUpdating} />
				<Box gapped>
					<FurnitureModelUpload furnitureId={furniture.id} />
					<Button color="destructive" onClick={() => deleteSelf()} loading={isDeleting}>
						<Icon name="trash" />
					</Button>
				</Box>
			</Card.Details>
		</Card>
	);
}

function NameEditor({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
	const [localValue, setLocalValue] = useState(value);
	useEffect(() => {
		setLocalValue(value);
	}, [value]);
	return (
		<Box>
			<Input value={localValue} onValueChange={setLocalValue} disabled={disabled} />
			{localValue !== value && (
				<Button color="suggested" onClick={() => onChange(localValue)} disabled={disabled}>
					<Icon name="check" />
				</Button>
			)}
		</Box>
	);
}

function AttributesEditor({ value, onChange }: { value: { key: string; value: string }[]; onChange: (value: { key: string; value: string }[]) => Promise<void> }) {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<Button color="ghost">
					<Icon name="pencil" />
				</Button>
			</Dialog.Trigger>
			<Dialog.Content title="Edit attributes">
				<Form
					initialValues={{ attributes: value }}
					onSubmit={async (values) => {
						await onChange(values.attributes);
						setOpen(false);
					}}
				>
					<AttributesField name="attributes" />
					<Dialog.Actions>
						<Dialog.Close asChild>
							<Button>Cancel</Button>
						</Dialog.Close>
						<Form.Submit>Save</Form.Submit>
					</Dialog.Actions>
				</Form>
			</Dialog.Content>
		</Dialog>
	);
}
