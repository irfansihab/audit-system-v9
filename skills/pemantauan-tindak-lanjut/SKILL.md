---
name: pemantauan-tindak-lanjut
version: 0.1
jenis: Pemantauan Tindak Lanjut Hasil Pengawasan (TLHP)
dasar-hukum: PP 60/2008 Pasal 50, Permenpan 5/2008
model: claude-sonnet-4-6
output: Laporan Hasil Pemantauan TLHP + Update Status
status: skeleton
---

> **Checklist gate-by-gate:** Lihat `audit-system-v4/checklists/pemantauan-tindak-lanjut.md` untuk daftar pemeriksaan tahap demi tahap.


# Pemantauan Tindak Lanjut Hasil Pengawasan (TLHP)

> **Model**: `claude-sonnet-4-6` untuk aging analysis & narasi, `claude-haiku-4-5` untuk klasifikasi status.
> **Output**: Laporan Pemantauan TLHP (`templates/Laporan Hasil Pemantauan TLHP.docx`) + matrix aging Excel.

## Tujuan

Memastikan seluruh rekomendasi pengawasan eksternal (BPK) dan internal (BPKP, Itjen) **ditindaklanjuti tepat waktu dan tepat substansi** oleh unit kerja Kemkomdigi. Output: laporan periodik yang dikirim ke Menteri/Sekjen dengan dashboard status + daftar rekomendasi kritis yang belum selesai.

## Ruang Lingkup

- **TLHP BPK**: rekomendasi LHP BPK (per semester, tahun berjalan + backlog)
- **TLHP BPKP**: rekomendasi LHP BPKP (evaluasi SPIP, audit kinerja, review LK)
- **TLHP APIP**: rekomendasi LHP Itjen (audit + reviu + evaluasi)
- **Peer Review**: rekomendasi peer review APIP (jika ada)

## Hemat Token & Eksekusi (v4.0.4)

Sebelum mulai analisis dokumen, ikuti panduan berikut agar eksekusi cepat tanpa mengorbankan kualitas:

1. **Jangan re-read dokumen yang sudah di-digest**. Bila skill ini punya pipeline pre-digest (`scripts/[skill]/digest_*.py` + `cross_check.py`), pakai langsung field `parsed.*` di output JSON. Re-read dokumen asli hanya untuk verifikasi halaman yang akan dikutip ke `dokumen_sumber[*].kutipan` atau cross-check false positive rule.
2. **Render KKP & LHP via script terstandar** (v4.0.4):
   - KKP DOCX: `python3 scripts/render_kkp.py --penugasan ... --all-anggota`
   - LHP DOCX: `python3 scripts/render_lhp.py --penugasan ... --rekomendasi-file ...` (template skeleton di `templates/_skeleton-lhp/template-lhp-[skill].docx`; kalau belum ada untuk skill ini, fallback ke generate manual mengikuti pattern di `templates/_skeleton-lhp/template-lhp-reviu-pengadaan.docx`)
3. **Audit trail batch**: tulis multiple events dalam 1 call dengan `audit_trail.py log-batch --events '[...]'`. Hindari chain `log-event` x N.
4. **Preflight QC SAIPI** di akhir Task 01: `qc_saipi.py --preflight-context` cek context.md sebelum analisis Task 03 mulai (mencegah KRITIS context.md baru ketahuan saat KKP sudah disusun).
5. **Auto-gen QA placeholder**: `init_qa_artifacts.py` di akhir Task 01 menulis `_QA-SAIPI/deklarasi-independensi.md`, `jawaban-needs-review.md`, `justifikasi.md` — mencegah iterasi NEEDS_REVIEW di Task 03/04.


## Paradigma

**Monitoring** — bukan assurance. Auditor mencatat status *apa adanya* berdasarkan bukti tindak lanjut yang diserahkan unit kerja.

## Kolom KKP / Tabel Pemantauan

| No | Asal LHP | No Rek | Substansi Rekomendasi | PIC | Deadline | Status | Umur (hari) | Keterangan |
|----|----------|--------|-----------------------|-----|----------|--------|-------------|-----------|

