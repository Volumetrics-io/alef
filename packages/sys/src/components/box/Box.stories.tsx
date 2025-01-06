import type { Meta, StoryObj } from '@storybook/react';
import { Frame } from '../frame/Frame.js';
import { Box } from './Box.js';

const meta = {
	title: 'Box',
	component: Box,
	argTypes: {
		rounded: {
			options: [true, 'full', false],
		},
		reverse: {
			options: [true, false, 'mobile'],
		},
		stacked: {
			options: [true, 'mobile', false],
		},
	},
	args: {
		full: false,
		padded: false,
		clipped: false,
		elevated: false,
		rounded: false,
		spread: false,
		stretched: false,
		constrained: false,
		mobileHidden: false,
		stacked: false,
		float: 'none',
		gapped: false,
		container: false,
		wrap: false,
		align: undefined,
		justify: undefined,
		reverse: false,
	},
	parameters: {
		controls: { expanded: true },
		layout: 'fullscreen',
	},
} satisfies Meta<typeof Box>;

export default meta;

type Story = StoryObj<typeof Box>;

export const Default: Story = {
	render: (args) => (
		<Box {...args}>
			<Frame padded>Content 1</Frame>
			<Frame padded>Content 2</Frame>
		</Box>
	),
};
