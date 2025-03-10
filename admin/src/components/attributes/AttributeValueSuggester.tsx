import { publicApiClient } from '@/services/publicApi';
import { handleErrors } from '@/services/utils';
import { AttributeKey } from '@alef/common';
import { Control, Input, Popover } from '@alef/sys';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export interface AttributeValueSuggesterProps {
	attributeKey: AttributeKey;
	value: string;
	onValueChange: (value: string) => void;
}

export function AttributeValueSuggester({ attributeKey, value, onValueChange }: AttributeValueSuggesterProps) {
	const { data: options } = useQuery({
		queryKey: ['attribute', attributeKey, 'values'],
		queryFn: () =>
			handleErrors(
				publicApiClient.furniture.attributes[':key'].$get({
					param: { key: attributeKey },
				})
			),
	});

	const filteredOptions = options?.filter((option) => option.toLowerCase().includes(value.toLowerCase())) ?? [];

	const [open, setOpen] = useState(false);

	return (
		<Popover open={open}>
			<Popover.Anchor asChild>
				<Input
					value={value}
					onValueChange={onValueChange}
					onFocus={() => {
						setOpen(true);
					}}
					onBlur={() => {
						setTimeout(() => {
							setOpen(false);
						}, 100);
					}}
				/>
			</Popover.Anchor>
			<Popover.Content
				style={{ zIndex: 999999 }}
				onOpenAutoFocus={(ev) => {
					ev.preventDefault();
				}}
			>
				{filteredOptions.map((option) => (
					<Control p="squeeze" key={option} onClick={() => onValueChange(option)}>
						{option}
					</Control>
				))}
			</Popover.Content>
		</Popover>
	);
}
