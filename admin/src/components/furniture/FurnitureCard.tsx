import { adminApiClient } from '@/services/adminApi';
import { FurnitureData } from '@/services/publicApi';
import { queryClient } from '@/services/queryClient';
import { handleErrors } from '@/services/utils';
import { Box, Button, Card, Dialog, Form, Frame, Icon, Input, ScrollArea } from '@alef/sys';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AttributesField } from './AttributesField';
import { FurnitureModelUpload } from './FurnitureModelUpload';
import { FurniturePreview } from './FurniturePreview';
import { FurnitureSnapshot } from './FurnitureSnapshot';
export interface FurnitureCardProps {
	furniture: FurnitureData;
}

export function FurnitureCard({ furniture }: FurnitureCardProps) {
	const [open, setOpen] = useState(false);
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

	return (
		<Card key={furniture.id}>
			<Dialog open={open} onOpenChange={setOpen}>
				<Dialog.Trigger asChild>
					<Card.Main align="center">
						<FurnitureSnapshot furnitureId={furniture.id} />
						<Box float="top-left" gapped align="center" wrap>
							{furniture.measuredDimensionsX && (
								<Frame p="squeeze">
									{furniture.measuredDimensionsX.toFixed(2)}x{furniture.measuredDimensionsY?.toFixed(2)}x{furniture.measuredDimensionsZ?.toFixed(2)}
								</Frame>
							)}
							{furniture.attributes.map((attr: { key: string; value: string }) => (
								<Frame key={`${attr.key}:${attr.value}`} p="squeeze">
									{attr.key}: {attr.value}
								</Frame>
							))}
						</Box>
					</Card.Main>
				</Dialog.Trigger>
				<Dialog.Content title={furniture.name}>
					<ScrollArea>
						<FurnitureEditorContent furniture={furniture} />
						<FurniturePreview furnitureId={furniture.id} key={furniture.modelUpdatedAt} nonce={furniture.modelUpdatedAt} />
					</ScrollArea>
				</Dialog.Content>
			</Dialog>
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

function AttributesEditor({ furniture }: { furniture: FurnitureData }) {
	const value = furniture.attributes;

	const { mutateAsync: updateAttributes } = useMutation({
		mutationFn: async (data: { key: string; value: string }[]) => {
			await Promise.all(
				data.map((attribute) => {
					return handleErrors(adminApiClient.furniture[':id'].attribute.$put({ param: { id: furniture.id }, json: attribute }));
				})
			);
			// remove any attributes that are not in the new list
			for (const oldAttribute of value) {
				if (!data.find((newAttribute) => newAttribute.key === oldAttribute.key && newAttribute.value === oldAttribute.value)) {
					await handleErrors(adminApiClient.furniture[':id'].attribute.$delete({ param: { id: furniture.id }, json: oldAttribute }));
				}
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['furniture'],
			});
		},
	});

	return (
		<Form
			initialValues={{ attributes: value }}
			onSubmit={async (values) => {
				await updateAttributes(values.attributes);
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
	);
}

function FurnitureEditorContent({ furniture }: { furniture: FurnitureData }) {
	return (
		<Box stacked>
			<AttributesEditor furniture={furniture} />
		</Box>
	);
}
