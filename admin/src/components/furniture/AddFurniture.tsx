import { adminApiClient } from '@/services/adminApi';
import { Box, Form, Heading } from '@alef/sys';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AttributesField } from './AttributesField';

export function AddFurniture() {
	const queryClient = useQueryClient();
	return (
		<Box stacked gapped>
			<Heading level={3}>Add single piece</Heading>
			<Form
				initialValues={{
					name: '',
					attributes: [] as { key: string; value: string }[],
				}}
				onSubmit={async (values, tools) => {
					const response = await adminApiClient.furniture.$post({
						json: values,
					});
					if (!response.ok) {
						toast.error('Error creating furniture');
						return;
					}
					toast.success('Furniture created');
					queryClient.invalidateQueries({ queryKey: ['furniture'] });
					tools.resetForm();
				}}
			>
				<Form.TextField label="Name" name="name" required />
				<AttributesField name="attributes" />
				<Form.Submit>Create Furniture</Form.Submit>
			</Form>
		</Box>
	);
}
