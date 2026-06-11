import { motion } from 'framer-motion';

export const LoadingSpinner = () => (
  <motion.div
    className="w-6 h-6 border-4 border-primary-light border-t-transparent rounded-full mx-auto"
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
  />
);
