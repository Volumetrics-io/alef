import { Box, Input, InputProps, Label, Text } from '@alef/sys';
import * as Form from '@radix-ui/react-form';
import { ErrorMessage, useField } from 'formik';
import { ReactNode } from 'react';
import { FieldHelpText } from './FieldHelpText.jsx';
import { FormDefaultErrors } from './FormDefaultErrors.jsx';

export interface FormTextFieldProps extends Omit<InputProps, 'value' | 'defaultValue' | 'slot' | 'children'> {
	name: string;
	label: ReactNode;
	/**
	 * Override default error message display. Use @radix-ui/react-form's
	 * Message component to customize error messages instead.
	 */
	messages?: ReactNode;
	/**
	 * Renders below the field to explain validations, etc.
	 */
	helpText?: ReactNode;
	slot?: ReactNode;
	startSlot?: ReactNode;
	endSlot?: ReactNode;
}

export function FormTextField({ name, label, messages, onFocus, onBlur, onChange, helpText, slot, startSlot = slot, endSlot, multiline, ...rest }: FormTextFieldProps) {
	const [props] = useField({
		name,
		onChange,
		onFocus,
		onBlur,
		required: rest.required,
		type: rest.type,
	});

	const Field = multiline ? Input.TextareaField : Input.Field;

	return (
		<Box stacked gapped asChild>
			<Form.Field name={name}>
				<Box justify="between">
					<Form.Label asChild>
						<Label>
							{label}
							{rest.required && <Text>*</Text>}
						</Label>
					</Form.Label>
					{messages ?? <FormDefaultErrors extraError={<ErrorMessage name={name} />} />}
				</Box>
				<Input.Root>
					{startSlot && <Input.Slot>{startSlot}</Input.Slot>}
					<Form.Control asChild>
						<Field {...props} {...rest} />
					</Form.Control>
					{endSlot && <Input.Slot>{endSlot}</Input.Slot>}
				</Input.Root>
				{helpText && <FieldHelpText>{helpText}</FieldHelpText>}
			</Form.Field>
		</Box>
	);
}
