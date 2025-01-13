import { Button, Frame, Icon } from '@alef/sys';

export interface AttributePillProps {
	attribute: { key: string; value: string };
	onRemove: () => void;
}

export function AttributePill({ attribute, onRemove }: AttributePillProps) {
	return (
		<Frame align="center" p="squeeze">
			{attribute.key}: {attribute.value}
			<Button color="ghost" onClick={onRemove}>
				<Icon name="x" />
			</Button>
		</Frame>
	);
}
