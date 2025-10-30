"use client";

import React from "react";

export function Textarea({
  id,
  value,
  onChange,
  rows,
  placeholder,
  className,
}: {
  id?: string;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <textarea
      id={id}
      value={value as any}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className={className}
    />
  );
}


