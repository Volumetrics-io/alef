import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu } from './DropdownMenu.js';
import { Button } from '../button/Button.js';
import { BoxIcon } from 'lucide-react';
import { Icon } from '../icon/Icon.js';

const meta = {
	title: 'DropdownMenu',
	component: DropdownMenu,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
	render() {
		return (
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>
						<Icon name="discord" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item>
						<DropdownMenu.ItemIcon>
							<BoxIcon />
						</DropdownMenu.ItemIcon>
						<DropdownMenu.ItemLabel>Item 1</DropdownMenu.ItemLabel>
					</DropdownMenu.Item>
					<DropdownMenu.Item>Item 2</DropdownMenu.Item>
					<DropdownMenu.Item>Item 3</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>See all ...</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu>
		);
	},
};
