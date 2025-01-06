import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox.js';
import { useState } from 'react';

const meta = {
	title: 'Checkbox',
	component: Checkbox,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
	render(args) {
		const [checked, setChecked] = useState(args.checked);
		return <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />;
	},
};