**Status values**:
- **Selesai** — bukti tindak lanjut lengkap dan memadai, rekomendasi ditutup
- **Dalam Proses** — ada tindak lanjut parsial, perlu pendalaman
- **Belum Ditindaklanjuti** — tidak ada bukti tindak lanjut
- **Tidak Dapat Ditindaklanjuti** — justifikasi kuat kenapa rek tidak relevan lagi (perlu SK penghapusan)

**Umur (hari)** = hari sejak terbit LHP sampai cut-off pemantauan.
- 0–90 hari: 🟢 hijau
- 91–180 hari: 🟡 kuning
- 181–365 hari: 🟠 orange
- >365 hari: 🔴 merah (kritis — wajib perhatian Menteri)

## Alur Eksekusi

### Langkah 1 — Muat Daftar Rekomendasi

Sumber data (urutan prioritas):
1. Database TLHP Itjen (jika sudah ada aplikasi internal — integrasi ke depan)
2. File Excel rekap manual `TLHP-[sumber]-[tahun].xlsx`
3. Scan/ekstrak rekomendasi dari file LHP (.pdf/.docx) di folder `lhp-sumber/`

### Langkah 2 — Klasifikasi Status

Baca folder bukti tindak lanjut (`bukti-tl/`) per rekomendasi:
- Jika ada ≥1 bukti relevan + substansial → *Dalam Proses* (minimal)
- Jika bukti menutup seluruh item rekomendasi → *Selesai*
- Jika tidak ada file bukti → *Belum Ditindaklanjuti*

**Anti-halusinasi**: setiap status harus mengutip nama file bukti (atau "tidak ada file").

### Langkah 3 — Aging Analysis

Hitung umur (hari), klasifikasikan ke kategori warna. Agregasi per PIC:

```
PIC: [Unit Kerja]
  Total rekomendasi: [n]
  Selesai: [n]
  Proses: [n]
  Belum: [n] (merah: [n], orange: [n], kuning: [n])
  Aging rata-rata belum-selesai: [hari]
```

### Langkah 4 — Identifikasi Rekomendasi Kritis

Rekomendasi dengan umur >365 hari + status ≠ Selesai otomatis naik ke **Daftar Kritis** yang disorot di laporan + ringkasan eksekutif ke Menteri.

### Langkah 5 — Susun Laporan

Template: `templates/Laporan Hasil Pemantauan TLHP.docx`

Struktur:
1. Ringkasan Eksekutif (1 halaman — untuk Menteri/Sekjen)
2. Statistik Umum (total rek, % selesai, per sumber)
3. Aging per PIC (tabel + ranking worst)
4. Daftar Rekomendasi Kritis (>365 hari)
5. Rekomendasi percepatan
6. Lampiran: matrix lengkap (Excel separate)

## Integrasi dengan Skill Lain

- **evaluasi-spip**: skor Komponen IV (Informasi-Komunikasi) dan V (Pemantauan) bisa memakai data TLHP sebagai bukti dukung
- **evaluasi-sakip**: Komponen Evaluasi Akuntabilitas Internal (Gate 4) merujuk persentase penyelesaian TLHP
- **audit-kinerja**: temuan berulang dari TLHP bisa jadi input Hipotesis Audit Awal di Memo SP

## Kerangka References yang Dibutuhkan

| # | File | Isi | Status |
|---|------|-----|--------|
| 01 | `01-pp-60-2008-spip.md` | Pasal kewajiban TLHP | ⬜ |
| 02 | `02-keputusan-bpk-tlhp.md` | Mekanisme koordinasi Kemkomdigi-BPK | ⬜ |
| 03 | `03-template-matrix-aging.xlsx` | Template Excel untuk aging analysis | ⬜ |
| 04 | `04-panduan-klasifikasi-status.md` | Kriteria detail kapan rek dianggap Selesai/Proses/Belum | ⬜ |

## Status Skill

⬜ **SKELETON** — v0.1 (19 April 2026). Dibuat sebagai bagian upgrade sistem v2.8. Perlu piloting di 1 penugasan pemantauan TLHP aktual untuk validasi alur + template.

## Catatan Implementasi

- Pemantauan TLHP dilakukan **rutin per semester** (Jan–Jun, Jul–Des) oleh Itjen → bangun template yang reusable lintas periode.
- Laporan dikirim bersamaan dengan LHP tahunan Itjen ke Menteri.
- Integrasi masa depan: pull data dari SIMWAS Itjen (aplikasi internal) — saat ini masih manual Excel.
