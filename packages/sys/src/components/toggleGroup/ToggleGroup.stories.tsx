import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ToggleGroup } from './ToggleGroup.js';

const meta = {
	title: 'ToggleGroup',
	component: ToggleGroup,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {
	render(args) {
		const [value, setValue] = useState('one');
		return (
			<ToggleGroup type="single" value={value} onValueChange={setValue} {...(args as any)}>
				<ToggleGroup.Item value="one">Item One</ToggleGroup.Item>
				<ToggleGroup.Item value="two">Item Two</ToggleGroup.Item>
				<ToggleGroup.Item value="three">Item Three</ToggleGroup.Item>
			</ToggleGroup>
		);
	},
};
