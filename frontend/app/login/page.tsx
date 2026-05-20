'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken, setSession, Role } from '@/lib/api';

type RoleOption = {
  role: Role;
  label: string;
  nama_seed: string;
  description: string;
  badge_color: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'PT',
    label: 'Pengendali Teknis',
    nama_seed: 'Inspektorat II Komdigi',
    description: 'Buat penugasan baru. Kontrol overall pelaksanaan reviu.',
    badge_color: 'bg-purple-100 text-purple-800',
  },
  {
    role: 'KT',
    label: 'Ketua Tim',
    nama_seed: 'Budi Hartono',
    description: 'Setup sasaran, approve KKP, susun LHR, rekomendasi, gate QC.',
    badge_color: 'bg-emerald-100 text-emerald-800',
  },
  {
    role: 'AT',
    label: 'Anggota Tim',
    nama_seed: 'Sarah Aulia',
    description: 'Upload dokumen, analisis, susun KKP per sasaran reviu.',
    badge_color: 'bg-blue-100 text-blue-800',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (role: Role) => {
    setLoading(role);
    setError(null);
    try {
      const session = await api.login(role);
      setToken(session.token);
      setSession(session);
      router.push('/penugasan');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-14 h-14 rounded-xl bg-primary text-white font-bold text-xl flex items-center justify-center shadow-lg">
            v7
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-dark">Audit AI v7</h1>
            <p className="text-sm text-gray-500">Inspektorat II Komdigi</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Pilih Peran</h2>
          <p className="text-sm text-gray-500 mb-6">
            Prototype internal — tidak perlu NIP atau password. Klik kartu peran untuk masuk.
            Setiap peran punya akses yang berbeda di sistem.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-3">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.role}
                onClick={() => handleLogin(opt.role)}
                disabled={loading !== null}
                className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${opt.badge_color}`}>
                      {opt.role}
                    </span>
                    <span className="font-semibold text-gray-800">{opt.label}</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-primary transition">
                    {loading === opt.role ? '⏳' : '→'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 ml-1">
                  Akun: <span className="font-medium text-gray-700">{opt.nama_seed}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{opt.description}</p>
              </button>
            ))}
          </div>

          <p className="mt-6 text-xs text-gray-400 text-center">
            Production nanti login akan via SSO Komdigi (OIDC). Untuk dev/prototype, role-based simple login.
          </p>
        </div>
      </div>
    </main>
  );
}
