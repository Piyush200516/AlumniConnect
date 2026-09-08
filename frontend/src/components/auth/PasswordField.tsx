import { useState } from 'react';
import type { ComponentType } from 'react';
import type { Path, RegisterOptions, FieldError, FieldValues, UseFormRegister } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { AlertCircle, Lock } from 'lucide-react';

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
  icon: Icon = Lock,
}: PasswordFieldProps<T>) => {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative flex items-center group">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 group-focus-within:text-blue-400 pointer-events-none flex items-center justify-center transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={name}
          type={show ? 'text' : 'password'}
          className={`w-full py-3 bg-white/5 border ${
            Icon ? 'pl-11 pr-11' : 'pl-4 pr-11'
          } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all duration-200 backdrop-blur-md ${
            error
              ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-500/5'
              : 'border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 hover:border-white/20'
          }`}
          {...register(name, validation)}
        />
        <button
          type="button"
          className="absolute right-3.5 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer p-1 rounded-lg hover:bg-white/10"
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
          className="text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1.5"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
          <span>{error.message}</span>
        </motion.p>
      )}
    </div>
  );
};
