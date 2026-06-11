// src/pages/student/Dashboard.tsx
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  return (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-800 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Student Dashboard</h1>
        <p className="text-gray-200">Welcome to your alumni network portal.</p>
      </div>
    </motion.div>
  );
}
