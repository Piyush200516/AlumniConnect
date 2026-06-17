import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSave: (formData: FormData) => Promise<void>;
}

export default function EditProfileDialog({ isOpen, onClose, profile, onSave }: EditProfileDialogProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'socials' | 'skills' | 'uploads'>('personal');
  const [loading, setLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [branch, setBranch] = useState(profile.branch || '');
  const [course, setCourse] = useState(profile.course || '');
  const [graduationYear, setGraduationYear] = useState(profile.graduationYear || 2026);
  const [bio, setBio] = useState(profile.bio || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || '');
  
  const [skillsInput, setSkillsInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(profile.skills || []);

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(profile.profileImage || null);
  const [resumeName, setResumeName] = useState<string | null>(profile.resumeUrl ? 'Current Resume.pdf' : null);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = skillsInput.trim();
      if (val && !skillsList.includes(val)) {
        setSkillsList([...skillsList, val]);
      }
      setSkillsInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('branch', branch);
      formData.append('course', course);
      formData.append('graduationYear', String(graduationYear));
      formData.append('bio', bio);
      formData.append('phone', phone);
      formData.append('linkedinUrl', linkedinUrl);
      formData.append('githubUrl', githubUrl);
      formData.append('skills', skillsList.join(','));

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.45 }}
            className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl text-slate-100 z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Edit Student Profile</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-slate-900 mb-6 overflow-x-auto gap-2 shrink-0">
              {(['personal', 'socials', 'skills', 'uploads'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-400 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Form Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-6 min-h-0 flex flex-col justify-between">
              <div className="space-y-6">
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Graduation Year</label>
                        <input
                          type="number"
                          required
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(Number(e.target.value))}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Course</label>
                        <input
                          type="text"
                          required
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          placeholder="e.g. B.Tech"
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Branch</label>
                        <input
                          type="text"
                          required
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          placeholder="e.g. Computer Science"
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Bio / About Me</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write a short summary about your background, career interests, etc."
                        rows={4}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 resize-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'socials' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Mobile Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 99999 88888"
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">GitHub Profile URL</label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Add Skills</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={skillsInput}
                          onChange={(e) => setSkillsInput(e.target.value)}
                          onKeyDown={handleAddSkill}
                          placeholder="Type a skill and press Enter"
                          className="flex-1 px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const val = skillsInput.trim();
                            if (val && !skillsList.includes(val)) {
                              setSkillsList([...skillsList, val]);
                            }
                            setSkillsInput('');
                          }}
                          className="px-4 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Your Skills</label>
                      <div className="flex flex-wrap gap-2 p-4 min-h-[120px] bg-slate-900/40 border border-slate-900 rounded-xl">
                        {skillsList.length > 0 ? (
                          skillsList.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900 text-slate-300"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="w-4 h-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-600 text-xs italic font-medium">Add skills using the field above.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'uploads' && (
                  <div className="space-y-5">
                    {/* Profile Picture */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Profile Picture</label>
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/20">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Preview"
                            className="w-16 h-16 rounded-xl object-cover border border-slate-800"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 font-bold text-xl">
                            P
                          </div>
                        )}
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 cursor-pointer transition-all duration-300 select-none">
                          <Upload className="w-4 h-4 text-blue-400" />
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Resume (PDF)</label>
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/20">
                        <div className="flex-1 min-w-0">
                          {resumeName ? (
                            <p className="text-sm font-semibold text-slate-200 truncate">{resumeName}</p>
                          ) : (
                            <p className="text-xs text-slate-600 italic font-medium">No resume uploaded.</p>
                          )}
                        </div>
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 cursor-pointer transition-all duration-300 select-none">
                          <Upload className="w-4 h-4 text-blue-400" />
                          Upload Resume
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleResumeChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-900 pt-6 mt-8 shrink-0">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-900 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all cursor-pointer shadow-lg shadow-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed select-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
