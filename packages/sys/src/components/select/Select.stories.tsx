import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select.js';

const meta = {
	title: 'Select',
	component: Select,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
	render(args) {
		return (
			<Select {...args}>
				<Select.Item value="a">Item A</Select.Item>
				<Select.Item value="b">Item B</Select.Item>
				<Select.Item value="c">Item C</Select.Item>
				<Select.Item value="d">Item D</Select.Item>
				<Select.Item value="e">Item E</Select.Item>
				<Select.Item value="f">Item F</Select.Item>
			</Select>
		);
	},
};
