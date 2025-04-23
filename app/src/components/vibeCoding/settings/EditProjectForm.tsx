import { useProperty, useUpdateProperty } from '@/services/publicApi/propertyHooks';
import { PrefixedId } from '@alef/common';
import { Form } from '@alef/sys';

export interface EditProjectFormProps {
	projectId: PrefixedId<'p'>;
}

export function EditProjectForm({ projectId }: EditProjectFormProps) {
	const { data: project } = useProperty(projectId); // note: projects are reused properties -- someday, rename this.
	const updateMutation = useUpdateProperty(projectId);

	return (
		<Form
			initialValues={{
				name: project.name,
			}}
			enableReinitialize
			onSubmit={async ({ name }) => {
				await updateMutation.mutateAsync({ name });
			}}
		>
			<Form.TextField name="name" label="Project Name" placeholder="My Project" />
			<Form.Submit pristineContent="Saved">Save</Form.Submit>
		</Form>
	);
}
