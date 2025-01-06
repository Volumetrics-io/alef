import { FormActions } from './FormActions.tsx';
import { FormCheckboxField } from './FormCheckboxField.tsx';
import { FormRoot } from './FormRoot.tsx';
import { FormSubmit } from './FormSubmit.tsx';
import { FormTextField } from './FormTextField.tsx';
import { withProps } from '@/hocs/withProps.tsx';

export type { FormRootProps } from './FormRoot.tsx';
export type { FormTextFieldProps } from './FormTextField.tsx';

export const Form = Object.assign(FormRoot, {
	Submit: FormSubmit,
	TextField: FormTextField,
	TextArea: withProps(FormTextField, { multiline: true }),
	CheckboxField: FormCheckboxField,
	Actions: FormActions,
});
