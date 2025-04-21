import * as FormPrimitive from '@radix-ui/react-form';
import { withClassName } from '../../hocs/withClassName.js';
import cls from './SimpleForm.module.css';

const FormRoot = withClassName(FormPrimitive.Root, cls.root);
const FormField = withClassName(FormPrimitive.Field, cls.field);
const FormLabel = withClassName(FormPrimitive.Label, cls.label);
const FormControl = withClassName(FormPrimitive.Control, cls.control);
const FormMessage = withClassName(FormPrimitive.Message, cls.message);
const FormSubmit = withClassName(FormPrimitive.Submit, cls.submit);

export const SimpleForm = Object.assign(FormRoot, {
	Field: FormField,
	Label: FormLabel,
	Control: FormControl,
	Message: FormMessage,
	Submit: FormSubmit,
});
