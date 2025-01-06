import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from './Dialog.js';
import { Button } from '../button/Button.js';
import { useState } from 'react';

const meta = {
	title: 'Dialog',
	component: Dialog,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
	render(args) {
		const [open, setOpen] = useState(false);
		return (
			<Dialog open={open} onOpenChange={setOpen} {...args}>
				<Dialog.Trigger asChild>
					<Button>Open dialog</Button>
				</Dialog.Trigger>
				<Dialog.Content title="Hi there this is a very long title!!">
					<div>Hey there</div>
					<div>Hey there</div>
					<div>Hey there</div>
					<div>Hey there</div>
					<div>Hey there</div>
					<Dialog.Actions>
						<Dialog.Close asChild>
							<Button>Cancel</Button>
						</Dialog.Close>
						<Dialog.Close asChild>
							<Button color="suggested">Save</Button>
						</Dialog.Close>
					</Dialog.Actions>
				</Dialog.Content>
			</Dialog>
		);
	},
};
