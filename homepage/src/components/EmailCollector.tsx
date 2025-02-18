import { Box, Form, Frame, Heading, Text } from '@alef/sys';
import { PUBLIC_API_ORIGIN } from 'astro:env/client';
import { useState } from 'react';

export interface EmailCollectorProps {}

export function EmailCollector({}: EmailCollectorProps) {
	const [submitted, setSubmitted] = useState(false);

	return (
		<Frame p stacked gapped>
			<Heading level={2}>Request a demo</Heading>
			<Text>Ready to see Alef in action? Fill out the form below to request a demo.</Text>
			{submitted ? (
				<Box p>
					<Text>Thanks for your interest! We'll be in touch soon.</Text>
				</Box>
			) : (
				<Form
					initialValues={{ email: '' }}
					onSubmit={async (data) => {
						const res = await fetch(`${PUBLIC_API_ORIGIN ?? 'https://api.alef.io'}/users/requestDemo`, {
							method: 'POST',
							body: JSON.stringify({ email: data.email }),
							headers: {
								'Content-Type': 'application/json',
							},
						});
						if (!res.ok) {
							alert('Oops, looks like the email form is broken.');
						}
						setSubmitted(true);
					}}
				>
					<Form.TextField label="Email" name="email" type="email" />
					<Form.Submit>Submit</Form.Submit>
				</Form>
			)}
		</Frame>
	);
}
