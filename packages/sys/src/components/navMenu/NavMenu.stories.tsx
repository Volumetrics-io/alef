import type { Meta, StoryObj } from '@storybook/react';
import { NavMenu } from './NavMenu.js';
import { Button } from '../button/Button.js';
import { BoxIcon } from 'lucide-react';
import { Icon } from '../icon/Icon.js';
import { Text } from '../text/Text.js';
const meta = {
	title: 'NavMenu',
	component: NavMenu,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof NavMenu>;

export default meta;

type Story = StoryObj<typeof NavMenu>;

export const Default: Story = {
	render() {
		return (
			<NavMenu>
				<NavMenu.Trigger asChild>
					<Button>
						<Icon name="discord" />
					</Button>
				</NavMenu.Trigger>
				<NavMenu.Content>
					<NavMenu.Item>
						<NavMenu.ItemIcon>
							<BoxIcon />
						</NavMenu.ItemIcon>
						<Text>Item 1</Text>
					</NavMenu.Item>
					<NavMenu.Item>Item 2</NavMenu.Item>
					<NavMenu.Item>Item 3</NavMenu.Item>
					<NavMenu.Item>See all ...</NavMenu.Item>
				</NavMenu.Content>
			</NavMenu>
		);
	},
};
