import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './Link.js';
import { Button } from '../button/Button.js';

const meta = {
	title: 'Link',
	component: Link,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof Link>;

export const Text: Story = {
	render(args) {
		return (
			<Link {...args} text>
				Link
			</Link>
		);
	},
};

export const NewTab: Story = {
	render(args) {
		return (
			<Link {...args} text newTab>
				External Link
			</Link>
		);
	},
};

export const AsButton: Story = {
	render(args) {
		return (
			<Button asChild>
				<Link {...args}>Button link</Link>
			</Button>
		);
	},
};

export const AsButtonNewTab: Story = {
	render(args) {
		return (
			<Button asChild>
				<Link newTab {...args}>
					Button link
				</Link>
			</Button>
		);
	},
};
