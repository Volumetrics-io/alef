import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch.js';
import { useState } from 'react';

const meta = {
	title: 'Switch',
	component: Switch,
	argTypes: {
		checked: { control: 'boolean' },
		onCheckedChange: { action: 'checked' },
	},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
	render(args) {
		const [checked, setChecked] = useState(args.checked ?? false);

		return <Switch {...args} checked={checked} onCheckedChange={setChecked} />;
	},
	args: {
		checked: false,
	},
};
