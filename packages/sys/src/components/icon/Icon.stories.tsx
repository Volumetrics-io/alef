import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon.js';
import { Box } from '../box/Box.js';
import { iconNames } from './iconNames.js';

const meta = {
	title: 'Icon',
	component: Icon,
	argTypes: {
		name: {
			options: iconNames,
		},
	},
	args: {
		name: 'remix',
	},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {
	render(args) {
		return <Icon {...args} />;
	},
	parameters: {
		display: 'centered',
	},
};

export const AllIcons: Story = {
	render(args) {
		return (
			<Box wrap gapped>
				{iconNames.map((name) => (
					<Icon key={name} name={name} />
				))}
			</Box>
		);
	},
};

export const CustomIcon: Story = {
	render(args) {
		return (
			<Icon>
				<span>😀</span>
			</Icon>
		);
	},
};
