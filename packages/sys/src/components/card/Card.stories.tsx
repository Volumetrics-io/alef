import type { Meta, StoryObj } from '@storybook/react';
import { HeartIcon } from 'lucide-react';
import { Avatar } from '../avatar/Avatar.js';
import { Box } from '../box/Box.js';
import { Text } from '../text/Text.js';
import { Card } from './Card.js';

const meta = {
	title: 'Card',
	component: Card,
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
	render() {
		return (
			<Card.Grid>
				<Card>
					<Card.Main>
						<img src="/assets/images/logo.png" width="200px" style={{ objectFit: 'cover', flex: 1 }} />
					</Card.Main>
					<Card.Details>
						<Avatar />
						<Box stacked>
							<strong>Grant</strong>
							<i>@grant</i>
						</Box>
					</Card.Details>
				</Card>
				<Card>
					<Card.Main asChild>
						<a href="#">
							<img src="/assets/images/logo.png" width="200px" height="100%" style={{ objectFit: 'cover' }} />
						</a>
					</Card.Main>
				</Card>
			</Card.Grid>
		);
	},
};

export const Rows: Story = {
	render() {
		return (
			<Box stacked gapped container>
				<Card>
					<Card.Main stacked>
						<img src="/assets/images/logo.png" width="200px" style={{ objectFit: 'cover', flex: 1 }} />
						<Box>
							<Box stacked>
								<strong>Project name</strong>
								<i>project description blah blah</i>
							</Box>
						</Box>
					</Card.Main>
					<Card.Details>
						<Text>@author</Text>
						<Box gapped layout="center center">
							<HeartIcon size={18} />
							180
						</Box>
					</Card.Details>
				</Card>
				<Card>
					<Card.Main asChild>
						<a href="#">
							<img src="/assets/images/logo.png" width="200px" height="100%" style={{ objectFit: 'cover' }} />
						</a>
					</Card.Main>
				</Card>
			</Box>
		);
	},
};
