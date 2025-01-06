import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip.js';
import { Button } from '../button/Button.js';

const meta = {
	title: 'Tooltip',
	component: Tooltip,
	argTypes: {},
	args: {
		content: 'Hello there!',
	},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
	render(args) {
		return (
			<Tooltip {...args}>
				<Button>Hover me</Button>
			</Tooltip>
		);
	},
};
