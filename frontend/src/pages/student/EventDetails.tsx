import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  Check, 
  Loader2, 
  Share2, 
  CalendarPlus,
  AlertTriangle,
  X,
  QrCode,
  Download,
  Info,
  ExternalLink
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import api from '../../services/api';
import { toastSuccess, toastError } from '../../utils/toast';
import { useAuthContext } from '../../components/layout/AuthProvider';

interface Event {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  category: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  eventDate: string;
  eventTime: string;
  duration: string;
  venue: string;
  googleMapsLocation: string | null;
  totalSeats: number;
  availableSeats: number;
  registrationDeadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  speakerName: string;
  speakerDesignation: string | null;
  speakerCompany: string | null;
  agenda: string | null;
  keyBenefits: string[];
  eligibilityCriteria: string | null;
  requiredDocuments: string[];
}

interface Registration {
  id: string;
  registrationId: string;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';
  qrCodeUrl: string | null;
  eventPassUrl: string | null;
}

interface EventDetailsProps {
  eventId: string;
  onGoBack: () => void;
}

export default function EventDetails({ eventId, onGoBack }: EventDetailsProps) {
  const { profile } = useAuthContext();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Registration Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Tab selection inside detail
  const [detailTab, setDetailTab] = useState<'agenda' | 'benefits'>('agenda');

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data.data);
      
      // Check if student is already registered
      if (res.data.data.registrations && res.data.data.registrations.length > 0) {
        const activeReg = res.data.data.registrations[0];
        if (activeReg.status === 'REGISTERED' || activeReg.status === 'ATTENDED') {
          setRegistration(activeReg);
        } else {
          setRegistration(null);
        }
      }
    } catch (err: any) {
      console.error(err);
      toastError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    // Only check account verification & resume — profile photo/details are NOT required for event registration
    const isAppSubmitted = profile?.verificationStatus === 'VERIFIED';
    const isResumeUploaded = !!profile?.resumeUrl;

    if (!isAppSubmitted || !isResumeUploaded) {
      let missingMsg = 'You are not eligible to register. Missing requirements:\n';
      if (!isAppSubmitted) missingMsg += '• Approved CDC Portal Application\n';
      if (!isResumeUploaded) missingMsg += '• Uploaded Resume PDF';
      toastError(missingMsg);
      return;
    }

    setIsConfirmOpen(true);
  };

  const confirmRegistration = async () => {
    setSubmitLoading(true);
    try {
      const res = await api.post(`/events/${eventId}/register`);
      toastSuccess('Registration successful!');
      setRegistration(res.data.data);
      setIsConfirmOpen(false);
      setIsPassOpen(true); // Automatically show pass on success
      fetchEventDetails(); // Reload seats
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to complete registration');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event) return;
    if (!window.confirm('Are you sure you want to cancel your registration?')) {
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post(`/events/${eventId}/cancel`);
      toastSuccess('Registration cancelled successfully');
      setRegistration(null);
      fetchEventDetails();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/student/events/${eventId}`;
    navigator.clipboard.writeText(shareUrl);
    toastSuccess('Event link copied to clipboard!');
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    // Generate simple ICS content file for download
    const title = event.title.replace(/[,;]/g, ' ');
    const desc = event.description.replace(/[,;]/g, ' ');
    const venue = event.venue.replace(/[,;]/g, ' ');
    const startDate = new Date(event.eventDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    // Assume duration is 2 hours if not parseable
    const endDate = new Date(new Date(event.eventDate).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${venue}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess('ICS Calendar invite downloaded!');
  };

  const handlePrintPass = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !event || !registration) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Event Pass - ${event.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
              text-align: center;
            }
            .pass-card {
              border: 2px solid #333;
              border-radius: 16px;
              padding: 30px;
              max-width: 500px;
              margin: 0 auto;
              background-color: #fff;
            }
            h2 { margin-top: 0; color: #1e3a8a; }
            .details { text-align: left; margin: 20px 0; font-size: 14px; line-height: 1.6; }
            .qr-code { margin: 20px 0; }
            .footer { font-size: 11px; color: #777; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="pass-card">
            <h2>AlumniConnect Event Pass</h2>
            <div class="qr-code">
              <img src="${registration.qrCodeUrl}" alt="QR Pass" width="200" height="200" />
            </div>
            <p><strong>Registration ID:</strong> ${registration.registrationId}</p>
            <div class="details">
              <p><strong>Event:</strong> ${event.title}</p>
              <p><strong>Date & Time:</strong> ${new Date(event.eventDate).toLocaleDateString('en-IN')} | ${event.eventTime}</p>
              <p><strong>Venue:</strong> ${event.venue}</p>
              <p><strong>Attendee:</strong> ${profile?.fullName || 'Student'}</p>
            </div>
            <p class="footer">Acropolis Institute of Technology and Research CDC Portal. Please carry this pass to the venue.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-400 text-sm font-semibold">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center p-16 space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Event not found</h3>
        <button onClick={onGoBack} className="text-blue-400 font-bold hover:underline flex items-center gap-1 mx-auto">
          <ArrowLeft className="h-4 w-4" /> Go back to events list
        </button>
      </div>
    );
  }

  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isSeatsFull = event.availableSeats <= 0;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button 
        onClick={onGoBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Events Feed
      </button>

      {/* Hero Header */}
      <div className="relative rounded-3xl border border-slate-900 overflow-hidden bg-slate-950/40 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
        {/* Banner container */}
        <div className="h-44 w-full md:w-72 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shrink-0 relative">
          {event.bannerUrl ? (
            <img src={event.bannerUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-blue-950/20 to-indigo-950/30">
              <CalendarIcon className="h-12 w-12 text-slate-700" />
            </div>
          )}
          <span className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
            {event.mode}
          </span>
        </div>

        {/* Title details */}
        <div className="space-y-4 flex-1">
          <div>
            <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">{event.category}</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1 leading-snug">{event.title}</h1>
            <p className="text-slate-400 text-xs font-medium mt-1">Organized by CDC / Alumni Coordinator</p>
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
            <span className="bg-slate-900 border border-slate-850 px-3 py-1 rounded-lg">
              {event.availableSeats} of {event.totalSeats} seats left
            </span>
            <span className="bg-slate-900 border border-slate-850 px-3 py-1 rounded-lg">
              Deadline: {new Date(event.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-12">
        {/* Left Column - Agenda & Description */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Description */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">About the Event</h3>
            <p className="text-slate-350 text-xs leading-relaxed font-semibold">
              {event.description}
            </p>
          </div>

          {/* Speaker Card */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Speaker Profile</h3>
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl border border-slate-850 overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center text-lg font-bold text-slate-650">
                {event.speakerName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div>
                  <h4 className="text-sm font-bold text-white">{event.speakerName}</h4>
                  <p className="text-xs text-slate-500">{event.speakerDesignation || 'Guest Speaker'} at {event.speakerCompany || 'Industry Partner'}</p>
                </div>
                {/* Speaker Social */}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); toastSuccess('Redirecting to speaker profile...'); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-850 bg-slate-900 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FaLinkedin className="h-3.5 w-3.5" /> LinkedIn Profile
                </a>
              </div>
            </div>
          </div>

          {/* Agenda & Benefits Tabs */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/20 overflow-hidden">
            <div className="flex border-b border-slate-900 bg-slate-950/40">
              <button 
                onClick={() => setDetailTab('agenda')}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                  detailTab === 'agenda' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Event Agenda
              </button>
              <button 
                onClick={() => setDetailTab('benefits')}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                  detailTab === 'benefits' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Key Benefits
              </button>
            </div>
            
            <div className="p-6">
              {detailTab === 'agenda' ? (
                <div className="text-slate-350 text-xs leading-relaxed font-semibold whitespace-pre-line">
                  {event.agenda || 'No formal agenda provided. The event will cover interactive domain talks followed by Q&A sessions.'}
                </div>
              ) : (
                <ul className="space-y-3">
                  {event.keyBenefits && event.keyBenefits.length > 0 ? (
                    event.keyBenefits.map((benefit, idx) => (
                      <li key={idx} className="flex gap-3 text-xs font-semibold text-slate-300">
                        <Check className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex gap-3 text-xs font-semibold text-slate-350">
                      <Check className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>Gain direct insights from industry alumni specialists</span>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Requirements & Required Docs */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Eligibility Criteria</h4>
              <p className="text-xs font-semibold text-slate-350 leading-relaxed bg-slate-900/30 border border-slate-900 p-3 rounded-xl">
                {event.eligibilityCriteria || 'Open to all semesters and branches of AITR students.'}
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Required Items / Docs</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-300">
                {event.requiredDocuments && event.requiredDocuments.length > 0 ? (
                  event.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-500">•</span> {doc}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex gap-2"><span className="text-blue-500">•</span> College ID Card</li>
                    <li className="flex gap-2"><span className="text-blue-500">•</span> Printout / QR Code Event Pass</li>
                  </>
                )}
              </ul>
            </div>
          </div>

        </div>

        {/* Right Column - Logistics & Actions */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Action Registration Desk */}
          <div className="p-6 rounded-2xl border border-slate-900/80 bg-slate-950/40 backdrop-blur-xl shadow-xl shadow-black/10 space-y-6">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">Register For Event</h4>
              <p className="text-xs text-slate-500 font-medium">Verify your pass and attendance details.</p>
            </div>

            {registration ? (
              <div className="space-y-3">
                <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-white">You are registered!</p>
                    <p className="text-slate-400 mt-0.5">Registration ID: {registration.registrationId}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setIsPassOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <QrCode className="h-4 w-4" /> View Pass
                  </button>
                  <button 
                    disabled={submitLoading}
                    onClick={handleCancelRegistration}
                    className="w-full py-2.5 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900 text-rose-450 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {submitLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Cancel Registration'}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                disabled={isDeadlinePassed || isSeatsFull || submitLoading}
                onClick={handleRegisterClick}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 disabled:border disabled:border-slate-850 disabled:text-slate-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register for Event'}
              </button>
            )}

            {/* General checks info */}
            {!registration && (
              <div className="flex gap-2 text-[10px] text-slate-500 leading-normal font-semibold border-t border-slate-900 pt-4">
                <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  Requires a verified CDC portal application and uploaded resume PDF to enroll.
                </p>
              </div>
            )}
          </div>

          {/* Event Logistics */}
          <div className="rounded-2xl border border-slate-900/80 bg-slate-950/40 p-6 backdrop-blur-xl space-y-5 shadow-xl shadow-black/10">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">Event Logistics</h3>
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Date</p>
                  <p className="text-slate-200 mt-0.5">{new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Time & Duration</p>
                  <p className="text-slate-200 mt-0.5">{event.eventTime} ({event.duration})</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Venue</p>
                  <p className="text-slate-200 mt-0.5">{event.venue}</p>
                  {event.googleMapsLocation && (
                    <a 
                      href={event.googleMapsLocation} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] text-blue-400 hover:underline inline-flex items-center gap-1 mt-1 font-bold"
                    >
                      View on Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Seats Availability</p>
                  <p className="text-slate-200 mt-0.5">{event.availableSeats} of {event.totalSeats} seats remaining</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-900 flex gap-2">
              <button 
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-850 hover:border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button 
                onClick={handleAddToCalendar}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-850 hover:border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <CalendarPlus className="h-4 w-4" /> Calendar
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* CONFIRM REGISTRATION MODAL */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsConfirmOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex shrink-0">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-md font-bold text-white">Confirm Event Registration</h3>
                <p className="text-xs text-slate-400">Do you want to enroll in the following event?</p>
              </div>
              <button onClick={() => setIsConfirmOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-900/50 p-4 border border-slate-900 rounded-xl space-y-1.5 text-xs">
              <p className="font-bold text-white">{event.title}</p>
              <p className="text-slate-500">Date: {new Date(event.eventDate).toLocaleDateString('en-IN')} | {event.eventTime}</p>
              <p className="text-slate-500">Venue: {event.venue}</p>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              By registering, you confirm that you will attend. Cancellations are permitted up to 24 hours in advance. "No Show" statuses are logged on student profiles.
            </p>

            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Go Back
              </button>
              <button 
                disabled={submitLoading}
                onClick={confirmRegistration}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer flex items-center gap-1.5"
              >
                {submitLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT PASS / QR MODAL */}
      {isPassOpen && registration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPassOpen(false)}></div>
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl text-slate-200 z-10 flex flex-col items-center text-center space-y-6">
            
            <div className="flex w-full items-center justify-between border-b border-slate-900 pb-3 shrink-0">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">Event Pass Passcode</span>
              <button onClick={() => setIsPassOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* QR display */}
            <div className="p-4 bg-white rounded-2xl shadow-xl shadow-black/30 shrink-0">
              {registration.qrCodeUrl ? (
                <img 
                  src={registration.qrCodeUrl} 
                  alt="Registration QR Code" 
                  className="h-44 w-44 object-contain" 
                />
              ) : (
                <div className="h-44 w-44 bg-slate-900 rounded flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs w-full">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Registration Pass ID</p>
              <p className="text-lg font-extrabold text-white tracking-widest bg-slate-900 border border-slate-850 py-1 rounded-xl">
                {registration.registrationId}
              </p>
            </div>

            <div className="text-xs text-left w-full space-y-2 bg-slate-900/30 p-4 border border-slate-900 rounded-xl leading-normal font-semibold">
              <p className="truncate"><strong className="text-slate-500">Event:</strong> <span className="text-slate-200">{event.title}</span></p>
              <p><strong className="text-slate-500">Date/Time:</strong> <span className="text-slate-200">{new Date(event.eventDate).toLocaleDateString('en-IN')} ({event.eventTime})</span></p>
              <p className="truncate"><strong className="text-slate-500">Venue:</strong> <span className="text-slate-200">{event.venue}</span></p>
              <p className="truncate"><strong className="text-slate-500">Attendee:</strong> <span className="text-slate-200">{profile?.fullName}</span></p>
            </div>

            <button 
              onClick={handlePrintPass}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download/Print Pass
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
