import React from 'react';

const FormInput = ({ label, error, helperText, required = false, ...props }) => {
  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label className="block text-xs font-semibold text-charcoal dark:text-[#E8EDE4]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`input-field ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-rose-500' : ''}`}
      />
      {error && <p className="text-[11px] text-red-600 dark:text-rose-400 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-muted dark:text-[#A8B49E]">{helperText}</p>}
    </div>
  );
};

export default FormInput;
