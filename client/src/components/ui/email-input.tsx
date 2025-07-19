import React, { useState } from "react";
import { Input } from "./input";

interface EmailInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

export function EmailInput({ 
  value = "", 
  onChange, 
  onBlur, 
  placeholder = "Enter your email",
  className,
  name
}: EmailInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Input
      type="email"
      value={internalValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      name={name}
      autoComplete="email"
      spellCheck="false"
    />
  );
}