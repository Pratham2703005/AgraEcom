"use client";

import * as React from "react";
import { useEffect, useState } from "react";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", placeholder, type, ...props }, ref) => {
  const baseClass = "input";
  const combinedClassName = `${baseClass} ${className}`.trim();
  const [isClient, setIsClient] = useState<boolean>(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    isClient &&
    <input
      type={type}
      placeholder={placeholder}
      className={combinedClassName}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input }; 