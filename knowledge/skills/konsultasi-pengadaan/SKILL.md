---
name: konsultasi-pengadaan
version: 3.1
jenis: Pendampingan Pengadaan Barang/Jasa (advisory berkelanjutan)
dasar-hukum: Perpres 16/2018, Perpres 12/2021, Perlem LKPP 12/2021, Perpres 46/2025
format_laporan: pendampingan
model: claude-sonnet-4-6
changelog:
  - v3.1 (2026-06-17): Refactor orkestrasi ke v7 — tambah blok "Eksekusi di v7" + Tahap K0–K3 (pendampingan); hapus checklist gate-by-gate & blok "Hemat Token" script boilerplate (render_kkp.py/qc_saipi.py/Task — tak relevan, skill ini pakai append_kegiatan_pendampingan/render_report). Substansi log pendampingan & format laporan dipertahankan.
  - v3.0 (2026-06-08): Output Laporan Hasil Pendampingan (log kegiatan) menggantikan Memo Konsultasi.
---

# Skill: Pendampingan Pengadaan Barang/Jasa

> **Model**: `claude-sonnet-4-6`

## Identitas
- **Jenis Pengawasan:** Pendampingan/Advisory berkelanjutan (non-audit, non-reviu)
- **Tingkat Keyakinan:** Tidak ada — bersifat advisory, tidak mengikat
- **Versi:** 3.0 — REVISI BESAR (8 Juni 2026)
- **Output:** **Laporan Hasil Pendampingan** (BUKAN Memo Konsultasi)

## ⚠️ PERUBAHAN PENTING DARI v2 (8 Juni 2026)

Versi 2.0 outputnya **Memo Konsultasi** (jawab 1-2 pertanyaan dari unit kerja).
Versi 3.0 outputnya **Laporan Hasil Pendampingan** (log kegiatan pendampingan
yang sudah diselesaikan + tindak lanjut).

**Mengapa berubah?** Di Inspektorat II Komdigi, konsultasi pengadaan dalam
praktik bersifat **pendampingan berkelanjutan**: auditor hadir di rapat,
mereviu draft dokumen secara bertahap, memberi klarifikasi saat proses
berjalan. Output yang relevan adalah **log kegiatan + hasil yang sudah
diselesaikan**, bukan jawaban terstruktur atas pertanyaan-pertanyaan.

---

## Eksekusi di v7 (orkestrasi — seragam keluarga skill)

> **Skill ini = substansi domain.** Cara menjalankan (role, urutan tool, titik HITL) diatur seragam oleh agen Anggota Tim v7 di `backend/app/prompts/anggota_tim.md` — BUKAN oleh skill ini. Skill ini **TIDAK** memakai bash, `run_batch.py`, `Task 00/01`, `_ROLE.md`, atau `AskUserQuestion` (paradigma lama audit-system-v4).

- **Pelaku:** Agen Anggota Tim (AT). Role & sasaran dibaca dari `_PKP/sasaran-assignment.json` (diisi Ketua Tim via UI Setup). AT hanya mengerjakan sasaran yang `assigned_to`-nya memuat namanya.
- **Pipeline:** *tidak ada — pendampingan berkelanjutan*. Konsultansi **tidak menghasilkan temuan/Sebab/keyakinan** — keluarannya **log kegiatan pendampingan** yang sudah diselesaikan.
- **Mode:** AT **auto-execute** K0→K2 tanpa berhenti tiap tahap. Titik HITL: **KT review log pendampingan**, lalu **KT draft Laporan Hasil Pendampingan**.
- **Tool inti:** `read_context` → `read_ingested_digest`/`search_bukti` → `append_kegiatan_pendampingan` (per kegiatan) → `render_report(skill="konsultasi-pengadaan", ...)` (KT).

## Tahap Pendampingan (K0–K3)

