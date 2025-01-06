import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from './heading/Heading.js';
import { Text } from './text/Text.js';

const meta = {
	title: 'Typography',
	argTypes: {},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta;

export default meta;

export const Typography: StoryObj = {
	render() {
		return (
			<div>
				<Heading level={1}>Heading 1</Heading>
				<Heading level={2}>Heading 2</Heading>
				<Heading level={3}>Heading 3</Heading>
				<Heading level={4}>Heading 4</Heading>
				<Text as="p">
					A standard text paragraph, with <strong>bold text</strong>, <em>italics text</em>, internal links, external links or tokens.
				</Text>
			</div>
		);
	},
};
