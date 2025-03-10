import React from 'react';
import { Controller, Control, Path, FieldValues, FieldError } from 'react-hook-form';
import Input from './Input';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  autoComplete?: string;
  disabled?: boolean;
}

export default function FormField<T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  error,
  autoComplete,
  disabled = false,
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          id={name}
          label={label}
          type={type}
          placeholder={placeholder}
          error={error?.message}
          autoComplete={autoComplete}
          disabled={disabled}
          {...field}
        />
      )}
    />
  );
}