// =====================================================
// AKSI: BUAT FILE BARU
// PATH  : components/panel/LicensesTable.tsx
// =====================================================

interface License {
  id: string;
  code: string;
  license_type: string;
  status: string;
  activated_at: string;
  expires_at: string;
  notes: string | null;
  created_at: string;
  assigned_user: { email: string; full_name: string | null } | null;
}

const TYPE_LABELS: Record<string, string> = {
  trial: 'Trial',
  '1_month': '1 Bulan',
  '6_month': '6 Bulan',
  '1_year': '1 Tahun',
  permanent: 'Permanent',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-900/40 text-green-300 border-green-800',
  expired: 'bg-zinc-800 text-gray-400 border-zinc-700',
  revoked: 'bg-red-900/40 text-red-300 border-red-800',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function LicensesTable({ licenses }: { licenses: License[] }) {
  if (licenses.length === 0) {
    return (
      <div className="text-sm text-gray-500 bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
        Belum ada lisensi yang dibuat.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {licenses.map((lic) => (
        <div
          key={lic.id}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold text-sm">{lic.code}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[lic.status] ?? ''}`}>
              {lic.status}
            </span>
          </div>
          <p className="text-sm text-gray-300">
            {lic.assigned_user?.full_name ?? lic.assigned_user?.email ?? '-'}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{TYPE_LABELS[lic.license_type] ?? lic.license_type}</span>
            <span>Exp: {formatDate(lic.expires_at)}</span>
          </div>
          {lic.notes && (
            <p className="text-xs text-gray-500 italic mt-1">"{lic.notes}"</p>
          )}
        </div>
      ))}
    </div>
  );
}
