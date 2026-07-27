// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : components/panel/AssignLicenseForm.tsx
// =====================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface UserOption {
  id: string;
  email: string;
  full_name: string | null;
}

const LICENSE_TYPES = [
  { value: 'trial', label: 'Trial (3 hari)' },
  { value: '1_month', label: '1 Bulan' },
  { value: '6_month', label: '6 Bulan' },
  { value: '1_year', label: '1 Tahun' },
  { value: 'permanent', label: 'Permanent' },
];

export default function AssignLicenseForm({ users }: { users: UserOption[] }) {
  const router = useRouter();
  const [targetUserId, setTargetUserId] = useState('');
  const [licenseType, setLicenseType] = useState('1_month');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!targetUserId) {
      setMessage({ type: 'error', text: 'Pilih user terlebih dahulu.' });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.functions.invoke('assign-license', {
      body: {
        target_user_id: targetUserId,
        license_type: licenseType,
        notes: notes || null,
      },
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Gagal assign lisensi.' });
      return;
    }

    if (data?.error) {
      setMessage({ type: 'error', text: data.error });
      return;
    }

    setMessage({ type: 'success', text: `Lisensi ${data.license.code} berhasil diberikan.` });
    setTargetUserId('');
    setNotes('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold">Assign Lisensi Baru</h2>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Pilih User</label>
        <select
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">-- Pilih user --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name ? `${u.full_name} (${u.email})` : u.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Tipe Lisensi</label>
        <select
          value={licenseType}
          onChange={(e) => setLicenseType(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
        >
          {LICENSE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Catatan (opsional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Misal: pembelian via WA, dll"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {message && (
        <div className={`text-sm rounded-lg px-3 py-2 ${
          message.type === 'success'
            ? 'bg-green-900/40 text-green-300 border border-green-800'
            : 'bg-red-900/40 text-red-300 border border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg py-2.5 text-sm font-medium transition"
      >
        {loading ? 'Memproses...' : 'Assign Lisensi'}
      </button>
    </form>
  );
        }
