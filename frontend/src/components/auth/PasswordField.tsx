import { useState } from 'react';
import type { Path, RegisterOptions } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import type { FieldError, FieldValues, UseFormRegister } from 'react-hook-form';
import { motion } from 'framer-motion';
interface PasswordFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  validation?: RegisterOptions<T, Path<T>>;
  error?: FieldError;
}

export const PasswordField = <T extends FieldValues>({
  label,
  name,
  register,
  validation,
  error,
}: PasswordFieldProps<T>) => {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-4 relative">
      <label htmlFor={name} className="block text-gray-300 mb-1">
        {label}
      </label>
      <motion.input
        id={name}
        type={show ? 'text' : 'password'}
        className={`w-full px-4 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-primary-light ${error ? 'border border-red-500' : ''}`}
        whileFocus={{ scale: 1.02 }}
        {...register(name, validation)}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-3 flex items-center"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <EyeIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {error && (
        <motion.p
          className="text-red-400 text-sm mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error.message}
        </motion.p>
      )}
    </div>
  );
};
