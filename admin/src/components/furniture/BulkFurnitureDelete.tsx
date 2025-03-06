import { adminApiClient } from '@/services/adminApi';
import { queryClient } from '@/services/queryClient';
import { Attribute } from '@alef/common';
import { Box, Button, Dialog, Frame, Text } from '@alef/sys';
import { Suspense, useState } from 'react';
import toast from 'react-hot-toast';
import { FilteredFurnitureGrid, useFilteredFurniture } from './FilteredFurniture';
import { MultiAttributePicker } from './MultiAttributePicker';

export function BulkFurnitureDelete() {
	const [filters, setFilters] = useState<Attribute[]>([]);

	const { data: furniture } = useFilteredFurniture(filters, {
		enabled: filters.length > 0,
	});

	const [deleting, setDeleting] = useState(false);
	const deleteAll = async () => {
		if (!furniture) return;
		if (filters.length === 0) return;

		try {
			setDeleting(true);
			const furnitureItems = furniture.pages.flatMap(page => page.items);
			const ids = furnitureItems.map((f) => f.id);
			const results = await Promise.allSettled(ids.map((id: string) => adminApiClient.furniture[':id'].$delete({ param: { id } })));
			if (results.some((res: PromiseSettledResult<any>) => res.status === 'rejected')) {
				console.error(results.filter((res: PromiseSettledResult<any>) => res.status === 'rejected'));
				toast.error('Some furniture failed to delete. See console logs.');
			}
			toast.success('All furniture deleted');
			queryClient.refetchQueries({ queryKey: ['furniture'] });
		} finally {
			setDeleting(false);
		}
	};

	return (
		<Dialog>
			<Dialog.Trigger asChild>
				<Button color="destructive">Bulk Delete</Button>
			</Dialog.Trigger>
			<Dialog.Content width="large" title="Bulk furniture delete">
				<Dialog.Description>Delete all furniture that matches the provided filters.</Dialog.Description>
				<Frame p grow>
					<MultiAttributePicker value={filters} onChange={setFilters} />
				</Frame>
				<Suspense>{filters.length > 0 ? <FilteredFurnitureGrid furniture={furniture ? furniture.pages.flatMap(page => page.items) : []} /> : <Box p>No filters selected</Box>}</Suspense>
				<Dialog.Actions>
					<Dialog.Close asChild>
						<Button>Done</Button>
					</Dialog.Close>
					<Box gapped align="center">
						<Text>This cannot be undone.</Text>
						<Button disabled={filters.length === 0} loading={deleting} color="destructive" onClick={deleteAll}>
							Delete All
						</Button>
					</Box>
				</Dialog.Actions>
			</Dialog.Content>
		</Dialog>
	);
}
