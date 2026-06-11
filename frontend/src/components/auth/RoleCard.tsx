import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Role } from '../../types/user';

interface RoleCardProps {
  role: Role;
  title: string;
  description: string;
  navigateTo: string;
}

export const RoleCard = ({ role, title, description, navigateTo }: RoleCardProps) => {
  const navigate = useNavigate();
  const handleClick = () => navigate(navigateTo);

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center cursor-pointer transition-colors hover:bg-white/20"
      onClick={handleClick}
    >
      <h2 className="text-2xl font-semibold text-white mb-2 capitalize">{title}</h2>
      <p className="text-gray-300 text-sm">{description}</p>
    </motion.div>
  );
};
