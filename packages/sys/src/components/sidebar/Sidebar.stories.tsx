import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './Sidebar.js';
import { Link } from '../link/Link.js';
import { Icon } from '../icon/Icon.js';

const meta = {
	title: 'Sidebar',
	component: Sidebar,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
	render(args) {
		return (
			<Sidebar {...args}>
				<Sidebar.Item asChild>
					<Link to="#">
						<Icon name="info" />
						<Sidebar.Label>Projects</Sidebar.Label>
					</Link>
				</Sidebar.Item>
				<Sidebar.Item asChild>
					<Link to="#">
						<Icon name="box" />
						<Sidebar.Label>Assets</Sidebar.Label>
					</Link>
				</Sidebar.Item>
				<Sidebar.Item asChild>
					{/* active applied for demonstration only */}
					<Link to="#" data-active>
						<Icon name="code" />
						<Sidebar.Label>Code</Sidebar.Label>
					</Link>
				</Sidebar.Item>
				<Sidebar.Item asChild>
					<Link to="#">
						<Icon name="terminal" />
						<Sidebar.Label>Console</Sidebar.Label>
					</Link>
				</Sidebar.Item>
			</Sidebar>
		);
	},
};
