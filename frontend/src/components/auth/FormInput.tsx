import type { FieldError, FieldValues, RegisterOptions, UseFormRegister } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import { motion } from 'framer-motion';

interface FormInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  validation?: RegisterOptions<T, Path<T>>;
  error?: FieldError;
}

export const FormInput = <T extends FieldValues>({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  validation,
  error,
}: FormInputProps<T>) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-gray-300 mb-1">{label}</label>
      <motion.input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-primary-light ${error ? 'border border-red-500' : ''}`}
        whileFocus={{ scale: 1.02 }}
        {...register(name, validation)}
      />
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
