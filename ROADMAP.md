# Roadmap — Audit AI v8

> **Konsolidasi: INTEGRAL → satu produk "Audit AI v8".**
> v8 meleburkan lapisan "INTEGRAL AI Workspace" (branding + UX 7-tahapan SIMWAS) ke dalam
> inti Audit AI — tidak lagi ada identitas "INTEGRAL" terpisah. Satu nama, satu UI, satu data model.

**Dibuat:** 16 Juni 2026 · **Basis:** clone Audit v7 `d0c8a81` (branch `v8-main`, folder `sistem audit v8`).
Roadmap v7 lama diarsipkan di [`docs/ROADMAP-v7-archive.md`](docs/ROADMAP-v7-archive.md) (backlog mutu & detail teknis tetap berlaku — lihat Workstream E).

---

## 0. Keputusan pendiri v8 (16 Juni 2026)

- **INTEGRAL bukan sistem terpisah** — ia lapisan branding/UX di atas codebase v7 yang sama. v8 = hapus identitas terpisah itu, jadikan satu produk **Audit AI v8**.
- **Clone, bukan merge dua repo** — tak ada repo "audit v7" kedua; v8 = salinan bersih repo ini.
- **Dipertahankan:** workflow 7-tahapan · integrasi SIMWAS v2 · CACM/EWS · eval harness + mutu agen (R0–R4, PKP-di-feedback).
- **Baru di v8:** **login username + password** (ganti prototype role-only).

## 1. Prinsip arsitektur (warisan v7, tetap berlaku)

- **`backend/v6/` READ-ONLY** — semua perubahan di app-layer (`backend/app`) + template. V6 (digest, cross-check, render) tak ditulis ulang.
- **2 agen Claude**: Anggota Tim (AT) & Ketua Tim (KT); ingestion & QC SAIPI = deterministik/sinkron (bukan agen).
- **Skill registry folder-driven** (`knowledge/skills`, `APP_SKILLS_PATH`); skill = substansi domain, orkestrasi di prompt agen (Tahap R0–R4).
- **Anti-halusinasi**: tiap temuan ber-`dokumen_sumber`; `sebab` hanya untuk skill AUDIT.

---

## Workstream A — Rebrand & konsolidasi (INTEGRAL → Audit AI v8)

- [ ] **A1 — Inventarisasi string "INTEGRAL"** lintas repo (frontend UI, `README.md`, `HANDOVER.md`, `docs/*`, prompt agen, frontmatter skill, nama file `*integral*`). Buat daftar ganti.
- [ ] **A2 — Tetapkan identitas v8**: nama produk final (mis. "Audit AI v8" / nama Indonesia), pertahankan/ubah palette ungu `#5C4FE7`, logo `∫`. → keputusan user.
- [ ] **A3 — Terapkan rebrand**: ganti string UI (`frontend/`), judul halaman, `AppShell`/`Sidebar`/`TopBar`, landing. Satukan narasi `README.md` + `HANDOVER.md` jadi dokumen v8 tunggal.
- [ ] **A4 — Bump versi v7→v8**: `config`, manifest, `package.json`, badge, frontmatter skill yang menyebut versi.
- [ ] **A5 — Bersihkan legacy**: rename `docs/openapi-integral-v7.yaml`→`...-v8`, file `*integral*` lain; lanjutkan pembuangan referensi `audit-system-v4` (bash/Task/_ROLE) di skill non-reviu (reviu sudah R0–R4).
- [ ] **A6 — Arsip**: pindahkan rencana/docs ber-nuansa "INTEGRAL fase" yang sudah usang ke `docs/archive/`.

## Workstream B — Autentikasi username + password (BARU, fondasi v8)

> Saat ini login = prototype **role-only** (`POST /auth/login` pilih AT/KT/PT/PM tanpa password). v8 ganti ke kredensial nyata.

- [ ] **B1 — Skema**: tambah `username` (unik) + `password_hash` ke tabel `User`; migrasi data seed. Hash **argon2/bcrypt** (jangan plaintext).
- [ ] **B2 — Backend auth**: `POST /auth/login` (username+password → JWT), seeding akun admin awal, endpoint ganti password. Pertahankan klaim role di JWT (RBAC tetap AT/KT/PT/PM).
- [ ] **B3 — Frontend**: ganti kartu-peran di `/login` jadi form username+password; simpan token; guard route; halaman ganti password.
- [ ] **B4 — Keamanan**: rate-limit + lockout percobaan gagal, kebijakan password minimum, logout/expiry. (Catatan: pembuatan akun/isi kredensial dilakukan user sendiri — sistem hanya menyediakan mekanisme.)
- [ ] **B5 — SSO SIMWAS koeksistensi**: login lokal (username/pass) **dan** SSO JWKS SIMWAS v2 sebagai dua jalur; produksi → SSO, dev → lokal.

