import { Text } from '@alef/sys';
import * as Form from '@radix-ui/react-form';
import { ReactNode } from 'react';

export interface FormDefaultErrorsProps extends Form.FormMessageProps {
	extraError?: ReactNode;
}

export function FormDefaultErrors({ extraError, ...props }: FormDefaultErrorsProps) {
	return (
		<Text style={{ color: 'var(--error-ink)' }}>
			{extraError}
			<Form.Message match="valueMissing" {...props}>
				This field is required
			</Form.Message>
			<Form.Message match="badInput" {...props}>
				Invalid input
			</Form.Message>
			<Form.Message match="patternMismatch" {...props}>
				Does not match pattern
			</Form.Message>
			<Form.Message match="tooShort" {...props}>
				Too short
			</Form.Message>
			<Form.Message match="tooLong" {...props}>
				Too long
			</Form.Message>
			<Form.Message match="rangeUnderflow" {...props}>
				Too low
			</Form.Message>
			<Form.Message match="rangeOverflow" {...props}>
				Too high
			</Form.Message>
			<Form.Message match="stepMismatch" {...props}>
				Invalid input
			</Form.Message>
			<Form.Message match="typeMismatch" {...props}>
				Invalid input
			</Form.Message>
		</Text>
	);
}