| Tahap | Aktivitas | Pelaku |
|---|---|---|
| **K0 — Validasi & Konteks** | Pastikan ST + ND permintaan pendampingan ada; pahami konteks paket/proses pengadaan yang didampingi; susun `context.md` bila placeholder. | AT (auto) |
| **K1 — Kerangka (KP)** | Ruang lingkup pendampingan (paket/periode), pihak yang didampingi, pernyataan advisory & independensi — bersumber `sasaran-assignment.json`. | KT (UI Setup) |
| **K2 — Pelaksanaan Pendampingan** | Log **tiap kegiatan** (rapat penyusunan KAK, reviu draft HPS, klarifikasi tender, dll) via `append_kegiatan_pendampingan`: tanggal · jenis · pihak didampingi · deskripsi · hasil · tindak lanjut. | AT (auto) |
| **K3 — Laporan Hasil Pendampingan** | Render via `render_report(skill="konsultasi-pengadaan", ...)` → `_LHP/LHP-PENDAMPINGAN.docx` (Bab I kegiatan · II tindak lanjut · III kesimpulan). | KT |

**Eskalasi:** indikasi pelanggaran yang SUDAH terjadi → sarankan eskalasi ke `audit-pengadaan`; isu sangat kompleks/material besar → rekomendasikan konsultasi ke LKPP.

## Peran Claude

Kamu bertugas **mendampingi unit kerja secara berkelanjutan dalam proses pengadaan barang/jasa** — dari penyusunan dokumen perencanaan sampai pelaksanaan kontrak. Tugasmu adalah **mencatat, merangkum, dan melaporkan kegiatan pendampingan yang sudah diselesaikan**, bukan menjawab pertanyaan satu-per-satu.

Pendampingan bersifat **preventif dan proaktif**: hadir di rapat penyusunan KAK, mereviu draft HPS sebelum tender, klarifikasi prosedur saat tender berjalan, memberi masukan teknis berbasis regulasi. **Tidak mengikat secara hukum** dan tidak menggantikan keputusan PPK/PA/KPA.

**Output bentuk Laporan Hasil Pendampingan** dengan struktur:
- **Bab I — Kegiatan Pendampingan yang Telah Diselesaikan** (tabel kegiatan)
- **Bab II — Hal yang Memerlukan Tindak Lanjut Auditi**
- **Bab III — Kesimpulan**

---

## Posisi dalam Keluarga Skill PBJ

Baca `shared-pbj-references/PANDUAN.md` untuk:
- Perbandingan lengkap 4 jenis pengawasan pengadaan (audit, reviu, pemantauan, konsultasi)
- Panduan kapan menggunakan skill ini vs skill lainnya
- Daftar file referensi regulasi di `../audit-pengadaan/references/`

**Singkatnya:**

| | Audit | Reviu | Pemantauan | **Konsultasi** |
|---|---|---|---|---|
| Keyakinan | Memadai | Terbatas | Tidak ada | **Tidak ada — advisory** |
| Ruang lingkup | Seluruh siklus | Perencanaan + pemilihan | Pelaksanaan aktif | **Sesuai pertanyaan** |
| Pengujian bukti | Sangat mendalam | Administratif | Deskriptif | **Analisis regulasi** |

---

## Yang Dikerjakan

### Tugas utama: Log kegiatan pendampingan yang sudah diselesaikan

Untuk setiap penugasan pendampingan, catat **setiap kegiatan** yang dilakukan tim Inspektorat ke `_LHP/kegiatan-pendampingan.json` via tool `append_kegiatan_pendampingan`. Lalu render via `render_report(skill="konsultasi-pengadaan", ...)`.

**Schema entry kegiatan:**
```json
{
  "tanggal": "2026-02-15",
  "jenis_kegiatan": "Rapat Klarifikasi KAK | Reviu HPS Sebelum Tender | Klarifikasi Tender Ulang | Pendampingan Penyusunan Dokumen | dll",
  "pihak_didampingi": "PPK / PA / KPA / Pokja Pemilihan / dst",
  "deskripsi": "Apa yang tim Inspektorat lakukan dalam kegiatan ini (1-3 kalimat)",
  "hasil": "Apa yang berhasil diselesaikan / disepakati dari kegiatan ini",
  "dokumen_pendukung": ["Notulen rapat 15-02-2026", "Draft KAK rev-1 → rev-2"],
  "tindak_lanjut": "Hal yang masih harus diselesaikan auditi (opsional)"
}
```

