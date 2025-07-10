"use client";

import * as React from "react";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical";
  }
>(({ className = "", orientation = "horizontal", ...props }, ref) => {
  const baseClass = "separator";
  const orientationClass = orientation === "vertical" ? "separator-vertical" : "";
  const combinedClassName = `${baseClass} ${orientationClass} ${className}`.trim();
  
  return (
    <div
      ref={ref}
      className={combinedClassName}
      {...props}
    />
  );
});

Separator.displayName = "Separator";

export { Separator }; 