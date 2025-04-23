import { Button, ButtonProps } from '@alef/sys';
import * as Form from '@radix-ui/react-form';
import { useFormikContext } from 'formik';
import { ReactNode } from 'react';

export interface FormSubmitProps extends ButtonProps {
	/**
	 * Allow submission when the form is pristine (values are the same as initial).
	 */
	allowPristineSubmission?: boolean;
	pristineContent?: ReactNode;
}

export const FormSubmit = function FormSubmitRoot({ children, pristineContent, allowPristineSubmission: allowPristineSubmission = false, ...props }: FormSubmitProps) {
	const { isSubmitting, isValidating, isValid, dirty } = useFormikContext();
	return (
		<Button color="suggested" {...props} asChild type="submit" loading={isSubmitting || isValidating} disabled={!isValid || (!allowPristineSubmission && !dirty)}>
			<Form.Submit>{!dirty && pristineContent ? pristineContent : (children ?? 'Submit')}</Form.Submit>
		</Button>
	);
};
