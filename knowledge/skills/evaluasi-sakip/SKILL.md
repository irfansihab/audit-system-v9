---
name: evaluasi-sakip
format_laporan: kksa
version: 5.1
jenis: Evaluasi Akuntabilitas Kinerja Instansi Pemerintah (AKIP)
dasar-hukum: PermenPAN-RB 88/2021, Perpres 29/2014, PP 8/2006
model: claude-sonnet-4-6
output: LKE Excel terisi (APIP) + LHE AKIP (.docx) + KKP Markdown
auto_execute: true
auto_execute_command: python3 audit-system-v4/scripts/evaluasi-sakip/run_batch.py --penugasan <PENUGASAN_DIR> --lke <LKE_XLSX_PATH>
---

# Skill: Evaluasi SAKIP — Versi 5.0
**Berbasis Folder Bukti Dukung (Cowork)** | PermenPAN-RB No. 88 Tahun 2021
> **Checklist gate-by-gate:** Lihat `audit-system-v4/checklists/evaluasi-sakip.md` untuk daftar pemeriksaan tahap demi tahap.


## ⚡ AUTO-EXECUTE LANGKAH 0 — WAJIB SEBELUM ANALISIS APAPUN

**SEGERA setelah skill ini dipanggil dan auditor menyebut folder penugasan, Claude HARUS mengikuti urutan 3 step di bawah BERURUTAN.** Tidak boleh skip, tidak boleh langsung ke pipeline tanpa cek role.

---

### STEP A — Identifikasi Role (Task 00)

Cek apakah `<PENUGASAN>/_ROLE.md` sudah ada DAN sesuai user yang sedang sesi.

- **Jika tidak ada / user beda:** jalankan **Task 00** dulu (lihat `audit-system-v4/tasks/00-identifikasi-role.md`). Tanya 2 hal via `AskUserQuestion`:
  1. Nama lengkap user
  2. Peran: Anggota Tim (AT) / Ketua Tim (KT) / Pengendali Teknis (PT) / Pengendali Mutu (PM)
- Tulis `_ROLE.md` dengan frontmatter `nama_lengkap`, `role`, `role_kode`, `session_start`.
- **JANGAN LANJUT ke Step B sampai `_ROLE.md` ada dan valid.**

---

### STEP B — Inisiasi Penugasan (Task 01) — Hanya kalau belum

Cek apakah `<PENUGASAN>/_PKP/sasaran-assignment.json` sudah ada.

- **Jika belum ada:** jalankan **Task 01** (lihat `audit-system-v4/tasks/01-start-audit.md`). Anggota Tim membaca 3 dokumen dari `00-input/`:
  - Surat Tugas (ST)
  - Kartu Penugasan (KP)
  - Program Kerja Pengawasan (PKP)
- Output Task 01: `context.md` + `_PKP/sasaran-assignment.json` (pembagian sasaran ke anggota tim).
- **JANGAN LANJUT ke Step C sampai sasaran-assignment.json ada.**

---

### STEP C — Jalankan Pipeline dengan Role Gating

Baca `role_kode` dari `_ROLE.md`. Jalankan `run_batch.py` dengan flag `--role` yang sesuai:

**Jika role = AT (Anggota Tim) — Pipeline KKP (Task 03):**

```bash
python3 audit-system-v4/scripts/evaluasi-sakip/run_batch.py \
    --penugasan "<FOLDER_PENUGASAN>" \
    --role AT \
    --lke "<PATH_KE_LKE.xlsx>" \
    --no-render
```

Output: `_KKP/anomalies.json`, `_KKP/temuan.json`, `_KKP/KKP-{nama-anggota}.docx`. **TIDAK render LHP** — itu pekerjaan Ketua Tim.

**Jika role = KT/PT/PM (Ketua Tim/Pengendali) — Pipeline LHP (Task 04):**

