import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from './Hero.js';
import { Box } from '../box/Box.js';
import { NavBar } from '../navBar/NavBar.js';
import { Button } from '../button/Button.js';
import { Logo } from '../logo/Logo.js';

const meta = {
	title: 'Hero',
	component: Hero,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
		layout: 'fullscreen',
	},
} satisfies Meta<typeof Hero>;

export default meta;

type Story = StoryObj<typeof Hero>;

export const Default: Story = {
	render(args) {
		return (
			<Hero {...args} style={{ height: '80vh', background: 'var(--happy-paper)' }}>
				<Hero.Title>Spatial app development made easy.</Hero.Title>
				<Hero.Tagline>Design, develop, and deploy without ever taking off your headset.</Hero.Tagline>
			</Hero>
		);
	},
};

export const WithNavBar: Story = {
	render(args) {
		return (
			<Box>
				<NavBar>
					<NavBar.Start>
						<Logo />
					</NavBar.Start>
					<NavBar.End>
						<Button>Log in • Sign up</Button>
					</NavBar.End>
				</NavBar>
				<Hero {...args} style={{ height: '80vh', background: 'var(--happy-paper)' }}>
					<Hero.Title>Spatial app development made easy.</Hero.Title>
					<Hero.Tagline>Design, develop, and deploy without ever taking off your headset.</Hero.Tagline>
				</Hero>
			</Box>
		);
	},
};
