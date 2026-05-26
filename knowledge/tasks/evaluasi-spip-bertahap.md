# Task — Evaluasi SPIP Bertahap (Gate-Based)

> **Model**: `claude-sonnet-4-6` untuk analisis + `claude-haiku-4-5` untuk triage filename.
> **Skill induk**: `evaluasi-spip` (lihat `skills/evaluasi-spip/SKILL.md`).
> **Output**: `LKE SPIP KEMENTERIAN - PK.xlsx` + `AoI-catatan-tindak-lanjut.md` + `penilaian-progress.json`.

Alur evaluasi SPIP dipecah menjadi **9 gate berurutan**. Setiap gate WAJIB mendapat konfirmasi eksplisit auditor (**LANJUT / KOREKSI / ULANG**) sebelum berpindah ke gate berikutnya. Progress dicatat di `penilaian-progress.json` di folder penugasan agar dapat di-resume jika sesi terputus.

---

## Prinsip Umum

1. **Satu gate = satu fokus kecil** — hindari batch besar. Batas maksimal: **1 komponen bobot SPIP per gate** (kecuali Unsur III yang di-split).
2. **Isi LKE langsung per gate** — pakai `LKEWriter` dari `skills/evaluasi-spip/references/fill_lke_safely.py`. JANGAN tunggu semua gate selesai baru menulis.
3. **Generate AoI per gate (WAJIB)** — setelah LKE terisi, langsung update `penugasan/SPIP/AoI-SPIP-[tahun].md` dengan AoI baru yang ditemukan di gate tersebut. AoI terakumulasi lintas gate dan menjadi acuan LHE.
4. **Ringkas temuan tiap gate** dalam format 3 baris: apa yang diisi, skor akhir PK per subunsur, hal yang perlu perhatian auditor.
5. **Auditor memegang kendali**: setiap gate berhenti dan menunggu jawaban. Kalau LANJUT → ke gate berikutnya. Kalau KOREKSI → revisi sesuai feedback di gate yang sama. Kalau ULANG → ulang penilaian gate bersangkutan dari awal.
6. **Log progress** setelah setiap gate selesai:
   ```json
   {"gate": 2, "status": "LANJUT", "tanggal": "...", "jumlah_aoi": 3, "aoi_id": ["SP-01","SP-02","SP-03"]}
   ```

## Tooling v4.0.4 (hemat eksekusi)

- **Audit trail batch**: di setiap gate, pakai `audit_trail.py log-batch --events '[...]'` untuk log multi-event sekaligus (TASK_STARTED + FILE_GENERATED LKE + GATE_PASSED).
- **LHE Generation** (akhir gate 9): pakai `scripts/render_lhp.py --penugasan ... --rekomendasi-file ...` dengan `templates/_skeleton-lhp/template-lhp-evaluasi-spip.docx`. Isi `--gambaran-umum` dengan ringkasan skor PK per 3 fokus (Penetapan Tujuan / Struktur & Proses / Pencapaian Tujuan).
- **Preflight QC SAIPI** setelah Gate 0: `python3 scripts/qc_saipi.py --penugasan ... --preflight-context` cek context.md sebelum Gate 1 mulai.
- **QA placeholder** di Gate 0: `python3 scripts/init_qa_artifacts.py --penugasan ...` skeleton-kan `_QA-SAIPI/*` agar QC SAIPI di Gate 9 tidak iterasi.

## Format AoI per Gate

Setiap AoI harus memuat 7 field wajib (template di `skills/evaluasi-spip/SKILL.md` seksi "Catatan AoI"):

```
AoI-[KODE]-[NO] — [NAMA KELEMAHAN PENGENDALIAN]

Komponen      : Penetapan Tujuan / Struktur dan Proses / Pencapaian Tujuan
Cakupan       : [daftar baris/subunsur yang terkena]
Nilai PK      : [skor/% per kriteria yang turun]
Nilai PM      : [skor pembanding]
Kondisi       : [fakta dari LKE + bukti dokumen]
Dampak        : [konsekuensi ke tujuan organisasi]
Rekomendasi   : [tindakan konkret: siapa, apa, kapan, ukuran sukses]
Prioritas     : Tinggi / Sedang / Rendah
PIC           : [unit yang bertanggung jawab]
Target selesai: [deadline eksplisit]
```

