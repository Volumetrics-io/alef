import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../box/Box.js';
import { Button } from '../button/Button.js';
import { Popover } from './Popover.js';

const meta = {
	title: 'Popover',
	component: Popover,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
	render(args) {
		return (
			<Popover>
				<Popover.Trigger asChild>
					<Button>Open</Button>
				</Popover.Trigger>
				<Popover.Content>
					<Box p>Hello there</Box>
				</Popover.Content>
			</Popover>
		);
	},
};
