import React from 'react';

const FormInput = ({ label, error, helperText, required = false, ...props }) => {
  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label className="block text-xs font-semibold text-charcoal">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`input-field ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
      />
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-muted">{helperText}</p>}
    </div>
  );
};

export default FormInput;
