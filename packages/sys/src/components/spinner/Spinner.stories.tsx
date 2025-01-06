import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner.js';

const meta = {
	title: 'Spinner',
	component: Spinner,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
	render(args) {
		return <Spinner {...args} />;
	},
};

export const InheritsColor: Story = {
	render(args) {
		return (
			<div style={{ color: 'var(--focus)' }}>
				<Spinner {...args} />
			</div>
		);
	},
};
