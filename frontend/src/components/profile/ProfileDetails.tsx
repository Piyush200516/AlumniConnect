import { motion } from 'framer-motion';
import { Mail, Phone, FileText, GraduationCap, Award, Compass } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

interface ProfileDetailsProps {
  profile: {
    fullName: string;
    email: string;
    enrollmentNumber: string;
    branch: string;
    course: string;
    graduationYear: number;
    phone: string | null;
    bio: string | null;
    skills: string[];
    linkedinUrl: string | null;
    githubUrl: string | null;
    resumeUrl: string | null;
  };
}

export default function ProfileDetails({ profile }: ProfileDetailsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-6 grid-cols-1 md:grid-cols-2"
    >
      {/* Bio / About Card */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-2 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg shadow-black/10 flex flex-col justify-between"
      >
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5 mb-4">
            <Compass className="w-5 h-5 text-blue-400" /> About Me
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
            {profile.bio || 'Add a short bio to introduce yourself to alumni and peers.'}
          </p>
        </div>
      </motion.div>

      {/* Academic Details Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg shadow-black/10"
      >
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5 mb-5">
          <GraduationCap className="w-5 h-5 text-blue-400" /> Academic Details
        </h2>
        <div className="space-y-4">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollment Number</span>
            <span className="text-sm font-semibold text-slate-200 mt-1 block">{profile.enrollmentNumber}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block">{profile.course}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block">{profile.branch}</span>
            </div>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Graduation Year</span>
            <span className="text-sm font-semibold text-slate-200 mt-1 block">{profile.graduationYear}</span>
          </div>
        </div>
      </motion.div>

      {/* Contact & Professional Info */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg shadow-black/10"
      >
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5 mb-5">
          <Phone className="w-5 h-5 text-blue-400" /> Contact & Links
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">College Email</span>
              <span className="text-sm font-semibold text-slate-200 truncate block">{profile.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Mobile Number</span>
              <span className="text-sm font-semibold text-slate-200 block">
                {profile.phone || <span className="text-slate-600 italic">Not added</span>}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {profile.linkedinUrl ? (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300"
              >
                <FaLinkedin className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">LinkedIn</span>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-900/60 bg-slate-950/20 text-slate-600 cursor-not-allowed">
                <FaLinkedin className="w-4 h-4 shrink-0" />
                <span className="truncate">LinkedIn</span>
              </div>
            )}

            {profile.githubUrl ? (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300"
              >
                <FaGithub className="w-4 h-4 text-slate-100 shrink-0" />
                <span className="truncate">GitHub</span>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-900/60 bg-slate-950/20 text-slate-600 cursor-not-allowed">
                <FaGithub className="w-4 h-4 shrink-0" />
                <span className="truncate">GitHub</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Skills Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg shadow-black/10"
      >
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5 mb-5">
          <Award className="w-5 h-5 text-blue-400" /> Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {profile.skills && profile.skills.length > 0 ? (
            profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-850 bg-slate-900/60 text-slate-300 shadow-sm"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-slate-500 text-sm font-medium italic">No skills added yet.</p>
          )}
        </div>
      </motion.div>

      {/* Resume Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur-xl shadow-lg shadow-black/10 flex flex-col justify-between"
      >
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5 mb-3">
            <FileText className="w-5 h-5 text-blue-400" /> Resume / CV
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
            {profile.resumeUrl
              ? 'Your resume is uploaded and ready for job applications.'
              : 'Upload your resume to apply for internship and placement drives.'}
          </p>
        </div>

        {profile.resumeUrl ? (
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all duration-300"
          >
            <FileText className="w-4 h-4" />
            <span>View Resume</span>
          </a>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-slate-800 bg-slate-900/10 text-xs font-semibold text-slate-500 cursor-not-allowed">
            <FileText className="w-4 h-4" />
            <span>No Resume Uploaded</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
