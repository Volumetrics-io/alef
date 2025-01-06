import type { Meta, StoryObj } from '@storybook/react';
import { BoxIcon } from 'lucide-react';
import { useState } from 'react';
import { Box } from './box/Box.js';
import { Button } from './button/Button.js';
import { Dialog } from './dialog/Dialog.js';
import { Input } from './input/Input.js';

const meta = {
	title: 'Kitchen Sink',
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const KitchenSink: Story = {
	render(args) {
		const [open, setOpen] = useState(false);
		return (
			<Box stacked>
				<Input.Root>
					<Input.Slot stacked>
						<BoxIcon />
						<BoxIcon />
						<BoxIcon />
						<BoxIcon />
					</Input.Slot>
					<Input.Field value="Hello world!" />
				</Input.Root>

				<Box>
					<Input value="hello world" />
					<Button>
						<BoxIcon />
						Submit
					</Button>
				</Box>

				<Dialog open={open} onOpenChange={setOpen} {...args}>
					<Dialog.Trigger asChild>
						<Box>
							<Button>Open dialog</Button>
						</Box>
					</Dialog.Trigger>
					<Dialog.Content title="Hi there this is a very long title!!">
						<Box stacked>
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
						</Box>
					</Dialog.Content>
				</Dialog>
			</Box>
		);
	},
};
