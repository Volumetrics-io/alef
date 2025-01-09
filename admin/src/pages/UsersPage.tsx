import { adminApiClient } from '@/services/adminApi';
import { Box, Button, Form, Frame, Heading, Icon } from '@alef/sys';
import { Link } from '@verdant-web/react-router';
import toast from 'react-hot-toast';

const UsersPage = () => {
	return (
		<Box stacked full align="start" gapped>
			<Box gapped align="center">
				<Button asChild color="ghost">
					<Link to="/">
						<Icon name="arrow-left" />
					</Link>
				</Button>
				<Heading>Users</Heading>
			</Box>
			<Frame p stacked gapped>
				<Heading level={2}>New User</Heading>
				<Form
					initialValues={{
						email: '',
						name: '',
						password: '',
					}}
					onSubmit={async (values) => {
						await adminApiClient.users.$post({
							json: values,
						});
						toast.success('User created. They can log in to the main app now.');
					}}
				>
					<Form.TextField label="Email" name="email" required />
					<Form.TextField label="Name" name="name" required />
					<Form.TextField label="Password" name="password" type="password" required />
					<Form.Submit>Create User</Form.Submit>
				</Form>
			</Frame>
		</Box>
	);
};

export default UsersPage;
