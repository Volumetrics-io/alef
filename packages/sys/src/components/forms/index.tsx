import { FieldArray, FieldArrayConfig, useField, useFormikContext } from 'formik';
import { FC } from 'react';
import { withProps } from '../../hocs/withProps.js';
import { FormActions } from './FormActions.js';
import { FormCheckboxField } from './FormCheckboxField.js';
import { FormRoot } from './FormRoot.js';
import { FormSubmit } from './FormSubmit.js';
import { FormTextField } from './FormTextField.js';

export type { FormRootProps } from './FormRoot.js';
export type { FormTextFieldProps } from './FormTextField.js';

export const Form = Object.assign(FormRoot, {
	Submit: FormSubmit,
	TextField: FormTextField,
	TextArea: withProps(FormTextField, { multiline: true }),
	CheckboxField: FormCheckboxField,
	Actions: FormActions,
	useField,
	useForm: useFormikContext,
	FieldArray: FieldArray as FC<FieldArrayConfig>,
});
