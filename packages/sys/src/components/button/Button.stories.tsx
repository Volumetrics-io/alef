import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button.js';
import { Box } from '../box/Box.js';
import { Icon } from '../icon/Icon.js';

const meta = {
	title: 'Button',
	component: Button,
	argTypes: {
		loading: {
			control: 'boolean',
		},
		color: {
			type: 'string',
			options: ['default', 'suggested', 'destructive'],
			control: 'select',
		},
	},
	args: {
		children: 'Hello world',
	},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const WithIcon: Story = {
	render(args) {
		return (
			<Button {...args}>
				<Icon name="remix" />
				Hello world
			</Button>
		);
	},
};

export const OnlyIcon: Story = {
	render(args) {
		return (
			<Button {...args}>
				<Icon name="remix" />
			</Button>
		);
	},
};

export const ResponsiveLabel: Story = {
	render(args) {
		return (
			<Button {...args}>
				<Icon name="remix" />
				<Button.ResponsiveLabel>I'm responsive!</Button.ResponsiveLabel>
			</Button>
		);
	},
};

export const AsLink: Story = {
	render(args) {
		return (
			<Button {...args} asChild>
				<a href="#">Hello world</a>
			</Button>
		);
	},
};

export const FloatingActionButton: Story = {
	render(args) {
		return (
			<Box full style={{ height: 300 }} background="paper">
				<Button {...args} variant="action" float="top-right">
					<Icon name="camera" />
				</Button>
			</Box>
		);
	},
};
