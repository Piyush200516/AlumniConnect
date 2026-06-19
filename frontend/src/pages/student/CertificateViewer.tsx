import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Award, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { toastError } from '../../utils/toast';

interface Certificate {
  id: string;
  issuedAt: string;
  registration: {
    user: {
      fullName: string;
    }
  };
  event: {
    title: string;
    eventDate: string;
    category: string;
  };
}

interface CertificateViewerProps {
  certificateId: string;
  onGoBack: () => void;
}

export default function CertificateViewer({ certificateId, onGoBack }: CertificateViewerProps) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificateDetails();
  }, [certificateId]);

  const fetchCertificateDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/my-certificates`);
      const allCerts = res.data.data || [];
      const match = allCerts.find((c: any) => c.id === certificateId);
      if (match) {
        setCert(match);
      } else {
        toastError('Certificate not found');
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-slate-400 text-sm font-semibold">Loading certificate details...</p>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="text-center p-16 space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Certificate details not found</h3>
        <button onClick={onGoBack} className="text-blue-400 font-bold hover:underline flex items-center gap-1 mx-auto">
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  const issueDate = new Date(cert.issuedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const eventDate = new Date(cert.event.eventDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 print:p-0">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={onGoBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </button>

        <button 
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

      {/* Printable Certificate Frame */}
      <div className="flex justify-center items-center py-6 print:py-0 print:bg-white">
        
        {/* Certificate Container */}
        <div 
          id="certificate-print-area"
          className="relative w-full max-w-4xl aspect-[1.414/1] bg-amber-50/90 text-slate-900 border-[16px] border-double border-amber-800 p-8 sm:p-12 md:p-16 flex flex-col justify-between items-center text-center shadow-2xl rounded-2xl print:border-[16px] print:rounded-none print:shadow-none print:bg-amber-50"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-4 left-4 text-amber-800/20 text-3xl font-serif">♦</div>
          <div className="absolute top-4 right-4 text-amber-800/20 text-3xl font-serif">♦</div>
          <div className="absolute bottom-4 left-4 text-amber-800/20 text-3xl font-serif">♦</div>
          <div className="absolute bottom-4 right-4 text-amber-800/20 text-3xl font-serif">♦</div>

          {/* Header */}
          <div className="space-y-2.5">
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-amber-900 font-sans">
              Acropolis Institute of Technology and Research
            </h2>
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-500 uppercase font-sans">
              Career Development Cell (CDC)
            </p>
            <div className="h-[2px] w-24 bg-amber-850 mx-auto mt-2"></div>
          </div>

          {/* Body */}
          <div className="space-y-6 flex-1 flex flex-col justify-center items-center my-6">
            <div className="flex flex-col items-center gap-1">
              <Award className="h-10 w-10 text-amber-700 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal text-amber-900 tracking-wide mt-2 italic font-serif">
                Certificate of Participation
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 font-medium font-sans">
              This certificate is proudly presented to
            </p>
            
            {/* Student Name */}
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold border-b border-slate-350 pb-2 px-8 min-w-[200px] text-amber-950 font-serif">
              {cert.registration.user.fullName}
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-650 leading-relaxed max-w-xl font-medium font-sans">
              for actively participating and successfully completing the {cert.event.category} entitled
              <br />
              <strong className="text-amber-900 font-bold block mt-1.5 text-sm sm:text-base">
                "{cert.event.title}"
              </strong>
              <br />
              held on <span className="font-semibold text-slate-800">{eventDate}</span> organized by AlumniConnect student portal.
            </p>
          </div>

          {/* Signatures & Footer */}
          <div className="w-full flex items-center justify-between border-t border-slate-300 pt-6 text-[10px] sm:text-xs text-slate-500 shrink-0 font-sans">
            <div className="text-left">
              <p className="font-extrabold text-amber-900">AITR CDC Division</p>
              <p className="font-medium text-slate-400 mt-0.5">Official Verification Seal</p>
              <p className="text-[9px] text-slate-400 mt-2 font-mono">ID: {cert.id.substring(0, 8).toUpperCase()}</p>
            </div>
            
            <div className="text-right">
              <p className="font-extrabold text-slate-800 underline decoration-double decoration-amber-700 decoration-1">CDC Coordinator</p>
              <p className="font-medium text-slate-400 mt-0.5">Authorized Signature</p>
              <p className="text-[9px] text-slate-400 mt-2">Issued: {issueDate}</p>
            </div>
          </div>

        </div>

      </div>

      {/* CSS @media print style injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-area, #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            border: 12px double #854d0e !important;
            box-shadow: none !important;
            background-color: #fffbeb !important;
            padding: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
