import { useCreateProperty } from '@/services/publicApi/propertyHooks';
import { Button, Dialog, Form, Icon } from '@alef/sys';
import { useNavigate } from '@verdant-web/react-router';
import { useState } from 'react';

export interface CreateProjectProps {
	className?: string;
}

export function CreateProject({ className }: CreateProjectProps) {
	const createProject = useCreateProperty();
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<Button color="suggested" className={className}>
					<Icon name="plus" />
					Create Project
				</Button>
			</Dialog.Trigger>
			<Dialog.Content title="New project">
				<Form
					initialValues={{ name: '' }}
					onSubmit={async ({ name }) => {
						const project = await createProject.mutateAsync({ name });
						setOpen(false);
						navigate(`/projects/${project.id}`);
					}}
				>
					<Form.TextField name="name" label="Project Name" placeholder="My Project" />
					<Form.Submit pristineContent="Saved">Create</Form.Submit>
				</Form>
			</Dialog.Content>
		</Dialog>
	);
}
