import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Lock, 
  Upload, 
  Plus, 
  Trash2, 
  Info, 
  FileText, 
  Globe, 
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { useAuthContext } from '../layout/AuthProvider';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/toast';

interface Certification {
  id?: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  certificateUrl: string;
}

export default function MyApplications() {
  const { profile } = useAuthContext();
  
  // App States
  const [appData, setAppData] = useState<any>({
    fullName: '',
    enrollmentNumber: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    profileImage: '',
    aadharNumber: '',
    panCard: '',
    collegeIdNumber: '',
    fatherName: '',
    fatherOccupation: '',
    fatherPhone: '',
    motherName: '',
    motherOccupation: '',
    motherPhone: '',
    familyIncome: '',
    emergencyContact: '',
    currentAddress: '',
    currentCity: '',
    currentState: '',
    currentPincode: '',
    permanentAddress: '',
    permanentCity: '',
    permanentState: '',
    permanentPincode: '',
    sameAsCurrent: false,
    class10Board: '',
    class10School: '',
    class10Percentage: '',
    class10PassingYear: '',
    class12Board: '',
    class12School: '',
    class12Percentage: '',
    class12PassingYear: '',
    diplomaCollege: '',
    diplomaBranch: '',
    diplomaCGPA: '',
    diplomaPassingYear: '',
    currentCourse: '',
    currentBranch: '',
    currentSemester: '',
    currentCGPA: '',
    sgpaSemester1: '',
    sgpaSemester2: '',
    sgpaSemester3: '',
    sgpaSemester4: '',
    sgpaSemester5: '',
    sgpaSemester6: '',
    sgpaSemester7: '',
    sgpaSemester8: '',
    careerPreference: '',
    primaryDomain: '',
    secondaryDomain: '',
    skills: [],
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    certifications: []
  });

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState<{[key: string]: boolean}>({});
  
  // Dialog/Modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeUpdateModal, setActiveUpdateModal] = useState<'resume' | 'domains' | 'cgpa' | 'sgpa' | null>(null);
  
  // Accordion Section states
  const [expandedSections, setExpandedSections] = useState<{[key: number]: boolean}>({
    1: true, // open first by default
  });

  // Allowed updates temporary states
  const [tempResumeUrl, setTempResumeUrl] = useState('');
  const [tempPrimaryDomain, setTempPrimaryDomain] = useState('');
  const [tempSecondaryDomain, setTempSecondaryDomain] = useState('');
  const [tempCGPA, setTempCGPA] = useState('');
  const [tempSGPAs, setTempSGPAs] = useState<{[key: string]: string}>({});

  // Skill Input temp state
  const [skillInput, setSkillInput] = useState('');

  // Fetch application details on mount
  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications/my');
      if (res.data.data) {
        const data = res.data.data;
        // Format dates
        if (data.dateOfBirth) {
          data.dateOfBirth = data.dateOfBirth.split('T')[0];
        }
        if (data.certifications) {
          data.certifications = data.certifications.map((c: any) => ({
            ...c,
            issueDate: c.issueDate.split('T')[0]
          }));
        }
        setAppData(data);
      } else if (profile) {
        // Prepopulate with profile details
        setAppData((prev: any) => ({
          ...prev,
          fullName: profile.fullName || '',
          enrollmentNumber: profile.enrollmentNumber || '',
          email: profile.email || '',
          phone: profile.phone || '',
          branch: profile.branch || '',
          course: profile.course || '',
          graduationYear: profile.graduationYear || '',
          linkedinUrl: profile.linkedinUrl || '',
          githubUrl: profile.githubUrl || '',
          resumeUrl: profile.resumeUrl || '',
          profileImage: profile.profileImage || '',
          skills: profile.skills || []
        }));
      }
    } catch (err: any) {
      console.error('Failed to fetch application:', err);
      toastError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  // Same as Current Address Sync
  useEffect(() => {
    if (appData.sameAsCurrent) {
      setAppData((prev: any) => ({
        ...prev,
        permanentAddress: prev.currentAddress,
        permanentCity: prev.currentCity,
        permanentState: prev.currentState,
        permanentPincode: prev.currentPincode
      }));
    }
  }, [
    appData.sameAsCurrent, 
    appData.currentAddress, 
    appData.currentCity, 
    appData.currentState, 
    appData.currentPincode
  ]);

  const handleInputChange = (field: string, value: any) => {
    setAppData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // File Upload Helper
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string, type: 'profile' | 'resume' | 'certificate', certIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    if (type === 'resume' && file.type !== 'application/pdf') {
      toastError('Resume must be a PDF file');
      return;
    }

    const key = certIndex !== undefined ? `cert_${certIndex}` : field;
    setUploadLoading(prev => ({ ...prev, [key]: true }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/applications/upload?type=${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const url = res.data.data.url;
      if (certIndex !== undefined) {
        const updatedCerts = [...appData.certifications];
        updatedCerts[certIndex].certificateUrl = url;
        handleInputChange('certifications', updatedCerts);
      } else {
        handleInputChange(field, url);
      }
      toastSuccess('File uploaded successfully');
    } catch (err: any) {
      console.error('File upload failed:', err);
      toastError(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploadLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Skills handlers
  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !appData.skills.includes(val)) {
        handleInputChange('skills', [...appData.skills, val]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    handleInputChange('skills', appData.skills.filter((s: string) => s !== skill));
  };

  // Certifications handlers
  const handleAddCertification = () => {
    const newCert: Certification = {
      name: '',
      issuingOrganization: '',
      issueDate: '',
      certificateUrl: ''
    };
    handleInputChange('certifications', [...appData.certifications, newCert]);
  };

  const handleRemoveCertification = (index: number) => {
    handleInputChange('certifications', appData.certifications.filter((_: any, i: number) => i !== index));
  };

  const handleCertFieldChange = (index: number, field: keyof Certification, value: string) => {
    const updatedCerts = [...appData.certifications];
    updatedCerts[index] = {
      ...updatedCerts[index],
      [field]: value
    };
    handleInputChange('certifications', updatedCerts);
  };

  // Completion Percentage calculation
  const calculateCompleteness = () => {
    let filled = 0;
    let total = 0;
    const check = (val: any) => {
      total++;
      if (val !== undefined && val !== null && val !== '' && val !== 0 && (Array.isArray(val) ? val.length > 0 : true)) {
        filled++;
      }
    };
    
    // A. Personal Information
    check(appData.fullName);
    check(appData.enrollmentNumber);
    check(appData.email);
    check(appData.phone);
    check(appData.gender);
    check(appData.dateOfBirth);
    check(appData.profileImage);
    
    // B. Documents
    check(appData.aadharNumber);
    check(appData.collegeIdNumber);
    
    // C. Family Details
    check(appData.fatherName);
    check(appData.fatherOccupation);
    check(appData.fatherPhone);
    check(appData.motherName);
    check(appData.motherOccupation);
    check(appData.motherPhone);
    check(appData.familyIncome);
    check(appData.emergencyContact);
    
    // D. Address Details
    check(appData.currentAddress);
    check(appData.currentCity);
    check(appData.currentState);
    check(appData.currentPincode);
    check(appData.permanentAddress);
    check(appData.permanentCity);
    check(appData.permanentState);
    check(appData.permanentPincode);
    
    // E. Academic Record
    check(appData.class10Board);
    check(appData.class10School);
    check(appData.class10Percentage);
    check(appData.class10PassingYear);
    
    // 12th or Diploma check
    const has12th = appData.class12Board && appData.class12School && appData.class12Percentage && appData.class12PassingYear;
    const hasDiploma = appData.diplomaCollege && appData.diplomaBranch && appData.diplomaCGPA && appData.diplomaPassingYear;
    total += 1;
    if (has12th || hasDiploma) {
      filled += 1;
    }
    
    check(appData.currentCourse);
    check(dataSanitize(appData.currentBranch));
    check(appData.currentSemester);
    check(appData.currentCGPA);
    
    // F. Professional Profile
    check(appData.careerPreference);
    check(appData.primaryDomain);
    check(appData.skills);
    check(appData.linkedinUrl);
    check(appData.githubUrl);
    check(appData.resumeUrl);
    
    return Math.min(100, Math.round((filled / total) * 100));
  };

  const dataSanitize = (val: any) => {
    return val;
  };

  const completionPct = calculateCompleteness();

  // Save Draft API call
  const handleSaveDraft = async () => {
    setSaveLoading(true);
    try {
      const res = await api.post('/applications/save', appData);
      setAppData(res.data.data);
      toastSuccess('Application draft saved successfully');
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setSaveLoading(false);
    }
  };

  // Submit Application API call
  const handleSubmitApplication = async () => {
    setSubmitLoading(true);
    try {
      const res = await api.post('/applications/submit', appData);
      setAppData(res.data.data);
      setIsSubmitModalOpen(false);
      toastSuccess('Application submitted successfully!');
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to submit application. Make sure all required fields are filled.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Post Submission Update API call
  const handlePostSubmissionUpdate = async (type: 'resume' | 'domains' | 'cgpa' | 'sgpa') => {
    let payload: any = {};
    if (type === 'resume') {
      payload.resumeUrl = tempResumeUrl;
    } else if (type === 'domains') {
      payload.primaryDomain = tempPrimaryDomain;
      payload.secondaryDomain = tempSecondaryDomain;
    } else if (type === 'cgpa') {
      payload.currentCGPA = Number(tempCGPA);
    } else if (type === 'sgpa') {
      Object.keys(tempSGPAs).forEach(key => {
        payload[key] = tempSGPAs[key] === '' ? null : Number(tempSGPAs[key]);
      });
    }

    try {
      const res = await api.patch('/applications/update-allowed', payload);
      setAppData(res.data.data);
      setActiveUpdateModal(null);
      toastSuccess('Field updated successfully');
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to update fields');
    }
  };

  // Check section completions for accordion checks
  const isSectionComplete = (num: number): boolean => {
    if (num === 1) {
      return !!(appData.fullName && appData.enrollmentNumber && appData.email && appData.phone && appData.gender && appData.dateOfBirth && appData.profileImage);
    }
    if (num === 2) {
      return !!(appData.aadharNumber && appData.collegeIdNumber);
    }
    if (num === 3) {
      return !!(appData.fatherName && appData.fatherOccupation && appData.fatherPhone && appData.motherName && appData.motherOccupation && appData.motherPhone && appData.familyIncome && appData.emergencyContact);
    }
    if (num === 4) {
      return !!(appData.currentAddress && appData.currentCity && appData.currentState && appData.currentPincode && appData.permanentAddress && appData.permanentCity && appData.permanentState && appData.permanentPincode);
    }
    if (num === 5) {
      const has12thOrDiploma = !!((appData.class12Board && appData.class12School && appData.class12Percentage && appData.class12PassingYear) || (appData.diplomaCollege && appData.diplomaBranch && appData.diplomaCGPA && appData.diplomaPassingYear));
      return !!(appData.class10Board && appData.class10School && appData.class10Percentage && appData.class10PassingYear && has12thOrDiploma && appData.currentCourse && appData.currentBranch && appData.currentSemester && appData.currentCGPA);
    }
    if (num === 6) {
      return !!(appData.careerPreference && appData.primaryDomain && appData.skills?.length > 0 && appData.linkedinUrl && appData.githubUrl && appData.resumeUrl);
    }
    if (num === 7) {
      return appData.certifications?.length > 0;
    }
    return false;
  };

  // Open update modal and set temporary states
  const openUpdateModal = (type: 'resume' | 'domains' | 'cgpa' | 'sgpa') => {
    if (type === 'resume') {
      setTempResumeUrl(appData.resumeUrl || '');
    } else if (type === 'domains') {
      setTempPrimaryDomain(appData.primaryDomain || '');
      setTempSecondaryDomain(appData.secondaryDomain || '');
    } else if (type === 'cgpa') {
      setTempCGPA(appData.currentCGPA || '');
    } else if (type === 'sgpa') {
      setTempSGPAs({
        sgpaSemester1: appData.sgpaSemester1 || '',
        sgpaSemester2: appData.sgpaSemester2 || '',
        sgpaSemester3: appData.sgpaSemester3 || '',
        sgpaSemester4: appData.sgpaSemester4 || '',
        sgpaSemester5: appData.sgpaSemester5 || '',
        sgpaSemester6: appData.sgpaSemester6 || '',
        sgpaSemester7: appData.sgpaSemester7 || '',
        sgpaSemester8: appData.sgpaSemester8 || '',
      });
    }
    setActiveUpdateModal(type);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-400 text-sm font-semibold">Loading Application Details...</p>
      </div>
    );
  }

  const isSubmitted = appData.status && appData.status !== 'DRAFT';

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">My Application</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Manage your application details and track your submission status.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-850 transition-all duration-300 self-start sm:self-center">
          <Info className="h-4 w-4 text-blue-400" />
          Application Guidelines
        </button>
      </div>

      {/* Application Status Banner */}
      <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-black/10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-blue-400 shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 font-medium">Application Status</span>
              {appData.status === 'APPROVED' && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md text-xs font-extrabold tracking-wide">Approved</span>
              )}
              {appData.status === 'REJECTED' && (
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-md text-xs font-extrabold tracking-wide">Rejected</span>
              )}
              {appData.status === 'UNDER_VERIFICATION' && (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md text-xs font-extrabold tracking-wide">Under Verification</span>
              )}
              {appData.status === 'SUBMITTED' && (
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-md text-xs font-extrabold tracking-wide">Submitted</span>
              )}
              {(appData.status === 'DRAFT' || !appData.status) && (
                <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-0.5 rounded-md text-xs font-extrabold tracking-wide">Draft</span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              {isSubmitted 
                ? `Submitted on: ${appData.submittedAt ? new Date(appData.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}`
                : `Last saved: ${appData.updatedAt ? new Date(appData.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}`}
            </p>
            {appData.remarks && (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/10 rounded-lg p-2 mt-2 font-medium">
                CDC Remarks: {appData.remarks}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-xl max-w-sm">
          {isSubmitted ? (
            <>
              <Lock className="h-5 w-5 text-emerald-400 shrink-0" />
              <div className="text-xs text-slate-300">
                <p className="font-bold text-white">Your application is submitted</p>
                <p className="text-slate-400 font-medium">You can only update allowed fields.</p>
              </div>
            </>
          ) : (
            <>
              <Info className="h-5 w-5 text-blue-400 shrink-0" />
              <div className="text-xs text-slate-300">
                <p className="font-bold text-white">Application is in Draft Mode</p>
                <p className="text-slate-400 font-medium">Review all sections, save progress and click Submit when ready.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2.5 p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl shadow-xl shadow-black/10">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Application Completeness</span>
          <span className="text-blue-400 font-bold">{completionPct}%</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-12">
        {/* Left Form Column */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* Section 1: Personal Information */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/20 shadow-lg overflow-hidden transition-all">
            <button 
              onClick={() => toggleSection(1)}
              className="flex w-full items-center justify-between p-6 bg-slate-950/40 border-b border-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isSectionComplete(1) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {isSectionComplete(1) ? <Check className="h-4 w-4" /> : '1'}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Personal Information</h3>
                  <p className="text-xs text-slate-500 font-medium">Basic details, contact info, and identification</p>
                </div>
              </div>
              {expandedSections[1] ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {expandedSections[1] && (
              <div className="p-6 space-y-6">
                {isSubmitted && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 rounded-md"><Lock className="h-3 w-3" /> 🔒 Locked After Submission</span>}
                
                {/* Photo Upload Row */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-slate-900 bg-slate-900/10">
                  <div className="h-24 w-24 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    {appData.profileImage ? (
                      <img src={appData.profileImage} alt="Profile Photo" className="h-full w-full object-cover" />
                    ) : (
                      <FileText className="h-8 w-8 text-slate-700" />
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Profile Photo</h4>
                    <p className="text-xs text-slate-500 font-medium">Clear passport size photograph. Max 2MB (JPG/PNG)</p>
                    {!isSubmitted && (
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-850 cursor-pointer select-none">
                        {uploadLoading['profileImage'] ? <Loader2 className="h-3 w-3 animate-spin text-blue-500" /> : <Upload className="h-3 w-3 text-blue-400" />}
                        Upload Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          disabled={isSubmitted}
                          onChange={(e) => handleFileChange(e, 'profileImage', 'profile')}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                    <input 
                      type="text" 
                      disabled={isSubmitted}
                      value={appData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Enrollment Number</label>
                    <input 
                      type="text" 
                      disabled={isSubmitted}
                      value={appData.enrollmentNumber}
                      onChange={(e) => handleInputChange('enrollmentNumber', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Email</label>
                    <input 
                      type="email" 
                      disabled={isSubmitted}
                      value={appData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mobile Number</label>
                    <input 
                      type="tel" 
                      disabled={isSubmitted}
                      value={appData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Gender</label>
                    <select 
                      disabled={isSubmitted}
                      value={appData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Date of Birth</label>
                    <input 
                      type="date" 
                      disabled={isSubmitted}
                      value={appData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Documents & ID Proof */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/20 shadow-lg overflow-hidden transition-all">
            <button 
              onClick={() => toggleSection(2)}
              className="flex w-full items-center justify-between p-6 bg-slate-950/40 border-b border-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isSectionComplete(2) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {isSectionComplete(2) ? <Check className="h-4 w-4" /> : '2'}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Documents & ID Proof</h3>
                  <p className="text-xs text-slate-500 font-medium">Aadhar Card and other identification documents</p>
                </div>
              </div>
              {expandedSections[2] ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {expandedSections[2] && (
              <div className="p-6 space-y-6">
                {isSubmitted && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 rounded-md"><Lock className="h-3 w-3" /> 🔒 Locked After Submission</span>}

                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Aadhar Card Number</label>
                    <input 
                      type="text" 
                      disabled={isSubmitted}
                      maxLength={12}
                      placeholder="12 digit number"
                      value={appData.aadharNumber}
                      onChange={(e) => handleInputChange('aadharNumber', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">PAN Card (Optional)</label>
                    <input 
                      type="text" 
                      disabled={isSubmitted}
                      placeholder="PAN Number"
                      value={appData.panCard || ''}
                      onChange={(e) => handleInputChange('panCard', e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">College ID Card Number</label>
                    <input 
                      type="text" 
                      disabled={isSubmitted}
                      value={appData.collegeIdNumber}
                      onChange={(e) => handleInputChange('collegeIdNumber', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Family Details */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/20 shadow-lg overflow-hidden transition-all">
            <button 
              onClick={() => toggleSection(3)}
              className="flex w-full items-center justify-between p-6 bg-slate-950/40 border-b border-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isSectionComplete(3) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {isSectionComplete(3) ? <Check className="h-4 w-4" /> : '3'}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Family Details</h3>
                  <p className="text-xs text-slate-500 font-medium">Family background and emergency contact</p>
                </div>
              </div>
              {expandedSections[3] ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {expandedSections[3] && (
              <div className="p-6 space-y-6">
                {isSubmitted && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 rounded-md"><Lock className="h-3 w-3" /> 🔒 Locked After Submission</span>}

                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Father's Name</label>
                    <input 
                      type="text" 
                      disabled={isSubmitted}
                      value={appData.fatherName}
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Father's Occupation</label>
                    <input 
                      type="text" 
                      disabled={isSubmitted}
                      value={appData.fatherOccupation}
                      onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Father's Mobile Number</label>
                    <input 
                      type="tel" 
                      disabled={isSubmitted}
                      value={appData.fatherPhone}
                      onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mother's Name</label>
                    <input 
                      type="text" 
                      disabled={isSubmitted}
                      value={appData.motherName}
                      onChange={(e) => handleInputChange('motherName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mother's Occupation</label>
                    <input 
                      type="text" 
                      disabled={isSubmitted}
                      value={appData.motherOccupation}
                      onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mother's Mobile Number</label>
                    <input 
                      type="tel" 
                      disabled={isSubmitted}
                      value={appData.motherPhone}
                      onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Family Annual Income</label>
                    <input 
                      type="text" 
                      disabled={isSubmitted}
                      placeholder="e.g. ₹6,00,000"
                      value={appData.familyIncome}
                      onChange={(e) => handleInputChange('familyIncome', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Emergency Contact</label>
                    <input 
                      type="tel" 
                      disabled={isSubmitted}
                      placeholder="10 digit phone number"
                      value={appData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Address Details */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/20 shadow-lg overflow-hidden transition-all">
            <button 
              onClick={() => toggleSection(4)}
              className="flex w-full items-center justify-between p-6 bg-slate-950/40 border-b border-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isSectionComplete(4) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {isSectionComplete(4) ? <Check className="h-4 w-4" /> : '4'}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Address Details</h3>
                  <p className="text-xs text-slate-500 font-medium">Current Address and Permanent Address</p>
                </div>
              </div>
              {expandedSections[4] ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {expandedSections[4] && (
              <div className="p-6 space-y-6">
                {isSubmitted && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 rounded-md"><Lock className="h-3 w-3" /> 🔒 Locked After Submission</span>}

                <div className="space-y-6">
                  {/* Current Address */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Current Address</h4>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Street Address</label>
                        <input 
                          type="text" 
                          disabled={isSubmitted}
                          value={appData.currentAddress}
                          onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">City</label>
                        <input 
                          type="text" 
                          disabled={isSubmitted}
                          value={appData.currentCity}
                          onChange={(e) => handleInputChange('currentCity', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">State</label>
                        <input 
                          type="text" 
                          disabled={isSubmitted}
                          value={appData.currentState}
                          onChange={(e) => handleInputChange('currentState', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Pincode</label>
                        <input 
                          type="text" 
                          disabled={isSubmitted}
                          maxLength={6}
                          value={appData.currentPincode}
                          onChange={(e) => handleInputChange('currentPincode', e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Same as Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      disabled={isSubmitted}
                      checked={appData.sameAsCurrent}
                      onChange={(e) => handleInputChange('sameAsCurrent', e.target.checked)}
                      className="h-4.5 w-4.5 bg-slate-900 border border-slate-800 rounded text-blue-500 focus:ring-0 focus:ring-offset-0 disabled:opacity-50"
                    />
                    <span className="text-xs font-bold text-slate-300 group-hover:text-slate-100 select-none transition-colors">
                      Permanent Address is same as Current Address
                    </span>
                  </label>

                  {/* Permanent Address */}
                  <div className="space-y-4 pt-2 border-t border-slate-900/60">
                    <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Permanent Address</h4>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Street Address</label>
                        <input 
                          type="text" 
                          disabled={isSubmitted || appData.sameAsCurrent}
                          value={appData.permanentAddress}
                          onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">City</label>
                        <input 
                          type="text" 
                          disabled={isSubmitted || appData.sameAsCurrent}
                          value={appData.permanentCity}
                          onChange={(e) => handleInputChange('permanentCity', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">State</label>
                        <input 
                          type="text" 
                          disabled={isSubmitted || appData.sameAsCurrent}
                          value={appData.permanentState}
                          onChange={(e) => handleInputChange('permanentState', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Pincode</label>
                        <input 
                          type="text" 
                          disabled={isSubmitted || appData.sameAsCurrent}
                          maxLength={6}
                          value={appData.permanentPincode}
                          onChange={(e) => handleInputChange('permanentPincode', e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Academic Record */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/20 shadow-lg overflow-hidden transition-all">
            <button 
              onClick={() => toggleSection(5)}
              className="flex w-full items-center justify-between p-6 bg-slate-950/40 border-b border-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isSectionComplete(5) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {isSectionComplete(5) ? <Check className="h-4 w-4" /> : '5'}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Academic Record</h3>
                  <p className="text-xs text-slate-500 font-medium">10th, 12th, Diploma, Graduation and other academics</p>
                </div>
              </div>
              {expandedSections[5] ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {expandedSections[5] && (
              <div className="p-6 space-y-8">
                {isSubmitted && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 rounded-md"><Lock className="h-3 w-3" /> 🔒 Locked After Submission</span>}

                {/* 10th Standard Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Class 10th Record</h4>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Board (e.g. CBSE / ICSE / MPBSE)</label>
                      <input 
                        type="text" 
                        disabled={isSubmitted}
                        value={appData.class10Board}
                        onChange={(e) => handleInputChange('class10Board', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Percentage (%)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        disabled={isSubmitted}
                        value={appData.class10Percentage}
                        onChange={(e) => handleInputChange('class10Percentage', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Passing Year</label>
                      <input 
                        type="number" 
                        disabled={isSubmitted}
                        value={appData.class10PassingYear}
                        onChange={(e) => handleInputChange('class10PassingYear', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-4">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">School Name</label>
                      <input 
                        type="text" 
                        disabled={isSubmitted}
                        value={appData.class10School}
                        onChange={(e) => handleInputChange('class10School', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* 12th Standard Details */}
                <div className="space-y-4 pt-4 border-t border-slate-900/60">
                  <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Class 12th Record (Fill either 12th or Diploma)</h4>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Board (e.g. CBSE / State Board)</label>
                      <input 
                        type="text" 
                        disabled={isSubmitted}
                        placeholder="Leave blank if Diploma"
                        value={appData.class12Board || ''}
                        onChange={(e) => handleInputChange('class12Board', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Percentage (%)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        disabled={isSubmitted}
                        value={appData.class12Percentage || ''}
                        onChange={(e) => handleInputChange('class12Percentage', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Passing Year</label>
                      <input 
                        type="number" 
                        disabled={isSubmitted}
                        value={appData.class12PassingYear || ''}
                        onChange={(e) => handleInputChange('class12PassingYear', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-4">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">School Name</label>
                      <input 
                        type="text" 
                        disabled={isSubmitted}
                        value={appData.class12School || ''}
                        onChange={(e) => handleInputChange('class12School', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Diploma Details */}
                <div className="space-y-4 pt-4 border-t border-slate-900/60">
                  <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Diploma Details (Optional / Alternative to 12th)</h4>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Diploma College Name</label>
                      <input 
                        type="text" 
                        disabled={isSubmitted}
                        value={appData.diplomaCollege || ''}
                        onChange={(e) => handleInputChange('diplomaCollege', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Branch</label>
                      <input 
                        type="text" 
                        disabled={isSubmitted}
                        value={appData.diplomaBranch || ''}
                        onChange={(e) => handleInputChange('diplomaBranch', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Passing Year</label>
                      <input 
                        type="number" 
                        disabled={isSubmitted}
                        value={appData.diplomaPassingYear || ''}
                        onChange={(e) => handleInputChange('diplomaPassingYear', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">CGPA / Percentage</label>
                      <input 
                        type="number" 
                        step="0.01"
                        disabled={isSubmitted}
                        value={appData.diplomaCGPA || ''}
                        onChange={(e) => handleInputChange('diplomaCGPA', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Graduation Details */}
                <div className="space-y-4 pt-4 border-t border-slate-900/60">
                  <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Current Course Details</h4>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Current Course</label>
                      <input 
                        type="text" 
                        disabled={isSubmitted}
                        placeholder="e.g. B.Tech"
                        value={appData.currentCourse}
                        onChange={(e) => handleInputChange('currentCourse', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Current Branch</label>
                      <input 
                        type="text" 
                        disabled={isSubmitted}
                        placeholder="e.g. Computer Science"
                        value={appData.currentBranch}
                        onChange={(e) => handleInputChange('currentBranch', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Current Semester</label>
                      <input 
                        type="number" 
                        disabled={isSubmitted}
                        placeholder="1 to 8"
                        value={appData.currentSemester}
                        onChange={(e) => handleInputChange('currentSemester', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Current CGPA</label>
                      <input 
                        type="number" 
                        step="0.01"
                        disabled={isSubmitted}
                        placeholder="0.00 to 10.00"
                        value={appData.currentCGPA}
                        onChange={(e) => handleInputChange('currentCGPA', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Semester Wise SGPA Details */}
                <div className="space-y-4 pt-4 border-t border-slate-900/60">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Semester Wise SGPA</h4>
                    {isSubmitted && <span className="text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Editable Post-Submission</span>}
                  </div>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <div key={sem} className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Sem {sem} SGPA</label>
                        <input 
                          type="number" 
                          step="0.01"
                          disabled={isSubmitted} // Wait! Business rules say: "ONLY THESE 5 ITEMS CAN BE UPDATED AFTER SUBMISSION: ... Semester Wise SGPA". But editing is done in the "Allowed Updates" right panel post-submission, so we keep these form inputs locked in the main form, letting them edit only via the allowed updates action.
                          placeholder="e.g. 8.50"
                          value={appData[`sgpaSemester${sem}`] || ''}
                          onChange={(e) => handleInputChange(`sgpaSemester${sem}`, e.target.value === '' ? null : Number(e.target.value))}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Professional Profile */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/20 shadow-lg overflow-hidden transition-all">
            <button 
              onClick={() => toggleSection(6)}
              className="flex w-full items-center justify-between p-6 bg-slate-950/40 border-b border-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isSectionComplete(6) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {isSectionComplete(6) ? <Check className="h-4 w-4" /> : '6'}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Professional Profile</h3>
                  <p className="text-xs text-slate-500 font-medium">Career Preferences, Domains, Skills, Resume</p>
                </div>
              </div>
              {expandedSections[6] ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {expandedSections[6] && (
              <div className="p-6 space-y-6">
                {isSubmitted && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 rounded-md"><Lock className="h-3 w-3" /> 🔒 Locked After Submission</span>}

                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide font-sans">Career Preference</label>
                    <select 
                      disabled={isSubmitted}
                      value={appData.careerPreference}
                      onChange={(e) => handleInputChange('careerPreference', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Career Preference</option>
                      <option value="Job">Job</option>
                      <option value="Higher Studies">Higher Studies</option>
                      <option value="Startup">Startup</option>
                      <option value="Government Job">Government Job</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Primary Domain</label>
                    <select 
                      disabled={isSubmitted}
                      value={appData.primaryDomain}
                      onChange={(e) => handleInputChange('primaryDomain', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Domain</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Full Stack">Full Stack</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Cloud">Cloud</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Mobile Development">Mobile Development</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Secondary Domain (Optional)</label>
                    <select 
                      disabled={isSubmitted}
                      value={appData.secondaryDomain || ''}
                      onChange={(e) => handleInputChange('secondaryDomain', e.target.value || null)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">None</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Full Stack">Full Stack</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Cloud">Cloud</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Mobile Development">Mobile Development</option>
                    </select>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Skills (Add multiple)</label>
                  {!isSubmitted && (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type skill & press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        className="flex-1 px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          const val = skillInput.trim();
                          if (val && !appData.skills.includes(val)) {
                            handleInputChange('skills', [...appData.skills, val]);
                          }
                          setSkillInput('');
                        }}
                        className="px-4 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 p-4 min-h-[80px] bg-slate-900/30 border border-slate-900 rounded-xl">
                    {appData.skills && appData.skills.length > 0 ? (
                      appData.skills.map((skill: string) => (
                        <span 
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg font-medium"
                        >
                          {skill}
                          {!isSubmitted && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-slate-500 hover:text-white shrink-0 cursor-pointer"
                            >
                              &times;
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-600 text-xs italic font-medium">No skills added.</span>
                    )}
                  </div>
                </div>

                {/* Social Profiles */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><FaLinkedin className="h-3.5 w-3.5 text-blue-400" /> LinkedIn URL</label>
                    <input 
                      type="url" 
                      disabled={isSubmitted}
                      placeholder="https://linkedin.com/in/..."
                      value={appData.linkedinUrl || ''}
                      onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><FaGithub className="h-3.5 w-3.5 text-white" /> GitHub URL</label>
                    <input 
                      type="url" 
                      disabled={isSubmitted}
                      placeholder="https://github.com/..."
                      value={appData.githubUrl || ''}
                      onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-teal-400" /> Portfolio URL (Optional)</label>
                    <input 
                      type="url" 
                      disabled={isSubmitted}
                      placeholder="https://..."
                      value={appData.portfolioUrl || ''}
                      onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Resume Upload */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Resume (PDF)</label>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/10">
                    <div className="flex-1 min-w-0">
                      {appData.resumeUrl ? (
                        <a 
                          href={appData.resumeUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-sm font-semibold text-blue-400 hover:underline inline-flex items-center gap-1.5"
                        >
                          <FileText className="h-4 w-4" />
                          View Uploaded Resume
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-xs text-slate-600 italic font-medium">No resume uploaded.</p>
                      )}
                    </div>
                    {!isSubmitted && (
                      <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 cursor-pointer transition-all duration-300 select-none">
                        {uploadLoading['resumeUrl'] ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" /> : <Upload className="h-3.5 w-3.5 text-blue-400" />}
                        Upload Resume
                        <input 
                          type="file" 
                          accept="application/pdf"
                          disabled={isSubmitted}
                          onChange={(e) => handleFileChange(e, 'resumeUrl', 'resume')}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Section 7: Certifications */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/20 shadow-lg overflow-hidden transition-all">
            <button 
              onClick={() => toggleSection(7)}
              className="flex w-full items-center justify-between p-6 bg-slate-950/40 border-b border-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isSectionComplete(7) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {isSectionComplete(7) ? <Check className="h-4 w-4" /> : '7'}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Certifications</h3>
                  <p className="text-xs text-slate-500 font-medium">Add your certifications and achievements</p>
                </div>
              </div>
              {expandedSections[7] ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {expandedSections[7] && (
              <div className="p-6 space-y-6">
                {isSubmitted && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 rounded-md"><Lock className="h-3 w-3" /> 🔒 Locked After Submission</span>}

                <div className="space-y-4">
                  {appData.certifications && appData.certifications.length > 0 ? (
                    appData.certifications.map((cert: Certification, index: number) => (
                      <div key={index} className="p-5 border border-slate-900 bg-slate-900/10 rounded-2xl relative space-y-4">
                        {!isSubmitted && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveCertification(index)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Certification Name</label>
                            <input 
                              type="text" 
                              disabled={isSubmitted}
                              value={cert.name}
                              onChange={(e) => handleCertFieldChange(index, 'name', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Issuing Organization</label>
                            <input 
                              type="text" 
                              disabled={isSubmitted}
                              value={cert.issuingOrganization}
                              onChange={(e) => handleCertFieldChange(index, 'issuingOrganization', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Issue Date</label>
                            <input 
                              type="date" 
                              disabled={isSubmitted}
                              value={cert.issueDate}
                              onChange={(e) => handleCertFieldChange(index, 'issueDate', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
                            />
                          </div>
                        </div>

                        {/* Certificate File */}
                        <div className="flex items-center justify-between gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                          <div className="min-w-0">
                            {cert.certificateUrl ? (
                              <a 
                                href={cert.certificateUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-xs font-semibold text-blue-400 hover:underline inline-flex items-center gap-1.5"
                              >
                                View Certificate Link
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-600 italic">No certificate uploaded</span>
                            )}
                          </div>
                          {!isSubmitted && (
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-800 bg-slate-900 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer select-none">
                              {uploadLoading[`cert_${index}`] ? <Loader2 className="h-3 w-3 animate-spin text-blue-500" /> : <Upload className="h-3 w-3 text-blue-400" />}
                              Upload Doc
                              <input 
                                type="file" 
                                disabled={isSubmitted}
                                onChange={(e) => handleFileChange(e, '', 'certificate', index)}
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 border border-dashed border-slate-900 rounded-2xl text-center">
                      <HelpCircle className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">No certifications added. Click below to add one.</p>
                    </div>
                  )}

                  {!isSubmitted && (
                    <button 
                      type="button"
                      onClick={handleAddCertification}
                      className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/20 text-xs font-bold text-blue-400 hover:text-blue-300 hover:bg-slate-900/10 rounded-2xl transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add Certification
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Submit / Draft Actions */}
          {!isSubmitted && (
            <div className="flex items-center justify-end gap-4 pt-4">
              <button 
                type="button"
                disabled={saveLoading || submitLoading}
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 transition-all cursor-pointer disabled:opacity-50 select-none"
              >
                {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Draft'}
              </button>
              
              <button 
                type="button"
                disabled={saveLoading || submitLoading}
                onClick={() => setIsSubmitModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-lg shadow-blue-500/15 disabled:opacity-50 select-none"
              >
                {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application'}
              </button>
            </div>
          )}

        </div>

        {/* Right Side Widgets Column */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Allowed Updates Card */}
          {isSubmitted && (
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-xl space-y-5 shadow-xl shadow-black/10">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Allowed Updates (Only 4 fields)
                </h3>
                <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Active</span>
              </div>
              
              <div className="space-y-4">
                {/* Row 1: Resume */}
                <div className="flex items-center justify-between gap-4 p-3.5 border border-slate-900/60 bg-slate-900/10 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Update Resume</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Upload new CV / Resume</p>
                  </div>
                  <button 
                    onClick={() => openUpdateModal('resume')}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/25 hover:text-white rounded-lg transition-all cursor-pointer"
                  >
                    Update
                  </button>
                </div>

                {/* Row 2: Domains */}
                <div className="flex items-center justify-between gap-4 p-3.5 border border-slate-900/60 bg-slate-900/10 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Update Domains</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Primary & Secondary domains</p>
                  </div>
                  <button 
                    onClick={() => openUpdateModal('domains')}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/25 hover:text-white rounded-lg transition-all cursor-pointer"
                  >
                    Update
                  </button>
                </div>

                {/* Row 3: CGPA */}
                <div className="flex items-center justify-between gap-4 p-3.5 border border-slate-900/60 bg-slate-900/10 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Update CGPA</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Current Cumulative GPA</p>
                  </div>
                  <button 
                    onClick={() => openUpdateModal('cgpa')}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/25 hover:text-white rounded-lg transition-all cursor-pointer"
                  >
                    Update
                  </button>
                </div>

                {/* Row 4: SGPA */}
                <div className="flex items-center justify-between gap-4 p-3.5 border border-slate-900/60 bg-slate-900/10 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Update SGPA</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Semester-wise SGPA scores</p>
                  </div>
                  <button 
                    onClick={() => openUpdateModal('sgpa')}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/25 hover:text-white rounded-lg transition-all cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Application Summary Card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-xl space-y-4 shadow-xl shadow-black/10">
            <h3 className="text-sm font-bold text-white border-b border-slate-900 pb-3">Application Summary</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Application ID</span>
                <span className="text-blue-400 font-bold font-mono">
                  {appData.id ? `APP-${appData.id.slice(0, 8).toUpperCase()}` : 'N/A (Draft)'}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Course</span>
                <span className="text-slate-300 font-bold">{appData.currentCourse || profile?.course || 'Not Filled'}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Branch</span>
                <span className="text-slate-300 font-bold">{appData.currentBranch || profile?.branch || 'Not Filled'}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Graduation Batch</span>
                <span className="text-slate-300 font-bold">
                  {profile?.graduationYear ? `${profile.graduationYear - 4} - ${profile.graduationYear}` : 'Not Specified'}
                </span>
              </div>
              <div className="flex justify-between items-center font-medium pt-2 border-t border-slate-900/60">
                <span className="text-slate-500 font-bold">Status</span>
                <span className="text-slate-300">
                  {appData.status === 'APPROVED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Approved</span>}
                  {appData.status === 'REJECTED' && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Rejected</span>}
                  {appData.status === 'UNDER_VERIFICATION' && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Under Verification</span>}
                  {appData.status === 'SUBMITTED' && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Submitted</span>}
                  {(!appData.status || appData.status === 'DRAFT') && <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Draft</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Need Help? Card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-xl space-y-4 shadow-xl shadow-black/10">
            <h3 className="text-sm font-bold text-white">Need Help?</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              If you have any questions about your application, please contact our support team.
            </p>
            <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-blue-400 hover:text-white rounded-xl transition-all cursor-pointer">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </button>
          </div>

          {/* Bottom Lock Note */}
          <div className="flex gap-2.5 p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-[11px] text-slate-400 leading-normal">
            <Info className="h-4.5 w-4.5 text-blue-400 shrink-0" />
            <p className="font-semibold">
              <span className="font-bold text-slate-200">Note: </span>
              You can only update the above 4 fields after submission. All other information is locked to maintain data integrity.
            </p>
          </div>

        </div>
      </div>

      {/* CONFIRMATION SUBMIT MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSubmitModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Confirm Application Submission</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  After submission most fields will become permanently locked and cannot be edited.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-900 bg-slate-950 hover:bg-slate-900 text-slate-400 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSubmitApplication}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALLOWED UPDATES MODALS */}
      {activeUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveUpdateModal(null)}></div>
          
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-6">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="text-base font-bold text-white">
                {activeUpdateModal === 'resume' && 'Update Resume'}
                {activeUpdateModal === 'domains' && 'Update Domains'}
                {activeUpdateModal === 'cgpa' && 'Update CGPA'}
                {activeUpdateModal === 'sgpa' && 'Update SGPA Scores'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Update allowed application values below</p>
            </div>

            <div className="space-y-4">
              {/* Resume update block */}
              {activeUpdateModal === 'resume' && (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Resume (PDF)</label>
                  <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-900 bg-slate-900/10">
                    {tempResumeUrl ? (
                      <span className="text-xs font-bold text-blue-400 truncate flex items-center gap-1.5"><FileText className="h-4 w-4" /> CV / Resume uploaded</span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">No file uploaded</span>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all duration-300 select-none">
                      {uploadLoading['resumeUrl'] ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" /> : <Upload className="h-3.5 w-3.5 text-blue-400" />}
                      Upload New PDF
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.type !== 'application/pdf') {
                            toastError('Resume must be a PDF file');
                            return;
                          }
                          setUploadLoading(prev => ({ ...prev, resumeUrl: true }));
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const res = await api.post(`/applications/upload?type=resume`, formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            setTempResumeUrl(res.data.data.url);
                            toastSuccess('Resume uploaded');
                          } catch (err) {
                            toastError('Upload failed');
                          } finally {
                            setUploadLoading(prev => ({ ...prev, resumeUrl: false }));
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Domains update block */}
              {activeUpdateModal === 'domains' && (
                <div className="grid gap-4 grid-cols-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Primary Domain</label>
                    <select 
                      value={tempPrimaryDomain}
                      onChange={(e) => setTempPrimaryDomain(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Full Stack">Full Stack</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Cloud">Cloud</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Mobile Development">Mobile Development</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Secondary Domain (Optional)</label>
                    <select 
                      value={tempSecondaryDomain}
                      onChange={(e) => setTempSecondaryDomain(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">None</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Full Stack">Full Stack</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Cloud">Cloud</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Mobile Development">Mobile Development</option>
                    </select>
                  </div>
                </div>
              )}

              {/* CGPA update block */}
              {activeUpdateModal === 'cgpa' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Current Cumulative CGPA</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00 to 10.00"
                    value={tempCGPA}
                    onChange={(e) => setTempCGPA(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* SGPA update block */}
              {activeUpdateModal === 'sgpa' && (
                <div className="grid gap-3 grid-cols-2 max-h-[200px] overflow-y-auto pr-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <div key={sem} className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Sem {sem} SGPA</label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g. 8.50"
                        value={tempSGPAs[`sgpaSemester${sem}`] || ''}
                        onChange={(e) => setTempSGPAs(prev => ({ ...prev, [`sgpaSemester${sem}`]: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setActiveUpdateModal(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-900 bg-slate-950 hover:bg-slate-900 text-slate-400 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => handlePostSubmissionUpdate(activeUpdateModal)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer font-semibold"
              >
                Apply Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
