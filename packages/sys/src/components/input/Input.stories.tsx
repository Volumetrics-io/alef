import type { Meta, StoryObj } from '@storybook/react';
import { BoxIcon } from 'lucide-react';
import { Input, InputField, InputRoot, InputSlot } from './Input.js';

const meta = {
	title: 'Input',
	component: Input,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithStartSlot: Story = {
	render({ wrap: _, ...args }) {
		return (
			<InputRoot {...args}>
				<InputSlot stacked>
					<BoxIcon size="12px" />
				</InputSlot>
				<InputField />
			</InputRoot>
		);
	},
};

export const WithTextArea: Story = {
	render(args) {
		return <Input multiline {...args} />;
	},
};
