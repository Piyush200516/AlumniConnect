import type { FieldError, FieldValues, RegisterOptions, UseFormRegister, Path } from 'react-hook-form';
import { motion } from 'framer-motion';
import type { ComponentType } from 'react';

interface FormInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  validation?: RegisterOptions<T, Path<T>>;
  error?: FieldError;
  icon?: ComponentType<{ className?: string }>;
}

export const FormInput = <T extends FieldValues>({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  validation,
  error,
  icon: Icon,
}: FormInputProps<T>) => {
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
          type={type}
          placeholder={placeholder}
          className={`w-full py-2.5 bg-white/5 border ${
            Icon ? 'pl-11 pr-4' : 'px-4'
          } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all duration-200 ${
            error
              ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 hover:border-white/20'
          }`}
          whileFocus={{ scale: 1.01 }}
          {...register(name, validation)}
        />
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

