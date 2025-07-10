"use client";

import * as React from "react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseClass = "alert";
    const variantClass = variant === "destructive" ? "alert-destructive" : "";
    const combinedClassName = `${baseClass} ${variantClass} ${className}`.trim();
    
    return (
      <div
        ref={ref}
        role="alert"
        className={combinedClassName}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => {
  const combinedClassName = `alert-title ${className}`.trim();
  
  return (
    <h5
      ref={ref}
      className={combinedClassName}
      {...props}
    />
  );
});
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => {
  const combinedClassName = `alert-description ${className}`.trim();
  
  return (
    <div
      ref={ref}
      className={combinedClassName}
      {...props}
    />
  );
});
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription }; 