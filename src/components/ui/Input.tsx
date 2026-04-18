import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  startAdornment,
  endAdornment,
  fullWidth = false,
  className = '',
  containerClassName = '',
  inputClassName = '',
  ...props
}, ref) => {
  
  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error 
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500' 
    : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100';
  
  const inputBaseClass = `block py-3 px-4 rounded-xl text-gray-900 placeholder-gray-400 bg-white border shadow-sm transition-all duration-200 focus:ring-4 focus:ring-opacity-50 sm:text-sm ${errorClass}`;
  const adornmentClass = startAdornment ? 'pl-11' : '';
  
  return (
    <div className={`${widthClass} ${containerClassName} ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {startAdornment && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
            {startAdornment}
          </div>
        )}
        
        <input
          ref={ref}
          className={`${inputBaseClass} ${adornmentClass} ${widthClass} ${inputClassName}`}
          {...props}
        />
        
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
            {endAdornment}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1.5 text-xs font-medium ${error ? 'text-error-600' : 'text-gray-500'} ml-1`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';