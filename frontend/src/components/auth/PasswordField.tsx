import { useState } from 'react';
import type { ComponentType } from 'react';
import type { Path, RegisterOptions, FieldError, FieldValues, UseFormRegister } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface PasswordFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  validation?: RegisterOptions<T, Path<T>>;
  error?: FieldError;
  icon?: ComponentType<{ className?: string }>;
}

export const PasswordField = <T extends FieldValues>({
  label,
  name,
  register,
  validation,
  error,
  icon: Icon,
}: PasswordFieldProps<T>) => {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <motion.input
          id={name}
          type={show ? 'text' : 'password'}
          className={`w-full py-2.5 bg-white/5 border ${
            Icon ? 'pl-11 pr-11' : 'pl-4 pr-11'
          } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all duration-200 ${
            error
              ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 hover:border-white/20'
          }`}
          whileFocus={{ scale: 1.01 }}
          {...register(name, validation)}
        />
        <button
          type="button"
          className="absolute right-3.5 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && (
        <motion.p
          className="text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>•</span> {error.message}
        </motion.p>
      )}
    </div>
  );
};

