import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  GraduationCap, 
  Loader2, 
  Mail, 
  MapPin, 
  Globe, 
  Award, 
  RefreshCw, 
  User, 
  Edit, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Upload, 
  DollarSign, 
  Calendar, 
  Phone, 
  FileText, 
  ToggleLeft, 
  ToggleRight,
  ExternalLink
} from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { useAuthContext } from '../../components/layout/AuthProvider';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/toast';

export default function AlumniProfile() {
  const { alumniProfile, loading, refreshAlumniProfile, alumniCompletionPercentage } = useAuthContext();
  const profile = alumniProfile as any;

  // Edit Section States
  const [activeEditSection, setActiveEditSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Modals
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddDonationModal, setShowAddDonationModal] = useState(false);
  const [uploadingIdCard, setUploadingIdCard] = useState(false);
  const [uploadingDegree, setUploadingDegree] = useState(false);

  // Section Form Data
  const [personalForm, setPersonalForm] = useState({
    rollNumber: profile?.rollNumber || '',
    enrollmentNumber: profile?.enrollmentNumber || '',
    graduationYear: profile?.graduationYear || profile?.passingYear || '',
    course: profile?.course || '',
    dateOfBirth: profile?.dateOfBirth || '',
    gender: profile?.gender || '',
  });

  const [contactForm, setContactForm] = useState({
    personalEmail: profile?.personalEmail || '',
    collegeEmail: profile?.collegeEmail || '',
    phone: profile?.phone || '',
    alternatePhone: profile?.alternatePhone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || '',
    linkedinUrl: profile?.linkedinUrl || '',
    githubUrl: profile?.githubUrl || '',
    portfolioUrl: profile?.portfolioUrl || '',
  });

  const [academicForm, setAcademicForm] = useState({
    cgpa: profile?.cgpa ?? '',
    scholarshipsAndAwards: Array.isArray(profile?.scholarshipsAndAwards) ? profile?.scholarshipsAndAwards.join(', ') : '',
    extracurricularActivities: Array.isArray(profile?.extracurricularActivities) ? profile?.extracurricularActivities.join(', ') : '',
  });

  const [verificationForm, setVerificationForm] = useState({
    alumniIdNumber: profile?.alumniIdNumber || '',
  });

  // Add Job Form Data
  const [jobForm, setJobForm] = useState({
    companyName: '',
    role: '',
    industry: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
  });

  // Add Donation Form Data
  const [donationForm, setDonationForm] = useState({
    amount: '',
    purpose: '',
    transactionId: '',
  });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!profile) {
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

  const startEdit = (section: string) => {
    setActiveEditSection(section);
    if (section === 'personal') {
      setPersonalForm({
        rollNumber: profile.rollNumber || '',
        enrollmentNumber: profile.enrollmentNumber || '',
        graduationYear: profile.graduationYear || profile.passingYear || '',
        course: profile.course || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
      });
    } else if (section === 'contact') {
      setContactForm({
        personalEmail: profile.personalEmail || '',
        collegeEmail: profile.collegeEmail || '',
        phone: profile.phone || '',
        alternatePhone: profile.alternatePhone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
      });
    } else if (section === 'academic') {
      setAcademicForm({
        cgpa: profile.cgpa ?? '',
        scholarshipsAndAwards: Array.isArray(profile.scholarshipsAndAwards) ? profile.scholarshipsAndAwards.join(', ') : '',
        extracurricularActivities: Array.isArray(profile.extracurricularActivities) ? profile.extracurricularActivities.join(', ') : '',
      });
    } else if (section === 'verification') {
      setVerificationForm({
        alumniIdNumber: profile.alumniIdNumber || '',
      });
    }
  };

  const cancelEdit = () => {
    setActiveEditSection(null);
  };

  const handleSaveSection = async (section: string) => {
    setSaving(true);
    try {
      let payload: any = {};
      if (section === 'personal') {
        payload = {
          ...personalForm,
          graduationYear: personalForm.graduationYear ? Number(personalForm.graduationYear) : null,
        };
      } else if (section === 'contact') {
        payload = { ...contactForm };
      } else if (section === 'academic') {
        payload = {
          cgpa: academicForm.cgpa !== '' ? Number(academicForm.cgpa) : null,
          scholarshipsAndAwards: academicForm.scholarshipsAndAwards
            ? academicForm.scholarshipsAndAwards.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [],
          extracurricularActivities: academicForm.extracurricularActivities
            ? academicForm.extracurricularActivities.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [],
        };
      } else if (section === 'verification') {
        payload = { ...verificationForm };
      }

      await api.put('/alumni/me', payload);
      toastSuccess('Profile updated successfully!');
      setActiveEditSection(null);
      await refreshAlumniProfile();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to update profile section');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMentorship = async () => {
    try {
      const nextState = !profile.mentorshipAvailability;
      await api.put('/alumni/me', { mentorshipAvailability: nextState });
      toastSuccess(`Mentorship status set to ${nextState ? 'Available' : 'Unavailable'}`);
      await refreshAlumniProfile();
    } catch (err: any) {
      console.error(err);
      toastError('Failed to toggle mentorship availability');
    }
  };

  const handleAddJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/alumni/me/work-experience', jobForm);
      toastSuccess('Work experience added successfully!');
      setShowAddJobModal(false);
      setJobForm({ companyName: '', role: '', industry: '', startDate: '', endDate: '', location: '', description: '' });
      await refreshAlumniProfile();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to add work experience');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (expId: string) => {
    if (!confirm('Are you sure you want to delete this work experience entry?')) return;
    try {
      await api.delete(`/alumni/me/work-experience/${expId}`);
      toastSuccess('Work experience removed');
      await refreshAlumniProfile();
    } catch (err: any) {
      console.error(err);
      toastError('Failed to delete work experience');
    }
  };

  const handleAddDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/alumni/me/donations', donationForm);
      toastSuccess('Donation recorded successfully! Thank you for supporting the alumni network.');
      setShowAddDonationModal(false);
      setDonationForm({ amount: '', purpose: '', transactionId: '' });
      await refreshAlumniProfile();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to record donation');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'idCard' | 'degreeCert') => {
    const isIdCard = type === 'idCard';
    if (isIdCard) setUploadingIdCard(true);
    else setUploadingDegree(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', isIdCard ? 'id_cards' : 'degrees');

      const uploadRes = await api.post('/applications/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const fileUrl = uploadRes.data.data.url;
      const payload = isIdCard ? { idCardUrl: fileUrl } : { degreeCertUrl: fileUrl };

      await api.put('/alumni/me', payload);
      toastSuccess(`${isIdCard ? 'ID Card' : 'Degree Certificate'} uploaded successfully! Verification pending approval.`);
      await refreshAlumniProfile();
    } catch (err: any) {
      console.error(err);
      toastError('Failed to upload file');
    } finally {
      if (isIdCard) setUploadingIdCard(false);
      else setUploadingDegree(false);
    }
  };

  const verificationStatus = profile.verificationStatus || 'UNVERIFIED';

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header Hero */}
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
            <div className="relative h-24 w-24 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-blue-500/10 shrink-0">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-3xl font-black text-white">
                  {profile.fullName?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">
                  <Briefcase className="h-3.5 w-3.5" />
                  Alumni Profile
                </span>

                {/* Verification Badge */}
                {verificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
                {verificationStatus === 'PENDING' && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
                    <ShieldAlert className="h-3.5 w-3.5" /> Verification Pending
                  </span>
                )}
                {verificationStatus === 'REJECTED' && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-400">
                    <ShieldAlert className="h-3.5 w-3.5" /> Rejected
                  </span>
                )}
                {verificationStatus === 'UNVERIFIED' && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/40 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
                    Unverified
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white">{profile.fullName}</h1>
              <p className="text-slate-400 text-sm font-medium">
                {profile.designation || 'Alumni'} {profile.currentCompany ? `at ${profile.currentCompany}` : ''}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors">
                    <FaLinkedin className="h-3.5 w-3.5 text-blue-400" /> LinkedIn
                  </a>
                )}
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors">
                    <FaGithub className="h-3.5 w-3.5 text-slate-300" /> GitHub
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors">
                    <Globe className="h-3.5 w-3.5 text-blue-400" /> Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Completeness Card */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5 w-full lg:w-72 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-slate-400">Profile Completion</span>
              <span className="text-blue-400">{alumniCompletionPercentage}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${alumniCompletionPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Complete your personal, contact, academic, and verification info to reach 100%.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Cards Grid */}
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-12 items-start">
        {/* Left Column: Personal, Academic, Career */}
        <div className="xl:col-span-7 space-y-8">
          {/* PERSONAL INFO CARD */}
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-7 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <User className="h-5 w-5 text-blue-400" /> Personal Details
              </h2>
              {activeEditSection === 'personal' ? (
                <div className="flex gap-2">
                  <button onClick={() => handleSaveSection('personal')} disabled={saving} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
                  </button>
                  <button onClick={cancelEdit} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => startEdit('personal')} className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-850 text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>

            {activeEditSection === 'personal' ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <FormInput label="Roll Number" value={personalForm.rollNumber} onChange={(v) => setPersonalForm(p => ({ ...p, rollNumber: v }))} placeholder="e.g. 2101001" />
                <FormInput label="Enrollment Number" value={personalForm.enrollmentNumber} onChange={(v) => setPersonalForm(p => ({ ...p, enrollmentNumber: v }))} placeholder="e.g. ENR2021001" />
                <FormInput label="Graduation Year" type="number" value={personalForm.graduationYear} onChange={(v) => setPersonalForm(p => ({ ...p, graduationYear: v }))} placeholder="e.g. 2024" />
                <FormInput label="Course" value={personalForm.course} onChange={(v) => setPersonalForm(p => ({ ...p, course: v }))} placeholder="e.g. B.Tech CS" />
                <FormInput label="Date of Birth" type="date" value={personalForm.dateOfBirth} onChange={(v) => setPersonalForm(p => ({ ...p, dateOfBirth: v }))} />
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Gender</label>
                  <select
                    value={personalForm.gender}
                    onChange={(e) => setPersonalForm(p => ({ ...p, gender: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoRow label="Roll Number" value={profile.rollNumber} />
                <InfoRow label="Enrollment Number" value={profile.enrollmentNumber} />
                <InfoRow label="Graduation Year" value={profile.graduationYear || profile.passingYear} />
                <InfoRow label="Course" value={profile.course} />
                <InfoRow label="Date of Birth" value={profile.dateOfBirth} />
                <InfoRow label="Gender" value={profile.gender} />
              </div>
            )}
          </div>

          {/* ACADEMIC DETAILS CARD */}
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-7 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-blue-400" /> Academic Details
              </h2>
              {activeEditSection === 'academic' ? (
                <div className="flex gap-2">
                  <button onClick={() => handleSaveSection('academic')} disabled={saving} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
                  </button>
                  <button onClick={cancelEdit} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => startEdit('academic')} className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-850 text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>

            {activeEditSection === 'academic' ? (
              <div className="mt-6 space-y-4">
                <FormInput label="CGPA / Percentage" type="number" value={academicForm.cgpa} onChange={(v) => setAcademicForm(a => ({ ...a, cgpa: v }))} placeholder="e.g. 8.75" />
                <FormInput label="Scholarships & Awards (Comma-separated)" value={academicForm.scholarshipsAndAwards} onChange={(v) => setAcademicForm(a => ({ ...a, scholarshipsAndAwards: v }))} placeholder="e.g. Merit Scholarship 2023, Best Project Award" />
                <FormInput label="Extracurricular Activities (Comma-separated)" value={academicForm.extracurricularActivities} onChange={(v) => setAcademicForm(a => ({ ...a, extracurricularActivities: v }))} placeholder="e.g. Coding Club Lead, Volleyball Team Captain" />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <InfoRow label="CGPA / Percentage" value={profile.cgpa !== null && profile.cgpa !== undefined ? `${profile.cgpa} / 10.0` : null} />
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/25 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Scholarships & Awards</p>
                  {profile.scholarshipsAndAwards?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.scholarshipsAndAwards.map((item: string, idx: number) => (
                        <span key={idx} className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                          🏆 {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500 italic">Not added</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/25 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Extracurricular Activities</p>
                  {profile.extracurricularActivities?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.extracurricularActivities.map((item: string, idx: number) => (
                        <span key={idx} className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                          🎯 {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500 italic">Not added</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CAREER HISTORY CARD (+ Add Job Button) */}
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-7 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-blue-400" /> Career History
              </h2>
              <button
                onClick={() => setShowAddJobModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-blue-500/20"
              >
                <Plus className="h-3.5 w-3.5" /> Add Job
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {profile.workHistory?.length ? (
                profile.workHistory.map((work: any) => (
                  <div key={work.id} className="relative rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5 group hover:border-slate-700 transition-all">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base">{work.role}</h3>
                        <p className="text-sm font-medium text-slate-300">{work.companyName}</p>
                        {work.industry && <p className="text-xs text-blue-400 font-semibold mt-0.5">{work.industry}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
                          {new Date(work.startDate).toLocaleDateString()} - {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'Present'}
                        </span>
                        <button
                          onClick={() => handleDeleteJob(work.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {work.description && <p className="mt-3 text-sm text-slate-300 leading-relaxed">{work.description}</p>}
                    {work.location && <p className="mt-2 text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {work.location}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">No work experience entries added yet. Click "+ Add Job" to add past experience.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Contact, Verification, Engagement */}
        <div className="xl:col-span-5 space-y-8">
          {/* CONTACT DETAILS CARD */}
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-7 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-400" /> Contact Details
              </h2>
              {activeEditSection === 'contact' ? (
                <div className="flex gap-2">
                  <button onClick={() => handleSaveSection('contact')} disabled={saving} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
                  </button>
                  <button onClick={cancelEdit} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => startEdit('contact')} className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-850 text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>

            {activeEditSection === 'contact' ? (
              <div className="mt-6 space-y-4">
                <FormInput label="Personal Email" type="email" value={contactForm.personalEmail} onChange={(v) => setContactForm(c => ({ ...c, personalEmail: v }))} placeholder="personal@example.com" />
                <FormInput label="College Email" type="email" value={contactForm.collegeEmail} onChange={(v) => setContactForm(c => ({ ...c, collegeEmail: v }))} placeholder="student@college.edu" />
                <FormInput label="Primary Phone (10 digits)" value={contactForm.phone} onChange={(v) => setContactForm(c => ({ ...c, phone: v }))} placeholder="9876543210" />
                <FormInput label="Alternate Phone (10 digits)" value={contactForm.alternatePhone} onChange={(v) => setContactForm(c => ({ ...c, alternatePhone: v }))} placeholder="9876543211" />
                <FormInput label="Address" value={contactForm.address} onChange={(v) => setContactForm(c => ({ ...c, address: v }))} placeholder="Street Address" />
                <div className="grid grid-cols-3 gap-3">
                  <FormInput label="City" value={contactForm.city} onChange={(v) => setContactForm(c => ({ ...c, city: v }))} />
                  <FormInput label="State" value={contactForm.state} onChange={(v) => setContactForm(c => ({ ...c, state: v }))} />
                  <FormInput label="Country" value={contactForm.country} onChange={(v) => setContactForm(c => ({ ...c, country: v }))} />
                </div>
                <FormInput label="LinkedIn URL" value={contactForm.linkedinUrl} onChange={(v) => setContactForm(c => ({ ...c, linkedinUrl: v }))} placeholder="https://linkedin.com/in/username" />
                <FormInput label="GitHub URL" value={contactForm.githubUrl} onChange={(v) => setContactForm(c => ({ ...c, githubUrl: v }))} placeholder="https://github.com/username" />
                <FormInput label="Portfolio Website" value={contactForm.portfolioUrl} onChange={(v) => setContactForm(c => ({ ...c, portfolioUrl: v }))} placeholder="https://mywebsite.com" />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <InfoRow label="Personal Email" value={profile.personalEmail || profile.email} />
                <InfoRow label="College Email" value={profile.collegeEmail} />
                <InfoRow label="Primary Phone" value={profile.phone} />
                <InfoRow label="Alternate Phone" value={profile.alternatePhone} />
                <InfoRow label="Location / Address" value={profile.address ? `${profile.address}, ${profile.city || ''} ${profile.state || ''} ${profile.country || ''}` : profile.location} />
                <InfoRow label="LinkedIn URL" value={profile.linkedinUrl} isLink />
                <InfoRow label="GitHub URL" value={profile.githubUrl} isLink />
                <InfoRow label="Portfolio Website" value={profile.portfolioUrl} isLink />
              </div>
            )}
          </div>

          {/* VERIFICATION CARD */}
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-7 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-400" /> Verification & Identity
              </h2>
              {activeEditSection === 'verification' ? (
                <div className="flex gap-2">
                  <button onClick={() => handleSaveSection('verification')} disabled={saving} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
                  </button>
                  <button onClick={cancelEdit} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => startEdit('verification')} className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-850 text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {activeEditSection === 'verification' ? (
                <FormInput label="Alumni ID Number" value={verificationForm.alumniIdNumber} onChange={(v) => setVerificationForm(vId => ({ ...vId, alumniIdNumber: v }))} placeholder="e.g. ALM-2024-889" />
              ) : (
                <InfoRow label="Alumni ID Number" value={profile.alumniIdNumber} />
              )}

              {/* Upload ID Card Image */}
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/25 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">ID Card Image</p>
                {profile.idCardUrl ? (
                  <div className="mt-2 flex items-center justify-between">
                    <a href={profile.idCardUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
                      <FileText className="h-4 w-4" /> View Uploaded ID Card
                    </a>
                    <label className="text-xs text-slate-400 hover:text-white cursor-pointer flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" /> Re-upload
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'idCard')} />
                    </label>
                  </div>
                ) : (
                  <label className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer transition-all">
                    {uploadingIdCard ? <Loader2 className="h-4 w-4 animate-spin text-blue-400" /> : <Upload className="h-4 w-4 text-blue-400" />}
                    Upload ID Card Image
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'idCard')} />
                  </label>
                )}
              </div>

              {/* Upload Degree Certificate */}
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/25 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Degree Certificate</p>
                {profile.degreeCertUrl ? (
                  <div className="mt-2 flex items-center justify-between">
                    <a href={profile.degreeCertUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
                      <FileText className="h-4 w-4" /> View Degree Certificate
                    </a>
                    <label className="text-xs text-slate-400 hover:text-white cursor-pointer flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" /> Re-upload
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'degreeCert')} />
                    </label>
                  </div>
                ) : (
                  <label className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer transition-all">
                    {uploadingDegree ? <Loader2 className="h-4 w-4 animate-spin text-blue-400" /> : <Upload className="h-4 w-4 text-blue-400" />}
                    Upload Degree Certificate
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'degreeCert')} />
                  </label>
                )}
              </div>

              {/* Admin Approval Status */}
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/35 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Verification Status</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-white capitalize">{verificationStatus.toLowerCase()}</span>
                  <span className="text-[10px] text-slate-500 italic">Managed by College Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* ENGAGEMENT & COMMUNITY CARD */}
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950/45 p-7 backdrop-blur-xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 border-b border-slate-850 pb-4">
              <Calendar className="h-5 w-5 text-blue-400" /> Engagement & Contributions
            </h2>

            {/* Mentorship Toggle */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Mentorship Availability</p>
                <p className="text-xs text-slate-400 mt-0.5">Available for student 1:1 mentorship sessions</p>
              </div>
              <button onClick={handleToggleMentorship} className="cursor-pointer">
                {profile.mentorshipAvailability ? (
                  <ToggleRight className="h-8 w-8 text-emerald-400 transition-transform active:scale-95" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-600 transition-transform active:scale-95" />
                )}
              </button>
            </div>

            {/* Events Attended */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Events Attended</p>
              {profile.eventsAttended?.length ? (
                <div className="space-y-2">
                  {profile.eventsAttended.map((evt: any) => (
                    <div key={evt.id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-850">
                      <div>
                        <p className="font-semibold text-white">{evt.title}</p>
                        <p className="text-[10px] text-slate-500">{evt.category} • {new Date(evt.eventDate).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Attended</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No event attendance records found.</p>
              )}
            </div>

            {/* Donations History */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Donations History</p>
                <button
                  onClick={() => setShowAddDonationModal(true)}
                  className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Record Contribution
                </button>
              </div>
              {profile.donations?.length ? (
                <div className="space-y-2">
                  {profile.donations.map((don: any) => (
                    <div key={don.id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-850">
                      <div>
                        <p className="font-semibold text-emerald-400">₹{don.amount.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-slate-400">{don.purpose}</p>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(don.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No donation records yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADD JOB MODAL */}
      <AnimatePresence>
        {showAddJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-400" /> Add Past Work Experience
                </h3>
                <button onClick={() => setShowAddJobModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddJobSubmit} className="space-y-4">
                <FormInput label="Company Name *" value={jobForm.companyName} onChange={(v) => setJobForm(j => ({ ...j, companyName: v }))} required placeholder="e.g. Google India" />
                <FormInput label="Role / Designation *" value={jobForm.role} onChange={(v) => setJobForm(j => ({ ...j, role: v }))} required placeholder="e.g. Senior Software Engineer" />
                <FormInput label="Industry" value={jobForm.industry} onChange={(v) => setJobForm(j => ({ ...j, industry: v }))} placeholder="e.g. Information Technology" />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="Start Date *" type="date" value={jobForm.startDate} onChange={(v) => setJobForm(j => ({ ...j, startDate: v }))} required />
                  <FormInput label="End Date (Leave blank if present)" type="date" value={jobForm.endDate} onChange={(v) => setJobForm(j => ({ ...j, endDate: v }))} />
                </div>

                <FormInput label="Location" value={jobForm.location} onChange={(v) => setJobForm(j => ({ ...j, location: v }))} placeholder="e.g. Bengaluru, India" />
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Description / Key Achievements</label>
                  <textarea
                    rows={3}
                    value={jobForm.description}
                    onChange={(e) => setJobForm(j => ({ ...j, description: e.target.value }))}
                    placeholder="Responsibilities and key contributions..."
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddJobModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add Experience
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD DONATION MODAL */}
      <AnimatePresence>
        {showAddDonationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-400" /> Record Alumni Contribution
                </h3>
                <button onClick={() => setShowAddDonationModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddDonationSubmit} className="space-y-4">
                <FormInput label="Amount (₹) *" type="number" value={donationForm.amount} onChange={(v) => setDonationForm(d => ({ ...d, amount: v }))} required placeholder="e.g. 5000" />
                <FormInput label="Purpose / Cause *" value={donationForm.purpose} onChange={(v) => setDonationForm(d => ({ ...d, purpose: v }))} required placeholder="e.g. Student Scholarship Fund" />
                <FormInput label="Transaction Reference ID" value={donationForm.transactionId} onChange={(v) => setDonationForm(d => ({ ...d, transactionId: v }))} placeholder="e.g. TXN987654321" />

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddDonationModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Record Contribution
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Reusable Field Display Component
function InfoRow({ label, value, isLink }: { label: string; value: any; isLink?: boolean }) {
  const displayVal = value !== null && value !== undefined && String(value).trim() !== '' ? value : null;

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/25 p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
      {displayVal ? (
        isLink ? (
          <a href={displayVal} target="_blank" rel="noreferrer" className="mt-1 text-sm font-semibold text-blue-400 hover:underline flex items-center gap-1 break-all">
            {displayVal} <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          <p className="mt-1 text-sm font-semibold text-slate-200 break-words">{displayVal}</p>
        )
      ) : (
        <p className="mt-1 text-sm text-slate-500 italic">Not added</p>
      )}
    </div>
  );
}

// Helper Reusable Form Input Component
function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
}: {
  label: string;
  value: any;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  );
}
