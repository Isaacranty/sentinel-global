"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Activity = {
  id: string;
  type: string;
  data: any;
  user: { name: string };
  createdAt: string;
};

function formatActivity(activity: Activity) {
  const { name } = activity.user;
  switch (activity.type) {
    case "CHALLENGE_SOLVED":
      return (
        <>
          Operator <span className="text-signal">{name}</span> decrypted{" "}
          <span className="text-text">{activity.data.challengeTitle}</span>
        </>
      );
    case "COURSE_COMPLETED":
      return (
        <>
          Operator <span className="text-signal">{name}</span> finished training:{" "}
          <span className="text-text">{activity.data.courseTitle}</span>
        </>
      );
    case "VERIFIED_SIGNAL":
      return (
        <>
          Signal from <span className="text-signal">{name}</span> was{" "}
          <span className="text-signal">VERIFIED</span> by Command.
        </>
      );
    case "LEVEL_UP":
        return (
          <>
            Operator <span className="text-signal">{name}</span> reached{" "}
            <span className="text-signal uppercase">Security Level {activity.data.level}</span>
          </>
        );
    case "THREAD_CREATED":
        return (
            <>
              Operator <span className="text-signal">{name}</span> initiated a new discussion.
            </>
        );
    case "XP_EARNED":
        return (
            <>
              Operator <span className="text-signal">{name}</span> earned XP.
            </>
        );
    case "SQUAD_JOINED":
        return (
            <>
              Operator <span className="text-signal">{name}</span> joined a squad.
            </>
        );
    default:
      return `New activity from ${name}`;
  }
}

export default function ActivityHeartbeat() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetch("/api/activities")
      .then(res => res.json())
      .then(data => setActivities(data.activities))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-panel border border-panelLine rounded-sm p-4 h-full">
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="blip absolute inline-flex h-full w-full rounded-full bg-signal/70" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-signal" />
        </span>
        Global Activity Heartbeat
      </h3>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-[10px] font-mono text-text-muted italic">Waiting for signals...</p>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="text-[10px] font-mono leading-tight border-l border-panelLine pl-3">
              <p className="text-text-muted mb-0.5">
                {formatActivity(a)}
              </p>
              <span className="text-[8px] text-text-muted uppercase">
                {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
              </span>
            </div>
          ))
        )}
      </div>

      <Link
        href="/feed"
        className="mt-6 block text-[8px] font-mono text-center text-text-muted hover:text-signal transition-colors uppercase tracking-widest border-t border-panelLine pt-3"
      >
        View Full Tactical Log →
      </Link>
    </div>
  );
}
