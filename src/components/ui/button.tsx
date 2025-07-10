"use client";

import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseClass = "btn";
    
    const variantClass = {
      default: "btn-primary",
      destructive: "btn-destructive",
      outline: "btn-outline",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
      link: "btn-link",
    }[variant];
    
    const sizeClass = {
      default: "btn-default",
      sm: "btn-sm",
      lg: "btn-lg",
      icon: "btn-icon",
    }[size];
    
    const combinedClassName = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();
    
    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button }; 