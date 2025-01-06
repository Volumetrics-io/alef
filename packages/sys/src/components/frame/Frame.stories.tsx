import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../box/Box.js';
import { Frame } from './Frame.js';

const meta = {
	title: 'Frame',
	component: Frame,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Frame>;

export default meta;

type Story = StoryObj<typeof Frame>;

export const Default: Story = {
	render(args) {
		return (
			<Frame {...args}>
				<Box padded stacked>
					<Box>Stuff</Box>
					<Box>Stuff</Box>
				</Box>
			</Frame>
		);
	},
};
