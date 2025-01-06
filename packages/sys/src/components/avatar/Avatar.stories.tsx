import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar.js';
import { Button } from '../button/Button.js';

const meta = {
	title: 'Avatar',
	component: Avatar,
	argTypes: {},
	args: {
		name: 'Grant',
	},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const Interactive: Story = {
	render(args) {
		return (
			<Button asChild onClick={() => alert(`Hi, ${args.name}`)}>
				<Avatar {...args} />
			</Button>
		);
	},
};
