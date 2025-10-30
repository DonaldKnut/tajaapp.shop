"use client";

import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={
          "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-taja-primary focus:outline-none focus:ring-2 focus:ring-taja-primary/30 " +
          className
        }
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;


