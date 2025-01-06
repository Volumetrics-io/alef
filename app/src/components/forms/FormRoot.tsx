import { Box } from '@alef/sys';
import * as Form from '@radix-ui/react-form';
import { Formik, FormikConfig, FormikHelpers, FormikValues } from 'formik';
import { useCallback } from 'react';

export interface FormRootProps<TData extends FormikValues> extends FormikConfig<TData> {
	className?: string;
	id?: string;
}

export function FormRoot<TData extends FormikValues>({ onSubmit, children, className, ...rest }: FormRootProps<TData>) {
	const wrappedOnSubmit = useCallback(
		async (values: TData, bag: FormikHelpers<TData>) => {
			try {
				bag.setSubmitting(true);
				return await onSubmit(values, bag);
			} finally {
				bag.setSubmitting(false);
			}
		},
		[onSubmit]
	);

	if (typeof children === 'function') {
		return (
			<Formik<TData> onSubmit={wrappedOnSubmit} {...rest}>
				{(formik) => (
					<Form.Root onSubmit={formik.handleSubmit} className={className}>
						{children(formik)}
					</Form.Root>
				)}
			</Formik>
		);
	}

	return (
		<Formik<TData> onSubmit={wrappedOnSubmit} {...rest}>
			{(formik) => (
				<Form.Root onSubmit={formik.handleSubmit} className={className}>
					<Box stacked gapped>
						{children}
					</Box>
				</Form.Root>
			)}
		</Formik>
	);
}
