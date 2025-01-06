import type { Meta, StoryObj } from '@storybook/react';
import { Control } from './Control.js';

const meta = {
	title: 'Control',
	component: Control,
	argTypes: {},
	args: {
		children: 'Hello world',
	},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Control>;

export default meta;

type Story = StoryObj<typeof Control>;

export const Default: Story = {
	render: (args) => <Control {...args} />,
};
