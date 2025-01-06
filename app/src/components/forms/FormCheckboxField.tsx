import { Box, Checkbox, CheckboxProps, Label, Text } from '@alef/sys';
import * as Form from '@radix-ui/react-form';
import { ErrorMessage, useField } from 'formik';
import { ReactNode } from 'react';
import { FormDefaultErrors } from './FormDefaultErrors.tsx';

export interface FormCheckboxFieldProps extends Omit<CheckboxProps, 'onChange' | 'onFocus' | 'onBlur' | 'checked' | 'defaultChecked'> {
	name: string;
	label: ReactNode;
	messages?: ReactNode;
}

export function FormCheckboxField({ name, label, messages, onCheckedChange, ...rest }: FormCheckboxFieldProps) {
	const [field, , helpers] = useField({
		name,
		type: 'checkbox',
	});

	return (
		<Form.Field name={name}>
			<Form.Control asChild>
				<Box align="start" gapped>
					<Checkbox
						{...field}
						{...rest}
						checked={!!field.checked}
						onCheckedChange={(checked) => {
							helpers.setValue(!!checked);
							onCheckedChange?.(checked);
						}}
					/>
					<Box stretched stacked justify="center">
						<Form.Label asChild>
							<Label>
								{label}
								{rest.required && <Text>*</Text>}
							</Label>
						</Form.Label>
						{messages ?? <FormDefaultErrors extraError={<ErrorMessage name={name} />} />}
					</Box>
				</Box>
			</Form.Control>
		</Form.Field>
	);
}
