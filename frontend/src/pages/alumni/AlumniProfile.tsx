import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Loader2, Mail, MapPin, Globe, Award, RefreshCw, User } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { useAuthContext } from '../../components/layout/AuthProvider';

export default function AlumniProfile() {
  const { alumniProfile, loading, refreshAlumniProfile } = useAuthContext();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!alumniProfile) {
    return (
      <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-8 backdrop-blur-xl text-center space-y-4">
        <p className="text-slate-400 font-medium">Unable to load alumni profile data.</p>
        <button
          onClick={refreshAlumniProfile}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Fetch
        </button>
      </div>
    );
  }

  const profile = alumniProfile as any;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/45 p-8 backdrop-blur-xl shadow-2xl shadow-black/20"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-24 w-24 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-blue-500/10 shrink-0">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-3xl font-black text-white">
                  {profile.fullName?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">
                <Briefcase className="h-3.5 w-3.5" />
                Alumni Profile
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">{profile.fullName}</h1>
              <p className="text-slate-400 text-sm font-medium">
                {profile.designation || 'Alumni'} {profile.currentCompany ? `at ${profile.currentCompany}` : ''}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                  >
                    <FaLinkedin className="h-3.5 w-3.5 text-blue-400" />
                    LinkedIn
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                    Portfolio
                  </a>
                )}
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  Email
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Batch</p>
              <p className="mt-1 text-sm font-bold text-white">{profile.passingYear}</p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Experience</p>
              <p className="mt-1 text-sm font-bold text-white">{profile.experience || 0} yrs</p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Privacy</p>
              <p className="mt-1 text-sm font-bold text-white">{profile.privacySetting}</p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Skills</p>
              <p className="mt-1 text-sm font-bold text-white">{profile.skills?.length || 0}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 grid-cols-1 xl:grid-cols-12 items-start">
        <div className="xl:col-span-8 space-y-8">
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <User className="h-5 w-5 text-blue-400" /> About
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {profile.bio || 'No bio added yet.'}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoRow label="Current Company" value={profile.currentCompany || 'Not added'} />
              <InfoRow label="Designation" value={profile.designation || 'Not added'} />
              <InfoRow label="Industry" value={profile.industry || 'Not added'} />
              <InfoRow label="Location" value={profile.location || 'Not added'} />
              <InfoRow label="Phone" value={profile.phone || 'Not added'} />
              <InfoRow label="Current CTC" value={profile.currentCtc || 'Not added'} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-blue-400" /> Work History
            </h2>
            <div className="mt-6 space-y-4">
              {profile.workHistory?.length ? profile.workHistory.map((work: any) => (
                <div key={work.id} className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{work.role}</h3>
                      <p className="text-sm text-slate-400">{work.companyName}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(work.startDate).toLocaleDateString()} - {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'Present'}
                    </span>
                  </div>
                  {work.description && <p className="mt-3 text-sm text-slate-300 leading-6">{work.description}</p>}
                  {work.location && <p className="mt-2 text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {work.location}</p>}
                </div>
              )) : (
                <p className="text-sm text-slate-500">No work history added.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-blue-400" /> Education
            </h2>
            <div className="mt-6 space-y-4">
              {profile.education?.length ? profile.education.map((edu: any) => (
                <div key={edu.id} className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{edu.degree}</h3>
                      <p className="text-sm text-slate-400">{edu.institution}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                    </span>
                  </div>
                  {edu.fieldOfStudy && <p className="mt-2 text-sm text-slate-300">Field: {edu.fieldOfStudy}</p>}
                  {edu.description && <p className="mt-2 text-sm text-slate-300 leading-6">{edu.description}</p>}
                </div>
              )) : (
                <p className="text-sm text-slate-500">No education history added.</p>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Award className="h-5 w-5 text-blue-400" /> Skills & Achievements
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.skills?.length ? profile.skills.map((skill: string) => (
                <span key={skill} className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  {skill}
                </span>
              )) : (
                <span className="text-sm text-slate-500">No skills added.</span>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {profile.achievements?.length ? profile.achievements.map((item: string) => (
                <div key={item} className="rounded-2xl border border-slate-800/60 bg-slate-900/30 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              )) : (
                <p className="text-sm text-slate-500">No achievements added.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-400" /> Contact
            </h2>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Phone" value={profile.phone || 'Not added'} />
              <InfoRow label="LinkedIn" value={profile.linkedinUrl || 'Not added'} />
              <InfoRow label="Portfolio" value={profile.portfolioUrl || 'Not added'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/25 p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-200 break-words">{value}</p>
    </div>
  );
}
