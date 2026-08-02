import Link from 'next/link';

export default function LuminaPlaceholderPage() {
  return (
    <div className="min-h-screen bg-[#0d0b12] text-[#ece6da] px-5 py-8 flex items-center justify-center">
      <div className="mx-auto max-w-md text-center space-y-4">
        <p className="text-4xl">✨</p>
        <h1 className="font-serif text-2xl text-[#f4ecd8]">Lumina HD</h1>
        <p className="text-sm text-[#8d84a0]">
          Panel ini masih dalam pengembangan — menunggu mesin hitung chart Human Design
          (Type, Profile, Authority) selesai dibangun. Segera hadir.
        </p>
        <Link
          href="/id/panel"
          className="inline-block rounded-lg border border-[#a68a56] text-[#a68a56] font-medium px-6 py-3 mt-2"
        >
          Kembali ke Panel
        </Link>
      </div>
    </div>
  );
}
