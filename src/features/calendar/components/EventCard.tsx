"use client";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string | null;
    isAllDay: boolean;
    color: string | null;
    createdBy: {
      displayName: string;
    };
  };
  onClick: () => void;
}

const COLOR_CLASSES: Record<string, string> = {
  pink: "bg-pink-400",
  red: "bg-red-400",
  orange: "bg-orange-400",
  yellow: "bg-yellow-400",
  green: "bg-green-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
};

export function EventCard({ event, onClick }: EventCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-[var(--color-border-default)] bg-white p-3 text-left transition-colors hover:bg-[var(--color-bg-subtle)]"
    >
      <div className="flex items-center gap-2">
        <div
          className={`size-3 rounded-full ${COLOR_CLASSES[event.color ?? "pink"] ?? "bg-pink-400"}`}
        />
        <h4 className="font-medium text-[var(--color-text-default)]">
          {event.title}
        </h4>
      </div>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        {event.isAllDay ? (
          "終日"
        ) : (
          <>
            {formatTime(event.startAt)}
            {event.endAt && ` - ${formatTime(event.endAt)}`}
          </>
        )}
      </p>
      {event.description && (
        <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-muted)]">
          {event.description}
        </p>
      )}
    </button>
  );
}
