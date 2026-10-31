"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationCenter() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function fetchNotifications() {
    if (!session?.user?.id) return;
    try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data.notifications);
    } catch (e) {}
  }

  useEffect(() => {
    if (mounted && session?.user?.id) {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }
  }, [session, mounted]);

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  if (!mounted || !session) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-text-muted hover:text-signal transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-critical text-white text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-panel border border-panelLine shadow-2xl z-50 rounded-sm">
          <div className="p-3 border-b border-panelLine flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Intelligence Alerts</span>
            {unreadCount > 0 && (
                <button
                    onClick={markAllRead}
                    className="text-[8px] font-mono text-signal uppercase hover:underline"
                >
                    Mark all read
                </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[10px] font-mono text-text-muted italic">All quiet on the network...</p>
              </div>
            ) : (
              notifications.map(n => (
                <Link
                    key={n.id}
                    href={n.link || "#"}
                    onClick={() => {
                        markAsRead(n.id);
                        setOpen(false);
                    }}
                    className={`block p-4 border-b border-panelLine hover:bg-ink/40 transition-colors ${!n.read ? "border-l-2 border-l-signal" : ""}`}
                >
                  <h4 className={`text-xs mb-1 ${!n.read ? "font-bold text-text" : "text-text-muted"}`}>{n.title}</h4>
                  <p className="text-[10px] text-text-muted leading-tight font-mono">{n.message}</p>
                  <span className="text-[8px] text-text-muted uppercase mt-2 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
