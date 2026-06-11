import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Role } from '../../types/user';
import { RoleCard } from './RoleCard';

export const RoleSelection = () => {
  const cards = [
    {
      role: 'student' as Role,
      title: 'Student',
      description: 'Access student portal',
      navigateTo: '/auth/student/login',
    },
    {
      role: 'alumni' as Role,
      title: 'Alumni',
      description: 'Connect with alumni network',
      navigateTo: '/auth/alumni/login',
    },
    {
      role: 'cdc' as Role,
      title: 'CDC',
      description: 'College Development Cell access',
      navigateTo: '/auth/cdc/login',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 w-full max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map((c) => (
          <RoleCard
            key={c.role}
            role={c.role}
            title={c.title}
            description={c.description}
            navigateTo={c.navigateTo}
          />
        ))}
      </motion.div>
    </div>
  );
};
