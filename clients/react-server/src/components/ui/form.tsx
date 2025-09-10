import * as React from 'react';
import { Label as LabelPrimitive, Slot as RadixSlot } from 'radix-ui';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { JSX } from 'react';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

interface UseFormFieldReturn<TFieldValues extends FieldValues = FieldValues> {
  id: string;
  name: FieldPath<TFieldValues>;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  error?: {
    type: string;
    message?: string | undefined;
    ref?: any;
  };
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

/**
 *
 * @param {object} props - Props to be passed to the FormField component.
 * @param {string} props.name - The name of the form field, which should match the corresponding field in the form's data model.
 * @returns The FormField component.
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>): JSX.Element => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

/**
 *
 * @returns {UseFormFieldReturn} - The form field state and identifiers.
 */
const useFormField = (): UseFormFieldReturn => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

/**
 *
 * @param {object} props - Props to be passed to the FormItem component.
 * @param {string} props.className - Additional class names to be applied to the FormItem component.
 * @returns The FormItem component.
 */
const FormItem = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  const fieldContext = React.useContext(FormFieldContext);
  const fallbackId = React.useId();

  const id = fieldContext?.name ? `field-${fieldContext.name}` : fallbackId;

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn('grid gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
};

/**
 *
 * @param {object} props - Props to be passed to the FormLabel component.
 * @param {string} props.className - Additional class names to be applied to the FormLabel component.
 * @returns The FormLabel component.
 */
const FormLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>): JSX.Element => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive font-bold', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the FormControl component.
 * @returns The FormControl component.
 */
const FormControl = ({ ...props }: React.ComponentProps<typeof RadixSlot.Slot>): JSX.Element => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <RadixSlot.Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      className={cn(error && 'has-error', props.className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the FormDescription component.
 * @param {string} props.className - Additional class names to be applied to the FormDescription component.
 * @returns The FormDescription component.
 */
const FormDescription = ({ className, ...props }: React.ComponentProps<'p'>): JSX.Element => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the FormMessage component.
 * @param {string} props.className - Additional class names to be applied to the FormMessage component.
 * @returns The FormMessage component.
 */
const FormMessage = ({ className, ...props }: React.ComponentProps<'p'>): JSX.Element | null => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-destructive text-sm', className)}
      {...props}
    >
      {body}
    </p>
  );
};

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
