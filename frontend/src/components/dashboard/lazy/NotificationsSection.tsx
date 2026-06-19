import AnnouncementCard from '../AnnouncementCard';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

interface NotificationsSectionProps {
  notifications: NotificationItem[];
  loading: boolean;
}

export default function NotificationsSection({ notifications, loading }: NotificationsSectionProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl border border-slate-900 bg-slate-900/10 p-4 animate-pulse flex gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-800 shrink-0 mt-1.5" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-3/4 bg-slate-850 rounded" />
              <div className="h-2.5 w-1/2 bg-slate-850 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return <p className="text-xs text-slate-550 italic py-2">No recent announcements or alerts.</p>;
  }

  const mapTypeColor = (type: string) => {
    switch (type) {
      case 'EVENT_CREATED': return 'blue';
      case 'JOB_POSTED': return 'green';
      case 'MENTORSHIP_ACCEPTED': return 'purple';
      case 'SYSTEM': return 'orange';
      default: return 'blue';
    }
  };

  const getPostedTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return '1d ago';
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col gap-3.5">
      {notifications.map((notification) => (
        <AnnouncementCard
          key={notification.id}
          title={notification.title}
          description={notification.message}
          timestamp={getPostedTime(notification.createdAt)}
          statusColor={mapTypeColor(notification.type)}
        />
      ))}
    </div>
  );
}