Kode AoI per komponen:
- **PT** = Penetapan Tujuan (Gate 1A–1D)
- **LP** = Lingkungan Pengendalian (Gate 2)
- **PR** = Penilaian Risiko (Gate 3)
- **KP** = Kegiatan Pengendalian (Gate 4A/B)
- **IK** = Informasi-Komunikasi (Gate 5)
- **PM** = Pemantauan (Gate 5)
- **PC** = Pencapaian Tujuan (Gate 6)
- **VP** = Veto Penalti (Gate 7)

Contoh: `AoI-PT-04` = AoI Penetapan Tujuan no 4.

File AoI ditambahkan/diperbarui SETELAH LKE terisi dan SEBELUM lapor LANJUT ke auditor. Urutan per gate:

```
1. Tulis PK ke LKE (via LKEWriter)
2. Verifikasi agregator utuh
3. Update AoI-SPIP-[tahun].md dengan AoI baru gate ini
4. Update penilaian-progress.json
5. Present ringkasan + AoI ke auditor → tunggu LANJUT/KOREKSI/ULANG
```

---

## Gate 0 — Konfirmasi Awal Penugasan

**Tujuan:** Validasi asumsi dasar sebelum menilai apa pun.

**Langkah:**
1. Baca LKE template di `penugasan/SPIP/LKE SPIP KEMENTERIAN.xlsx`.
2. Baca inventory bukti dukung di `penugasan/SPIP/_inventory_bukti_dukung.json` (hasil indexing).
3. Ajukan 4 pertanyaan wajib ke auditor (lihat `skills/evaluasi-spip/SKILL.md` seksi "Konfirmasi Awal Penugasan"):
   - Status Nilai PM?
   - Cakupan satker + aturan bukti parsial?
   - Subunsur tanpa bukti dukung?
   - Ada kasus korupsi untuk KK4_PENALTI?

**Deliverable:** `penilaian-progress.json` baris `gate_0` terisi dengan jawaban auditor.
**Gate:** LANJUT → Gate 1.

---

## Gate 1 — Penetapan Tujuan (bobot 40%)

**Sheet LKE:** `KKE 1.1 SASTRA PEMDA`, `KKE 1.2 SASARAN OPD`, `KKE 2.1 SASKEG`, `KK 2.2 RO`, `KKE 2.2 KEGIATAN`.

**Fokus:** Kualitas sasaran strategis K/L, sasaran program, sasaran kegiatan, dan rincian output berdasarkan Renstra + Perjanjian Kinerja.

**Langkah:**
1. Baca Renstra K/L 2025-2029 dan Perjanjian Kinerja tahun berjalan (di folder bukti dukung 3.5 Reviu IKU atau folder penugasan utama).
2. Untuk setiap baris sasaran di KKE 1.1 → nilai 5 kriteria (Y/T) di kolom **K–O**, keterangan di **P**:
   - K: Berorientasi hasil
   - L: Relevan & menggambarkan mandat
   - M: Indikator tepat
   - N: Uji kecukupan indikator
   - O: Target tepat
3. Ulangi pola yang sama untuk KKE 1.2 (Sasaran Program), KKE 2.1 (Saskeg), KK 2.2 RO, KKE 2.2 Kegiatan.

**Deliverable Gate 1:**
- Kolom PK terisi untuk 4 sheet KKE
- Ringkasan: "Gate 1 selesai — X sasaran strategis dinilai, Y memenuhi semua kriteria, Z butuh perbaikan. Skor agregat Penetapan Tujuan: [dibaca dari KKlead I KL setelah save]."
- Auditor review → **LANJUT / KOREKSI / ULANG**.

---

## Gate 2 — Struktur & Proses: Unsur I (Lingkungan Pengendalian)

**Sheet LKE:** `KK3.1` baris subunsur 1.1–1.8 (bobot subunsur 3.75% masing-masing).

**Fokus:** 8 subunsur — integritas, kompetensi, kepemimpinan, struktur organisasi, pendelegasian, pembinaan SDM, peran APIP, hubungan instansi.

**Strategi Tier 2** (filename-based) untuk 5 subunsur sederhana (1.1, 1.2, 1.4, 1.5, 1.8); **Tier 3** (deep read) untuk 1.3 Kepemimpinan (72 file, 4 parameter) dan 1.6 Kebijakan SDM (76 file, 3 parameter). Subunsur 1.7 Peran APIP → ikut Nilai PM karena hanya 1 file (kapabilitas APIP dinilai terpisah).

