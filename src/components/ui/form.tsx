"use client";

import * as React from "react";
import {
  UseFormReturn,
  FieldPath,
  FieldValues,
  Controller,
} from "react-hook-form";

const Form = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown
>({
  ...props
}: React.ComponentProps<"form"> & {
  form?: UseFormReturn<TFieldValues, TContext>;
}) => <form {...props} />;

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: React.ComponentProps<typeof Controller<TFieldValues, TName>>) => (
  <Controller {...props} />
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`form-item ${className}`.trim()} {...props} />
));
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className = "", ...props }, ref) => (
  <label
    ref={ref}
    className={`form-label ${className}`.trim()}
    {...props}
  />
));
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => <div ref={ref} {...props} />);
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`form-description ${className}`.trim()}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", children, ...props }, ref) => (
  <p
    ref={ref}
    className={`form-message ${className}`.trim()}
    {...props}
  >
    {children}
  </p>
));
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}; 