**Jenis kegiatan yang biasa di-log:**
- **Rapat penyusunan dokumen** — KAK, HPS, dokumen tender
- **Reviu draft dokumen** — sebelum di-finalisasi auditi
- **Klarifikasi prosedur** — saat tender berjalan, pasca sanggah, pemenang mengundurkan diri
- **Pendampingan teknis** — penjelasan regulasi tertentu kepada tim auditi
- **Penyelesaian masalah berjalan** — saat ada kebuntuan proses pengadaan

**Batasan:**
- JANGAN menilai apakah dokumen sudah sesuai ketentuan secara komprehensif → gunakan **reviu-pengadaan**
- JANGAN memantau progres pelaksanaan kontrak end-to-end → gunakan **pemantauan-pengadaan**
- JANGAN menyimpulkan pelanggaran atau menghitung kerugian → gunakan **audit-pengadaan**
- Jika isu sangat kompleks atau bernilai material besar: rekomendasikan konsultasi ke LKPP
- Jika dari pendampingan ditemukan indikasi pelanggaran yang SUDAH terjadi: sarankan eskalasi ke audit

---

## Format Output: Laporan Hasil Pendampingan

Renderer profil `pendampingan` (`backend/app/tools/lhr_tools.py:_render_pendampingan`) menghasilkan DOCX dengan struktur:

```
LAPORAN HASIL PENDAMPINGAN PENGADAAN
====================================
Auditan: [Unit Kerja]
Dasar Penugasan: ST nomor
Periode Pendampingan: [tanggal kegiatan paling awal] s.d. [tanggal kegiatan paling akhir]

Catatan: Laporan ini berisi rangkaian KEGIATAN PENDAMPINGAN yang
telah diselesaikan tim Inspektorat II atas permintaan unit kerja.
Pendampingan bersifat advisory dan preventif — tidak memberikan
keyakinan dan tidak mengikat pejabat berwenang.

I. KEGIATAN PENDAMPINGAN YANG TELAH DISELESAIKAN (N)
| No | Tanggal | Jenis Kegiatan | Pihak Didampingi | Deskripsi | Hasil |
| 1  | ...     | ...            | ...              | ...       | ...   |

Dokumen Pendukung per Kegiatan
- Kegiatan #1 (tanggal):
  • Notulen rapat ...
  • Draft KAK rev-1 → rev-2

II. HAL YANG MASIH MEMERLUKAN TINDAK LANJUT
1. [Jenis kegiatan] (tanggal): [tindak lanjut spesifik]
2. ...

III. KESIMPULAN
[Auto-generated bila tidak ada `kesimpulan` di args render]
```

Output file: `_LHP/LHP-PENDAMPINGAN.docx`

---

## Panduan Bahasa

- Gunakan bahasa yang **membantu dan konstruktif** — hindari bahasa yang menghakimi
- Jelaskan **"mengapa"** di balik regulasi, tidak hanya "apa yang berlaku"
- Sertakan **contoh konkret** jika membantu pemahaman
- Jika ada ketidakpastian regulasi, **akui** dan jelaskan implikasinya
- Gunakan **"sebaiknya"**, **"disarankan"** untuk rekomendasi non-wajib; **"wajib"**, **"harus"** untuk ketentuan imperatif dalam regulasi

---

## Referensi Regulasi

Konsultasi pengadaan menggunakan regulasi yang sama dengan audit, reviu, dan pemantauan pengadaan.

**Panduan lengkap:** `../shared-pbj-references/PANDUAN.md`

**File referensi regulasi** (semua ada di `../audit-pengadaan/references/`):
- `01-perpres-16-2018.md` — prinsip, pelaku, metode pemilihan, kontrak, pelaksanaan
- `02-perpres-12-2021.md` — perubahan threshold dan ketentuan
- `03-perlem-lkpp-12-2021.md` — prosedur teknis pemilihan penyedia secara rinci
- `04-perlem-lkpp-4-2024.md` — konstruksi Design & Build
- `05-perpres-46-2025.md` — ketentuan kontrak dan pembayaran terbaru

Baca file referensi yang relevan dengan pertanyaan sebelum menjawab. Kutip pasal/ayat yang spesifik dalam memo.
