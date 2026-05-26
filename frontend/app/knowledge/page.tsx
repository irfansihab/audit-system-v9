'use client';

// Halaman Knowledge / Wiki.
// W1 (AKTIF): panel "Cari Wiki" — baca vault pengetahuan organisasi (read-only).
// W2/W3 (scaffold): promosi pattern + tulis-balik penugasan ke wiki — substansi menyusul.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, clearToken, getSession, Session } from '@/lib/api';

type SearchResult = {
  name: string;
  section: string;
  summary: string;
  path: string;
  score: number;
  snippet: string;
};

const SECTIONS = [
  {
    title: 'Promosi Pattern (W2)',
    desc: 'Pantau usulan pattern dari feedback agen lintas penugasan, promosikan yang berulang menjadi pattern wiki resmi.',
  },
  {
    title: 'Tulis-balik Penugasan (W3)',
    desc: 'Saat penugasan selesai, hasilkan draft catatan wiki (temuan + rekomendasi) untuk disetujui & di-apply ke vault.',
  },
];

export default function KnowledgePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Cari Wiki (W1)
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [notConfigured, setNotConfigured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview catatan
  const [selected, setSelected] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<string>('');
  const [loadingPage, setLoadingPage] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = getSession();
    setSession(s);
    if (!s) router.push('/login');
  }, [router]);

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  const runSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    setError(null);
    setNotConfigured(null);
    setSelected(null);
    setPageContent('');
    try {
      const res = await api.searchWiki(q.trim(), 20);
      if (!res.configured) {
        setNotConfigured(res.message || 'Vault tidak dikonfigurasi (set APP_VAULT_PATH).');
        setResults([]);
      } else {
        setResults(res.results);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const openPage = async (name: string) => {
    setSelected(name);
    setLoadingPage(true);
    setPageContent('');
    try {
      const res = await api.getWikiPage(name);
      setPageContent(res.found ? (res.content || '') : (res.message || 'Catatan tidak ditemukan.'));
    } catch (err: any) {
      setPageContent(`Gagal memuat: ${err.message}`);
    } finally {
      setLoadingPage(false);
    }
  };

  if (!mounted) return <main className="min-h-screen" />;
  if (!session) return null;

  return (
    <main className="min-h-screen">
      <header className="bg-primary text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/penugasan" className="text-white/80 hover:text-white text-sm">
            ← Penugasan
          </Link>
          <span className="text-white/40">|</span>
          <span className="font-semibold text-sm">Knowledge — Wiki &amp; Pattern Temuan</span>
        </div>
        <div className="text-right text-xs">
          <div>{session.user.nama_lengkap}</div>
          <div className="opacity-80">
            <span className="px-2 py-0.5 rounded bg-white/15 ml-2">{session.role_aktif}</span>
            <button onClick={handleLogout} className="ml-3 underline">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-primary-dark mb-1">Knowledge / Wiki</h1>
        <p className="text-sm text-gray-500 mb-5">
          Cari di vault pengetahuan organisasi (dokumen resmi non-rahasia, hasil ingest). Agen juga
          memakai pencarian ini untuk menarik konteks auditi/vendor/BPK saat analisis.
        </p>

        {/* ===== W1: Cari Wiki ===== */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <form onSubmit={runSearch} className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="mis. temuan BPK PSTE, profil Ditjen Ekosdig, vendor …"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={searching || !q.trim()}
              className="px-4 py-2 rounded bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-40"
            >
              {searching ? 'Mencari…' : 'Cari'}
            </button>
          </form>

          {error && (
            <div className="mt-3 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}
          {notConfigured && (
            <div className="mt-3 p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              {notConfigured}
            </div>
          )}

          {results && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              {/* Daftar hasil */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto">
                {results.length === 0 && !notConfigured ? (
                  <p className="text-sm text-gray-400 italic">Tidak ada hasil untuk "{q}".</p>
                ) : (
                  results.map((r) => (
                    <button
                      key={r.path}
                      onClick={() => openPage(r.name)}
                      className={`w-full text-left border rounded p-3 hover:bg-gray-50 transition ${
                        selected === r.name ? 'border-primary bg-blue-50/40' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-medium text-sm text-primary-dark">{r.name}</span>
                        {r.section && (
                          <span className="text-[11px] text-gray-400 shrink-0">{r.section}</span>
                        )}
                      </div>
                      {r.summary && <div className="text-xs text-gray-600 mt-0.5">{r.summary}</div>}
                      {r.snippet && (
                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">…{r.snippet}</div>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Preview catatan */}
              <div className="border border-gray-200 rounded p-3 bg-gray-50 max-h-[460px] overflow-y-auto">
                {!selected ? (
                  <p className="text-sm text-gray-400 italic">Klik salah satu hasil untuk membaca isinya.</p>
                ) : loadingPage ? (
                  <p className="text-sm text-gray-400 italic">Memuat {selected}…</p>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-gray-500 mb-2">{selected}.md</div>
                    <pre className="text-xs whitespace-pre-wrap font-sans text-gray-800">{pageContent}</pre>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== Graduasi (PT/PM) ===== */}
        {(session.role_aktif === 'PT' || session.role_aktif === 'PM') && <GraduasiPanel />}

        {/* ===== W2/W3 scaffold ===== */}
        <div className="mb-3 text-sm text-gray-500">Berikutnya (substansi menyusul):</div>
        <div className="grid gap-4 md:grid-cols-2">
          {SECTIONS.map((s) => (
            <div key={s.title} className="bg-white border border-dashed border-gray-300 rounded-lg p-5">
              <h2 className="font-semibold text-primary-dark mb-2">{s.title}</h2>
              <p className="text-sm text-gray-500">{s.desc}</p>
              <div className="mt-3 text-xs text-gray-400 italic">Substansi menyusul.</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// Panel Graduasi (PT/PM): pilih penugasan sejenis → suling jadi DRAFT skill →
// reviu → promote ke registry. Human-in-the-loop.
function GraduasiPanel() {
  const [groups, setGroups] = useState<{ skill: string; penugasan: { kode: string; obyek: string; n_temuan: number }[] }[]>([]);
  const [drafts, setDrafts] = useState<{ nama: string; skill_induk?: string; n_temuan?: number }[]>([]);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () => {
    api.getGraduasiCandidates().then((r) => setGroups(r.groups)).catch(() => {});
    api.getGraduasiDrafts().then((r) => setDrafts(r.drafts)).catch(() => {});
  };
  useEffect(() => { refresh(); }, []);

  const toggle = (kode: string) => setPicked((p) => ({ ...p, [kode]: !p[kode] }));
  const selected = Object.keys(picked).filter((k) => picked[k]);

  const run = async () => {
    if (selected.length === 0) { setMsg('Pilih ≥1 penugasan dulu.'); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await api.runGraduasi(selected);
      setMsg(`Draft "${r.nama}" dibuat (${r.n_temuan} temuan, ${r.n_redflag} pola). Reviu lalu Promote.`);
      setPicked({}); refresh();
    } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  };
  const act = async (nama: string, kind: 'promote' | 'reject') => {
    if (kind === 'reject' && !confirm(`Tolak & hapus draft "${nama}"?`)) return;
    if (kind === 'promote' && !confirm(`Promote draft "${nama}" jadi skill aktif di registry?`)) return;
    setBusy(true); setMsg(null);
    try {
      if (kind === 'promote') { await api.promoteGraduasi(nama); setMsg(`Skill "${nama}" dipromote & terdaftar.`); }
      else { await api.rejectGraduasi(nama); setMsg(`Draft "${nama}" ditolak.`); }
      refresh();
    } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="mb-6 bg-white border border-violet-200 rounded-lg p-5">
      <h2 className="font-semibold text-primary-dark mb-1">Graduasi Skill (PT/PM)</h2>
      <p className="text-xs text-gray-500 mb-3">
        Suling pola dari penugasan sejenis (skill sama) menjadi DRAFT skill spesifik. Generate = draft;
        Anda reviu lalu <b>Promote</b> agar terdaftar. Human-in-the-loop.
      </p>
      {msg && <div className="mb-3 p-2 rounded bg-violet-50 text-violet-800 text-xs">{msg}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">Kandidat penugasan (punya temuan)</div>
          <div className="border border-gray-200 rounded max-h-60 overflow-y-auto divide-y">
            {groups.length === 0 ? (
              <div className="p-3 text-xs text-gray-400 italic">Belum ada penugasan ber-temuan.</div>
            ) : groups.map((g) => (
              <div key={g.skill} className="p-2">
                <div className="text-[11px] uppercase text-gray-400 mb-1">{g.skill}</div>
                {g.penugasan.map((p) => (
                  <label key={p.kode} className="flex items-start gap-2 text-xs py-0.5 cursor-pointer">
                    <input type="checkbox" checked={!!picked[p.kode]} onChange={() => toggle(p.kode)} className="mt-0.5" />
                    <span className="text-gray-700">{p.obyek} <span className="text-gray-400">({p.n_temuan} temuan)</span></span>
                  </label>
                ))}
              </div>
            ))}
          </div>
          <button onClick={run} disabled={busy} className="mt-2 text-xs px-3 py-1.5 rounded bg-violet-600 text-white font-medium disabled:opacity-50">
            ⚗ Graduasikan {selected.length > 0 ? `(${selected.length})` : ''}
          </button>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">Draft skill (perlu reviu)</div>
          <div className="border border-gray-200 rounded max-h-60 overflow-y-auto divide-y">
            {drafts.length === 0 ? (
              <div className="p-3 text-xs text-gray-400 italic">Belum ada draft.</div>
            ) : drafts.map((d) => (
              <div key={d.nama} className="p-2 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-700">{d.nama} <span className="text-gray-400">← {d.skill_induk}</span></span>
                <span className="flex gap-1 shrink-0">
                  <button onClick={() => act(d.nama, 'promote')} disabled={busy} className="text-[11px] px-2 py-0.5 rounded bg-emerald-600 text-white disabled:opacity-50">Promote</button>
                  <button onClick={() => act(d.nama, 'reject')} disabled={busy} className="text-[11px] px-2 py-0.5 rounded bg-gray-400 text-white disabled:opacity-50">Tolak</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
