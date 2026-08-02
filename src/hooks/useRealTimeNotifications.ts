import { useEffect, useState } from 'react';
import { useDashboardData } from './useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { useTagihans } from '@/hooks/useTagihans';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
}

// Tahap final → tidak perlu dialert lagi
const isStatusFinal = (status?: string) =>
  !!status && /payment|selesai/i.test(status);

export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { userProfile } = useAuth();
  const { contracts } = useDashboardData();
  const { tagihans } = useTagihans();

  // 🔥 SLA ALERT (tanpa supabase)
  useEffect(() => {
    if (!contracts || !userProfile) return;

    const now = new Date();
    const alerts: Notification[] = [];

    contracts.forEach((c: any) => {

      // 🔥 KOM terlambat
      if (c.status_kontrak === 'Pre-KOM' && c.tanggal_maksimal_kom) {
        const komDate = new Date(c.tanggal_maksimal_kom);
        if (komDate < now) {
          alerts.push({
            id: `kom-${c.id_kontrak}`,
            title: 'KOM Terlambat',
            message: `Kontrak "${c.judul_kontrak}" melewati batas KOM`,
            type: 'kom_overdue',
            read: false
          });
        }
      }

      // 🔥 Progress tertinggal
      if (c.progress_plan && c.progress_actual) {
        const diff = c.progress_plan - c.progress_actual;
        if (diff > 10) {
          alerts.push({
            id: `progress-${c.id_kontrak}`,
            title: 'Progress Terlambat',
            message: `Kontrak "${c.judul_kontrak}" tertinggal ${diff}%`,
            type: 'progress_behind',
            read: false
          });
        }
      }

      // 🔥 Akan berakhir
      if (c.tanggal_selesai && c.status_kontrak === 'Aktif') {
        const end = new Date(c.tanggal_selesai);
        const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (days <= 30 && days > 0) {
          alerts.push({
            id: `end-${c.id_kontrak}`,
            title: 'Kontrak Akan Berakhir',
            message: `Kontrak "${c.judul_kontrak}" akan berakhir ${days} hari lagi`,
            type: 'contract_ending',
            read: false
          });
        }
      }

    });

    // 🔥 Tagihan mandek > 1 bulan di tahap berjalan
    (tagihans || []).forEach((t: any) => {
      // Lewati tagihan yang sudah final (Payment/Selesai)
      if (isStatusFinal(t.status_tagihan)) return;

      const acuan = t.updated_at || t.created_at;
      if (!acuan) return;

      const acuanDate = new Date(acuan);
      if (isNaN(acuanDate.getTime())) return;

      const days = Math.floor((now.getTime() - acuanDate.getTime()) / (1000 * 60 * 60 * 24));

      if (days >= 30) {
        const judul = t.kontrak?.judul_kontrak ? ` (${t.kontrak.judul_kontrak})` : '';
        alerts.push({
          id: `tagihan-sla-${t.id_tagihan}`,
          title: 'Tagihan Melewati SLA',
          message: `Tagihan "${t.nomor_tagihan}"${judul} sudah ${days} hari di tahap "${t.status_tagihan}"`,
          type: 'tagihan_sla_overdue',
          read: false
        });
      }
    });

    setNotifications(alerts);
    setUnreadCount(alerts.length);

  }, [contracts, tagihans, userProfile]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return {
    notifications,
    unreadCount,
    connected: true, // dummy
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};