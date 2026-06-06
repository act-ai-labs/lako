'use client';

import { useEffect, useState } from 'react';
import { flushSyncQueue, getOfflineDb, getSyncStatus } from '@/lib/offline-db';

export function OfflineStatus() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [conflicts, setConflicts] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let active = true;

    async function refreshStatus() {
      const status = await getSyncStatus();
      if (!active) return;
      setPending(status.pending);
      setConflicts(status.conflicts);
    }

    async function syncAndRefresh() {
      setOnline(navigator.onLine);
      if (navigator.onLine) {
        setSyncing(true);
        await flushSyncQueue().finally(() => setSyncing(false));
      }
      await refreshStatus();
    }

    void getOfflineDb().then(syncAndRefresh);
    window.addEventListener('online', syncAndRefresh);
    window.addEventListener('offline', syncAndRefresh);
    const interval = window.setInterval(refreshStatus, 5000);

    return () => {
      active = false;
      window.removeEventListener('online', syncAndRefresh);
      window.removeEventListener('offline', syncAndRefresh);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-700">
      <span className={online ? 'text-emerald-700' : 'font-semibold text-red-700'}>
        {online ? 'Online' : 'Offline mode'}
      </span>
      <span className="mx-2">|</span>
      <span>{syncing ? 'Syncing...' : pending === 0 ? 'All synced' : `${pending} pending`}</span>
      {conflicts > 0 ? (
        <>
          <span className="mx-2">|</span>
          <span className="font-semibold text-amber-700">{conflicts} conflict(s) for review</span>
        </>
      ) : null}
    </div>
  );
}