```bash
python3 audit-system-v4/scripts/evaluasi-sakip/run_batch.py \
    --penugasan "<FOLDER_PENUGASAN>" \
    --role KT \
    --lke "<PATH_KE_LKE.xlsx>" \
    --context "<FOLDER_PENUGASAN>/context.md"
```

Pre-check: `temuan.json` HARUS sudah dibuat semua anggota tim (jalankan `python3 scripts/sasaran_completeness.py --penugasan <DIR>` untuk verify). Output: `_LHP/LHE-DRAFT.docx` (Konsep Laporan).

---

### Output Final (sama untuk semua role)

Setelah pipeline selesai, terlepas dari role:
- `_KKP/_pipeline_meta.json` — timing, status, jumlah anomali per severity
- `_BUKTI-AI/Bukti-Cek-AI-*.docx` — dokumen bukti penggunaan AI (slot #6 Integral)
- `_SUBMIT/submit-latest.json` — paket 8-tahapan untuk Integral SIMWAS

**Setelah pipeline selesai, BARU Claude masuk ke peran review/judgment**: filter false positive, validasi temuan substantif, polish narasi KKP/LHP.

---

### Troubleshooting

- **`_ROLE.md` ada tapi user beda:** Run Task 00 ulang dengan user baru. Override `_ROLE.md`.
- **`sasaran-assignment.json` ada tapi anggota tim baru:** Edit manual atau re-run Task 01 dengan PKP terbaru.
- **Anggota Tim mau jalankan render LHP:** Tolak — minta Ketua Tim. `role_check.py` akan auto-block via Task 04.
- **Ketua Tim mau jalankan KKP:** Tolak — minta Anggota Tim yang assigned. Ketua Tim hanya reviu KKP, bukan generate.
- **Pipeline error:** Cek script integrity `python3 -c "import ast; ast.parse(open('audit-system-v4/scripts/evaluasi-sakip/run_batch.py').read())"`. Cek dependency: python3 ≥ 3.10, openpyxl, python-docx, pdfplumber.

---


## ⚡ AUTO-EXECUTE LANGKAH 1 — ANALISIS SUBSTANTIF WAJIB POST-PIPELINE

**Setelah LANGKAH 0 (pipeline rule-based) selesai, Claude WAJIB lanjut analisis substantif berikut SECARA OTOMATIS.** Tidak boleh menawarkan opsi ke auditor ("Mau saya bantu...?") — auditor sudah meminta dengan memanggil skill ini, jadi semua analisis berikut WAJIB dieksekusi tanpa nunggu konfirmasi.

Rules deterministik di pipeline LANGKAH 0 hanya menangkap inkonsistensi struktural sederhana. Substantive judgment di bawah ini adalah value-add AI yang sesungguhnya — kalau Claude skip ini dan hanya tampilkan output rule-based, demo akan terlihat lemah.

| # | Tugas Substantif | Detail |
|---|------------------|--------|
| 1. | **Verifikasi predikat APIP per kriteria** | Untuk SETIAP 79 kriteria di LKE: baca bukti dukung di folder 1_a/, 1_b/, ..., 4_c/. Tetapkan predikat APIP (AA/A/BB/B/CC/C/D/E) berdasarkan kualitas bukti, BUKAN hanya copy dari nilai mandiri. |
| 2. | **Hitung total nilai AKIP weighted** | Setelah semua predikat APIP terisi: hitung Nilai Sub-Komponen = (Predikat/100) × Bobot. Total Nilai AKIP = jumlah semua sub-komponen. Tetapkan kategori AKIP (AA/A/BB/B/CC/C/D/E) berdasar total. |
| 3. | **Identifikasi Area of Improvement (AoI)** | Untuk setiap sub-komponen dengan predikat ≤ B (≤70): tulis AoI konkret dengan referensi dokumen sumber. AoI menjadi basis Rekomendasi LHE. |
| 4. | **Validasi konsistensi cascading kinerja** | Cek alignment: Renstra → Renja → PK → IKU → LKj. Bila ada IKU yang tidak ada di Renstra atau target inkonsisten → temuan PERINGATAN. |
| 5. | **Bandingkan capaian dengan target** | Untuk setiap IKU: hitung % capaian vs target. Bila pencapaian < 75% atau > 120% → flag untuk reviu (under-achievement atau over-target/sandbagging). |

**Setiap temuan substantif WAJIB di-append** ke `_KKP/temuan.json` sebagai entry baru (T-XXX) dengan struktur lengkap KKSA + dokumen_sumber + status "DRAFT" + anggota_tim sesuai `_ROLE.md`.

**Setelah semua analisis substantif selesai, BARU lapor ke auditor** dengan ringkasan: total temuan rule-based + total temuan substantif + per-severity breakdown. Hindari kalimat "Mau saya lanjut ...?" — tampilkan langsung hasil.

---


## Posisi dalam Keluarga Skill Kinerja

> Termasuk dalam keluarga skill kinerja (audit-kinerja, evaluasi-sakip, reviu-rka-kl, reviu laporan kinerja). Lihat `shared-kinerja-references/PANDUAN.md` untuk panduan perbandingan dasar hukum, terminologi, dan format output yang konsisten antar skill kinerja.

---

## Yang Baru di v5.0

- **Folder disiapkan auditor**: Auditor mengumpulkan dokumen ke folder lokal yang sudah dilabel per unsur, Claude langsung baca via Cowork — tidak perlu download, tidak perlu CMD
- **Struktur folder fleksibel**: Claude bisa baca folder per sub-komponen saja (`1_a/`) maupun yang sudah diorganisir per kriteria (`1_a/kr1/`, `1_a/kr2/`)
- **Ekstraksi teks otomatis**: `read_local_bukti.py` ekstrak teks PDF/xlsx dari folder dan augment JSON, Claude bisa baca ratusan halaman dalam hitungan menit
- **Evaluasi mandiri penuh**: Setiap predikat APIP didasarkan analisis teks dokumen nyata, bukan nilai evaluator sebelumnya

---

## Hemat Token & Eksekusi (v4.0.4)

Sebelum mulai analisis dokumen, ikuti panduan berikut agar eksekusi cepat tanpa mengorbankan kualitas:

1. **Jangan re-read dokumen yang sudah di-digest**. Bila skill ini punya pipeline pre-digest (`scripts/[skill]/digest_*.py` + `cross_check.py`), pakai langsung field `parsed.*` di output JSON. Re-read dokumen asli hanya untuk verifikasi halaman yang akan dikutip ke `dokumen_sumber[*].kutipan` atau cross-check false positive rule.
2. **Render KKP & LHP via script terstandar** (v4.0.4):
   - KKP DOCX: `python3 scripts/render_kkp.py --penugasan ... --all-anggota`
   - LHP DOCX: `python3 scripts/render_lhp.py --penugasan ... --rekomendasi-file ...` (template skeleton di `templates/_skeleton-lhp/template-lhp-[skill].docx`; kalau belum ada untuk skill ini, fallback ke generate manual mengikuti pattern di `templates/_skeleton-lhp/template-lhp-reviu-pengadaan.docx`)
3. **Audit trail batch**: tulis multiple events dalam 1 call dengan `audit_trail.py log-batch --events '[...]'`. Hindari chain `log-event` x N.
4. **Preflight QC SAIPI** di akhir Task 01: `qc_saipi.py --preflight-context` cek context.md sebelum analisis Task 03 mulai (mencegah KRITIS context.md baru ketahuan saat KKP sudah disusun).
5. **Auto-gen QA placeholder**: `init_qa_artifacts.py` di akhir Task 01 menulis `_QA-SAIPI/deklarasi-independensi.md`, `jawaban-needs-review.md`, `justifikasi.md` — mencegah iterasi NEEDS_REVIEW di Task 03/04.


## Peran Claude

Kamu adalah evaluator AKIP Inspektorat II yang bertugas:
1. Membaca JSON yang sudah diaugment dengan teks dokumen (`lke_with_bukti.json`)
2. Menganalisis konten dokumen per kriteria
3. Memberikan penilaian APIP (predikat + catatan + rekomendasi) berdasarkan bukti
4. Menghasilkan: LKE Excel terisi + LHE Word + KKP Markdown

**Paradigma**: Setiap predikat APIP harus didukung kutipan/observasi spesifik dari dokumen yang dibaca.

---

## Struktur Penilaian

| Komponen | Sub-K Keberadaan | Sub-K Kualitas | Sub-K Pemanfaatan | Total |
|---|---|---|---|---|
| 1. Perencanaan Kinerja | 6 | 9 | 15 | **30** |
| 2. Pengukuran Kinerja | 6 | 9 | 15 | **30** |
| 3. Pelaporan Kinerja | 3 | 4,5 | 7,5 | **15** |
| 4. Evaluasi AKIP Internal | 5 | 7,5 | 12,5 | **25** |

Predikat: **AA**=100, **A**=90, **BB**=80, **B**=70, **CC**=60, **C**=50, **D**=30, **E**=0

Formula: Nilai Sub-Komponen = (Predikat/100) x Bobot

Lihat `references/01-kriteria-lke-permen88-2021.md` untuk kriteria lengkap per sub-komponen.

---

## Alur Kerja Lengkap

### FASE 0 — Ekstraksi LKE (Claude)

```bash
# Ekstrak struktur LKE ke JSON
python3 [skill_path]/scripts/extract_lke.py \
  "[path_lke.xls]" \
  "[output_folder]/lke_extracted.json"
```

JSON hasil berisi: unit kerja, tahun, 12 sub-komponen, 79 kriteria, semua URL bukti dukung.

---

### FASE 0.5 — Siapkan Folder Bukti Dukung (Auditor)

**Langkah ini dilakukan AUDITOR** — kumpulkan dokumen dari evsakip.komdigi.go.id ke folder lokal, lalu Claude baca via Cowork.

**Struktur folder yang diharapkan:**

```
bukti_dukung/
  1_a/          ← nama folder = kode sub-komponen (titik/underscore/strip semua diterima)
  1_b/
  1_c/
  2_a/
  2_b/
  2_c/
  3_a/
  3_b/
  3_c/
  4_a/
  4_b/
  4_c/
```

**Isi tiap folder sub-komponen**: Letakkan semua dokumen bukti dukung untuk unsur tersebut. Bisa langsung di folder utama, atau dikelompokkan per kriteria:

```
bukti_dukung/
  1_a/                    ← OPSI A: flat (semua file langsung)
    renstra_2020-2024.pdf
    renja_2025.pdf
    pk_2025.pdf

  1_b/                    ← OPSI B: per kriteria (lebih presisi)
    kr1/
      pohon_kinerja.pdf
    kr2/
      manual_iku.pdf
    kr3/
      sk_cascading.pdf
```

**Nama folder**: `1_a`, `1.a`, `1-a`, `1a` — semua format diterima otomatis.

**Format file yang didukung**: PDF, XLSX, XLS, DOCX, ZIP (ZIP diekstrak otomatis).

**Lokasi folder**: Letakkan `bukti_dukung/` di dalam folder penugasan, sejajar dengan `lke_extracted.json`:
```
penugasan/SAKIP/_KKP/
  lke_extracted.json
  bukti_dukung/       ← di sini
    1_a/
    1_b/
    ...
```

Setelah folder siap, beritahu Claude untuk lanjut ke FASE 1.

---

### FASE 1 — Ekstraksi Teks Dokumen (Claude)

```bash
# Install dependency PDF reader
pip install pdfminer.six openpyxl --break-system-packages -q

# Ekstrak teks dari semua dokumen lokal → augment JSON
python3 [skill_path]/scripts/read_local_bukti.py \
  "[output_folder]/lke_extracted.json" \
  "[output_folder]/bukti_dukung" \
  "[output_folder]/lke_with_bukti.json"
```

Output: `lke_with_bukti.json` — struktur sama dengan `lke_extracted.json`, ditambah field `analisis_dokumen` berisi teks dokumen per kriteria.

---

### FASE 2 — Analisis dan Penilaian Per Komponen (Claude)

Proses SATU KOMPONEN sekaligus. Baca `lke_with_bukti.json` dan untuk setiap kriteria:

**Langkah 1**: Baca `analisis_dokumen[].konten` — teks dokumen sudah tersedia di JSON.

**Langkah 2**: Cocokkan dengan kriteria (lihat `references/01-kriteria-lke-permen88-2021.md`):

```
Kriteria : "Terdapat pedoman teknis perencanaan kinerja"
Dokumen  : PermenKominfo No.13/2015 — Pedoman SAKIP ✓ (dokumen resmi, TTD digital)
Hasil    : TERPENUHI — predikat A
Catatan  : "Terdapat PermenKominfo No. 13 Tahun 2015 tentang Pedoman SAKIP
            yang masih berlaku dan diformalkan dengan tanda tangan digital."
```

**Langkah 3**: Strategi penilaian efisien berdasarkan jenis kriteria:

| Jenis Kriteria | Fokus Analisis |
|---|---|
| **Keberadaan** (ada/tidak) | Cukup cek jenis dan nama dokumen — tidak perlu baca isi |
| **Kualitas** (SMART, cascading, kelengkapan) | Baca isi: cek IKU, target, hubungan antardokumen |
| **Pemanfaatan** (reward nyata, survei terbaru) | Cek tanggal dokumen, bukti implementasi vs regulasi saja |

**Langkah 4**: Catat temuan per kriteria:
```
KRITERIA [nomor]: [deskripsi singkat]
Status   : TERPENUHI / SEBAGIAN / BELUM
Bukti    : [nama/jenis dokumen yang ditemukan]
Catatan  : [observasi spesifik dari teks dokumen]
Predikat : [A/BB/B/CC/C/D/E]
```

**Tanda peringatan** — jika ditemukan, turunkan nilai:

| Red Flag | Komponen |
|---|---|
| Reward/punishment hanya regulasi, belum implementasi | Pengukuran 2.c |
| Survei pemahaman pegawai data tahun lalu | Pengukuran 2.c |
| LKj tidak memuat benchmarking nasional/internasional | Pelaporan 3.b |
| Rencana aksi belum diformalkan level Menteri/UKE I | Perencanaan 1.c |
| Pohon kinerja tidak menunjukkan crosscutting | Perencanaan 1.b |
| Dokumen tidak bisa diekstrak (scan/gambar) → turunkan 1 level | Semua |

---

### FASE 3 — Skoring Sub-Komponen (Claude)

Setelah semua kriteria dinilai:

1. Hitung persentase kriteria terpenuhi:
   - Terpenuhi penuh = 100 poin
   - Terpenuhi sebagian = 50 poin
   - Belum terpenuhi = 0 poin
   - Persen = (jumlah poin) / (n × 100) × 100%

2. Tetapkan predikat sub-komponen:
   - 100% + inovatif/percontohan nasional = **AA**
   - 100% + ada upaya tambahan = **A**
   - 100% sesuai mandat = **BB**
   - >75% = **B**
   - >50% = **CC**
   - >25% = **C**
   - >0% = **D**
   - 0% = **E**

3. Hitung nilai: (Predikat/100) × Bobot

---

### FASE 4 — Isi LKE Excel (Claude)

Siapkan JSON evaluasi (copy `lke_with_bukti.json`, isi `penilaian_apip_baru` per kriteria), lalu:

```bash
pip install openpyxl --break-system-packages -q

python3 [skill_path]/scripts/fill_lke_apip.py \
  "[path_lke_asli.xls]" \
  "[output_folder]/lke_with_bukti.json" \
  "[output_folder]/LKE_[UNIT]_[TAHUN]_APIP.xlsx"
```

---

### FASE 5 — LHE Word + KKP Markdown (Claude)

Baca skill `docx` terlebih dahulu, lalu susun berdasarkan `references/02-template-lhe.md`.

Struktur LHE:
```
Surat pengantar (identitas surat)
  ↓
Laporan Hasil Evaluasi
  Ringkasan Eksekutif
  I.  Gambaran Umum
  II. Tindak Lanjut Evaluasi Tahun Sebelumnya
  III. Hasil Evaluasi (per komponen + tabel nilai)
  IV. Rekomendasi (diawali "Agar...")
  V.  Penutup + Tanda Tangan
  Lampiran I: Tabel Nilai Lengkap
```

KKP Markdown: rekapitulasi nilai, temuan per komponen, rekomendasi utama, daftar dokumen dianalisis.

---

## Panduan Analisis Dokumen per Komponen

### Komponen 1 — Perencanaan Kinerja
Dokumen kunci: Renstra, Renja, PK (semua level), Pohon Kinerja, SKP, Manual IKU, Pedoman SAKIP
Yang dinilai:
- **Keberadaan**: Dokumen ada, resmi, ditandatangani
- **Kualitas**: IKU SMART? Cascading jelas? Target menantang?
- **Pemanfaatan**: Anggaran mengacu PK? Rencana aksi dinamis? Pegawai memahami?

### Komponen 2 — Pengukuran Kinerja
Dokumen kunci: Manual Indikator, laporan monev bulanan/triwulanan, risalah rapat monev, bukti reward/punishment, hasil survei pegawai
Yang dinilai:
- **Keberadaan**: Definisi operasional, mekanisme pengumpulan data
- **Kualitas**: Data relevan, berkala, berjenjang, berbasis TI
- **Pemanfaatan**: Reward/punishment nyata (bukan hanya regulasi), survei tahun berjalan

### Komponen 3 — Pelaporan Kinerja
Dokumen kunci: LKj, laporan triwulanan/semesteran, nota reviu APIP, bukti publikasi, analisis benchmarking
Yang dinilai:
- **Keberadaan**: LKj ada, berkala, direviu, dipublikasikan, tepat waktu
- **Kualitas**: Analisis hambatan, benchmarking nasional/internasional
- **Pemanfaatan**: LKj digunakan dasar penyesuaian kebijakan

### Komponen 4 — Evaluasi AKIP Internal
Dokumen kunci: LHE AKIP internal, laporan tindak lanjut, sertifikat diklat evaluator, panduan evaluasi internal
Yang dinilai:
- **Keberadaan**: Ada pedoman, dilaksanakan menyeluruh dan berjenjang
- **Kualitas**: Sesuai standar, SDM kompeten, menggunakan TI
- **Pemanfaatan**: Rekomendasi ditindaklanjuti, terjadi peningkatan SAKIP

---

## Output yang Dihasilkan

| File | Format | Lokasi |
|---|---|---|
| LKE terisi | .xlsx | `_KKP/LKE_[UNIT]_[TAHUN]_APIP.xlsx` |
| Laporan Hasil Evaluasi | .docx | `_LHP/LHE_AKIP_[UNIT]_[TAHUN].docx` |
| Kertas Kerja Pengawasan | .md | `_KKP/KKP_SAKIP_[UNIT]_[TAHUN].md` |

---

## Scripts dan Referensi

| File | Fungsi | Dijalankan oleh |
|---|---|---|
| `scripts/extract_lke.py` | LKE .xls → JSON terstruktur | Claude |
| `scripts/read_local_bukti.py` | Folder lokal → JSON+teks dokumen | Claude |
| `scripts/fill_lke_apip.py` | JSON evaluasi → LKE .xlsx terisi | Claude |
| `scripts/download_bukti.py` | *(Opsional)* Download URL dari JSON → folder lokal | Auditor (jika dibutuhkan) |
| `references/01-kriteria-lke-permen88-2021.md` | Kriteria lengkap per sub-komponen | Referensi |
| `references/02-templa