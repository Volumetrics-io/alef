import type { Meta, StoryObj } from '@storybook/react';
import { Toolbar } from './Toolbar.js';
import { Avatar } from '../avatar/Avatar.js';
import { Button } from '../button/Button.js';

const meta = {
	title: 'Toolbar',
	component: Toolbar,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
		layout: 'fullscreen',
	},
} satisfies Meta<typeof Toolbar>;

export default meta;

type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
	render(args) {
		return (
			<Toolbar {...args}>
				<Avatar />
				<Button>Button</Button>
			</Toolbar>
		);
	},
};
