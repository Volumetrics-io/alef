import type { Meta, StoryObj } from '@storybook/react';
import { NavBar } from './NavBar.js';
import { Button } from '../button/Button.js';
import { Avatar } from '../avatar/Avatar.js';
import { Box } from '../box/Box.js';
import { useState } from 'react';
import { Switch } from '../switch/Switch.js';
import { Logo } from '../logo/Logo.js';

const meta = {
	title: 'NavBar',
	component: NavBar,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
		layout: 'fullscreen',
	},
} satisfies Meta<typeof NavBar>;

export default meta;

type Story = StoryObj<typeof NavBar>;

export const Default: Story = {
	render() {
		const [show, setShow] = useState(true);
		return (
			<Box>
				{show && (
					<NavBar>
						<NavBar.Start>
							<Logo />
						</NavBar.Start>
						<NavBar.End>
							<Button>Log in • Sign up</Button>
							<Button>Go to</Button>
							<Avatar />
						</NavBar.End>
					</NavBar>
				)}
				<div
					style={{
						height: 'var(--nav-height, 0)',
						background: 'var(--happy-paper)',
						overflow: 'hidden',
					}}
				>
					Navbar height mimic
				</div>
				<div>
					Hide:
					<Switch checked={show} onCheckedChange={setShow} />
				</div>
			</Box>
		);
	},
};