**Langkah per subunsur:**
1. Muat daftar file dari `_inventory_bukti_dukung.json` untuk subunsur bersangkutan.
2. Tentukan gradasi A–E per satker (4 satker) berdasarkan jenis bukti yang ada:
   - Ada SK/kebijakan → gradasi E (skor 1)
   - Ada + sosialisasi terdokumentasi → gradasi D (skor 2)
   - Ada + implementasi terlihat di laporan → gradasi C (skor 3)
   - Ada + evaluasi berkala → gradasi B (skor 4)
   - Ada + adaptasi/perbaikan berkelanjutan → gradasi A (skor 5)
3. Tulis uraian + level per satker ke KK3.1:
   - **K6/7/8..** (Uraian Infradigi) + **L6** (Simpulan Level)
   - **M6** (Uraian Ekodigi) + **N6**
   - **O6** (Uraian KPM) + **P6**
   - **Q6** (Uraian Badan Aksesibilitas) + **R6**
   - **V6** (Kesimpulan Akhir PK — angka akhir setelah konfirmasi modus)
   - **W6** (Catatan jika PK ≠ modus)
4. **Aturan bukti parsial**: jika satker X bukti dukungnya kurang dari 3 dokumen, turunkan satu level + catat di W.

**Deliverable Gate 2:**
- KK3.1 baris 6–36 terisi untuk 8 subunsur × 4 satker
- Ringkasan: skor rata-rata Lingkungan Pengendalian + 3 subunsur terlemah yang perlu perhatian AoI
- Auditor review → **LANJUT / KOREKSI / ULANG**.

---

## Gate 3 — Struktur & Proses: Unsur II (Penilaian Risiko)

**Sheet LKE:** `KK3.1` baris subunsur 2.1–2.2 (bobot 10% + 10%).

**Fokus:** 2 subunsur — identifikasi risiko (3 parameter) + analisis risiko (5 parameter).

**Strategi:** Deep read 8 parameter (total 51 file MR). Fokus pada dokumen: Piagam MR, SK UPR, Form 1–4, laporan monitoring MR triwulanan.

**Langkah:**
1. Baca sample dokumen MR per satker: Piagam, Form 1 (konteks), Form 2 (identifikasi), Form 3 (analisis), Form 4 (evaluasi).
2. Periksa dashboard MR (2.2.5) — ada screenshot aplikasi.
3. Tetapkan level per satker → tulis K, L, M, N, O, P, Q, R + V, W.

**Deliverable Gate 3:**
- KK3.1 baris untuk subunsur 2.1, 2.2 terisi
- Ringkasan: apakah MR dilaksanakan di semua 4 satker? Satker mana paling lemah dalam analisis risiko?
- Gate LANJUT / KOREKSI / ULANG.

---

## Gate 4A — Struktur & Proses: Unsur III-A (Keg. Pengendalian 3.1–3.4)

**Sheet LKE:** `KK3.1` baris subunsur 3.1, 3.2, 3.3, 3.4 (bobot 2.27% masing-masing).

**Fokus:** Reviu kinerja (3.1), pembinaan SDM kegpng (3.2), pengendalian SI (3.3), fisik aset (3.4).

**Catatan khusus:** Subunsur 3.2 folder kosong — ikut Nilai PM dengan catatan "perlu re-upload" (sesuai keputusan auditor).

**Deliverable Gate 4A:** 4 subunsur terisi. Gate.

---

## Gate 4B — Struktur & Proses: Unsur III-B (Keg. Pengendalian 3.5–3.11)

**Sheet LKE:** `KK3.1` baris subunsur 3.5–3.11 (7 subunsur bobot 2.27% masing-masing).

**Fokus:** Reviu IKU, pemisahan fungsi, otorisasi transaksi, pencatatan akurat, pembatasan akses, akuntabilitas SD, dokumentasi SPI.

**Strategi:** Banyak subunsur share bukti dukung yang sama (SK PPK/PPSPM/KPA, SOP Penyusunan LK). Manfaatkan cross-reference — jangan baca ulang file yang sudah dibaca di subunsur lain.

**Deliverable Gate 4B:** 7 subunsur terisi. Gate.

