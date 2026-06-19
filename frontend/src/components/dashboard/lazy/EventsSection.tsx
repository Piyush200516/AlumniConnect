import EventCard from '../EventCard';

interface EventItem {
  id: string;
  title: string;
  category: string;
  speakerName: string;
  speakerCompany: string | null;
  eventDate: string;
  eventTime: string;
  venue: string;
  bannerUrl: string | null;
}

interface EventsSectionProps {
  events: EventItem[];
  loading: boolean;
}

export default function EventsSection({ events, loading }: EventsSectionProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-slate-850 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-slate-850 rounded" />
              <div className="h-3 w-1/2 bg-slate-850 rounded" />
            </div>
            <div className="h-6 w-16 bg-slate-850 rounded shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-xs text-slate-550 italic py-2">No upcoming events scheduled.</p>;
  }

  return (
    <div className="flex flex-col gap-3.5">
      {events.map((event) => (
        <EventCard
          key={event.id}
          title={event.title}
          organizer={`By ${event.speakerName}${event.speakerCompany ? ' (' + event.speakerCompany + ')' : ''}`}
          date={new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          time={event.eventTime}
          imageUrl={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&auto=format&fit=crop&q=80'}
          location={event.venue}
        />
      ))}
    </div>
  );
}
