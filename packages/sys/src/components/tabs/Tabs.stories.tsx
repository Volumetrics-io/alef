import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs.js';

const meta = {
	title: 'Tabs',
	component: Tabs,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
	render(args) {
		return (
			<Tabs {...args}>
				<Tabs.List>
					<Tabs.Trigger value="one">One</Tabs.Trigger>
					<Tabs.Trigger value="two">Two</Tabs.Trigger>
					<Tabs.Trigger value="three">Three</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="one">One content</Tabs.Content>
				<Tabs.Content value="two">Two content</Tabs.Content>
				<Tabs.Content value="three">Three content</Tabs.Content>
			</Tabs>
		);
	},
};