---

## Gate 5 — Struktur & Proses: Unsur IV & V (Informasi-Komunikasi + Pemantauan)

**Sheet LKE:** `KK3.1` baris subunsur 4.1, 4.2, 5.1, 5.2.

**Fokus:**
- 4.1 Informasi Relevan (4 parameter, 32 file — laporan + survei)
- 4.2 Komunikasi Efektif (27 file + 16 screenshot sosialisasi)
- 5.1 Pemantauan Berkelanjutan (3 parameter, 28 file)
- 5.2 Evaluasi Terpisah (LHE AKIP + LHE RB + LHE SPIP)

**Deliverable:** 4 subunsur terisi. Gate.

---

## Gate 6 — Pencapaian Tujuan SPIP (bobot 30%)

**Sheet LKE:** `KK 5.1A`, `KK 5.1 B `, `KK 5.2 `, `KK 6`, `KK 7`, `KK 8`.

**Fokus:** Capaian outcome/output (KK 6), pengamanan aset administrasi/fisik/hukum (KK 7), ketaatan perundang-undangan (KK 8), plus pemantauan efektivitas pencapaian (KK 5.x).

**Sumber data:**
- Laporan Kinerja Setjen (folder 3.1)
- LHA BPK — opini laporan keuangan
- LHP APIP — temuan ketaatan
- Laporan Inventarisasi BMN (folder 3.4)

**Deliverable:** 6 sheet terisi. Gate.

---

## Gate 7 — Veto Penalti & Verifikasi Agregator

**Sheet LKE:** `KK4_PENALTI` + verifikasi baca-saja `KKLEAD II`, `KKLEAD III`, `KKLEAD_SPIP`.

**Langkah:**
1. Berdasarkan jawaban Gate 0, isi `KK4_PENALTI!C5:C33` dengan "TIDAK" (default) atau "YA" (jika ada kasus).
2. Buka ulang file dengan `data_only=True`:
   ```python
   wb = load_workbook(path, data_only=True)
   print(wb["KKLEAD_SPIP"]["J..."].value)  # Nilai akhir SPIP
   ```
3. Pastikan tidak ada `#REF!` atau `#DIV/0!` di sheet agregator.
4. Bandingkan: Skor SPIP versi PM vs versi PK → sajikan tabel perbandingan.

**Deliverable Gate 7:** Konfirmasi numerik bahwa LKE utuh. Gate.

---

## Gate 8 — Area of Improvement + Laporan Ringkas

**Output:** File terpisah di folder penugasan (JANGAN tambah sheet ke LKE).

1. `AoI-catatan-tindak-lanjut.md` — daftar subunsur dengan skor PK ≤ 3, per komponen, disertai rekomendasi perbaikan terukur.
2. Ringkasan eksekutif 1 halaman:
   - Tingkat Maturitas versi PM: Level X — [Nama]
   - Tingkat Maturitas versi PK: Level Y — [Nama]
   - 5 kelemahan utama
   - 3 area sudah baik (apresiasi)
3. Siap untuk diolah menjadi LHE di Task 04.

**Deliverable:** AoI + ringkasan. Penugasan evaluasi SPIP selesai.

---

## Format Jawaban Auditor per Gate

```
LANJUT    — tidak ada koreksi, lanjut ke gate berikutnya
KOREKSI   — ada revisi, sebutkan subunsur/satker + arahan perbaikan
ULANG     — gate harus diulang dari awal (mis. bukti dukung baru ditemukan)
```

Claude harus menunggu salah satu dari 3 respons di atas sebelum lanjut.

---

## Resume Checkpoint

Jika sesi terputus, Claude membaca `penilaian-progress.json` dan melanjutkan dari gate berikutnya setelah gate terakhir yang statusnya "LANJUT".

```json
{
  "penugasan": "SPIP-2026-Kemenkomdigi",
  "gate_0": {"status": "LANJUT", "tanggal": "2026-04-15", "jawaban": {...}},
  "gate_1": {"status": "LANJUT", "tanggal": "2026-04-16", "ringkasan": "..."},
  "gate_2": {"status": "KOREKSI", "tanggal": "2026-04-17", "catatan": "revisi 1.3 subunsur 2"},
  "gate_2_revisi": {"status": "LANJUT", "tanggal": "2026-04-17"},
  "gate_3": null
}
```
