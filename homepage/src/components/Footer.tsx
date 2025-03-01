import { Box, Link, Text, type ToolbarProps } from '@alef/sys';

export function Footer(props: ToolbarProps) {
	const currentYear = new Date().getFullYear();
	return (
		<Box padded="squeeze" background="paper">
			<Box padded align="start" justify="between" gapped full stacked="mobile" {...props}>
				<Text>ⓒ {currentYear} Volumetrics, Inc</Text>
				<Box gapped stacked="mobile" wrap>
					{[
						{ to: '/tos', label: 'Terms of Service' },
						{ to: '/privacy', label: 'Privacy Policy' },
					].map(({ to, label }) => (
						<Link text key={label} to={to}>
							{label}
						</Link>
					))}
				</Box>
			</Box>
		</Box>
	);
}