## Workstream C — Fitur dipertahankan (verifikasi utuh pasca-rebrand + finalisasi)

- [ ] **C1 — Workflow 7-tahapan**: Kartu Penugasan → PKP → KKP (AI+HITL) → LRS KK → Konsep LHP → LRS LHP → Laporan Hasil. Pastikan status-derivation (`PKP_DONE`/`KKP_DONE`/`LHP_DONE`), SasaranApprovalPanel, LhpFilesPanel tetap jalan setelah rebrand.
- [ ] **C2 — Integrasi SIMWAS v2**: finalisasi kontrak REST (`openapi`→v8), JWKS SSO, webhook; selaras dengan B5.
- [ ] **C3 — CACM/EWS**: modul `CACM/` + `CacmRun`/`EwsFinding` + halaman CACM dipertahankan & diverifikasi.
- [ ] **C4 — Mutu agen & eval (lanjutan v7)**: skill **R0–R4** untuk reviu sudah selesai → **lanjutkan ke rumpun audit/evaluasi/pemantauan** (hati-hati: paradigma stop-confirm berbeda per rumpun); PKP-di-feedback; `backend/eval` (rubrik, golden, judge, verification pass).

## Workstream D — Infra & bootstrap v8

- [ ] **D1 — Bootstrap dev** (node_modules/.venv TIDAK ikut clone): `cd frontend && npm install`; `cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`. (Lihat "Cara menjalankan" di bawah.)
- [ ] **D2 — Database v8**: putuskan DB terpisah `audit_v8` vs lanjut `audit_v7` (dev). Jalankan migrasi schema auth (B1). `.env` sudah disalin dari v7 (DATABASE_URL `localhost:5432/audit_v7`).
- [ ] **D3 — Deploy**: perbarui `DEPLOY.md`, `fly.toml`, `docker-compose.yml`, Dockerfile untuk identitas v8.
- [ ] **D4 — Repo GitHub v8** (opsional): saat ini folder lokal + branch `v8-main`, remote `v7source` → v7 lokal (untuk cherry-pick). Buat repo `audit-system-v8` bila user mau (butuh konfirmasi).

## Workstream E — Backlog warisan v7 (tetap berlaku — detail di arsip)

- [ ] Konsistensi skill rumpun **audit/evaluasi/pemantauan** → pola Tahap (lihat [[project-skill-orkestrasi-v7]] di memori).
- [ ] Gap audit skill: `pemantauan-tindak-lanjut` masih skeleton (references kosong); `audit-kinerja` wajib riset online tapi agen tak punya tool web; unsur **Sebab** pada `evaluasi-mr`/`evaluasi-umum` kontradiktif dgn aturan "sebab hanya audit".
- [ ] Eval P3–P5: perkuat grounding+coverage; token logging (`agent_runs`) + instrumen HITL; ukur akurasi digest.
- [ ] A3 laporan bespoke (dashboard pemantauan, tabel aspek evaluasi).
- [ ] Fix kosmetik: warning duplicate-key `Sidebar.tsx`; cap 14000 char `load_skill` untuk 2 skill pipeline besar.

---

## Urutan eksekusi yang disarankan

1. **D1 bootstrap** → pastikan v8 jalan lokal (npm/pip install) sebelum apa pun.
2. **B (auth username/password)** + **A (rebrand)** — fondasi identitas v8.
3. **C (verifikasi fitur dipertahankan)** pasca-rebrand.
4. **D2–D4 infra/deploy**, lalu **E (backlog mutu)**.

## Cara menjalankan v8 (lokal)

```bash
# 1. Database (Docker) — pakai compose yang sama
cd "/Users/itjen/Downloads/sistem audit v8"
docker compose up -d db

# 2. Backend (perlu install dependency — tidak ikut clone)
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000   # ⚠ port bentrok bila v7 masih jalan

# 3. Frontend
cd ../frontend
npm install
npm run dev   # ⚠ port 3000 bentrok bila v7 masih jalan
```

> **Catatan port:** v7 dan v8 memakai port (8000/3000) & DB (`audit_v7`) yang sama. Untuk menjalankan v8 berdampingan dengan v7, ubah port + `DATABASE_URL` (→ `audit_v8`) di `.env` v8 (lihat D2). Untuk pindah total ke v8, matikan service v7 dulu.

## Apa yang sudah dikerjakan saat membuat v8

- ✅ Clone bersih v7 `d0c8a81` → `sistem audit v8` (96M; tanpa node_modules/.venv/data-besar), branch `v8-main`.
- ✅ Bawa `.env`, `frontend/.env.local`, dan `backend/data/` (2.8M) agar bisa langsung jalan setelah install dependency.
- ✅ Remote `origin` → di-rename `v7source` (sumber cherry-pick).
- ✅ Roadmap v7 diarsipkan; roadmap v8 ini dibuat.
