# Task — Evaluasi Reformasi Birokrasi Bertahap (Gate-Based)

> **Model**: `claude-sonnet-4-6` untuk skoring/narasi + `claude-haiku-4-5` untuk klasifikasi file.
> **Skill induk**: `evaluasi-reformasi-birokrasi` (lihat `skills/evaluasi-reformasi-birokrasi/SKILL.md`).
> **Output**: `LKE-RB-[tahun]-[triwulan].xlsx` + `AoI-RB-[tahun].md` + `penilaian-progress.json` + `LHE-RB-[obyek]-[tahun].docx`.
> **Dasar**: PermenPAN RB 9/2023 jo. KepMenPAN 182/2024 jo. SE MenPAN RB 6/2025 (RB Transisi).

Alur evaluasi RB dipecah menjadi **9 gate berurutan**. Karena RB memiliki 2 dimensi utama (Pemenuhan + Reform) × beberapa komponen, gate disusun per dimensi × fase untuk menjaga fokus.

---

## Prinsip Umum

Sama dengan SPIP/SAKIP bertahap:

1. Satu gate = satu dimensi-komponen (atau satu fase triwulan).
2. Isi LKE langsung, jangan akumulasi di memori.
3. Generate AoI per gate, terakumulasi ke `AoI-RB-[tahun].md`.
4. Ringkasan 3 baris + LANJUT/KOREKSI/ULANG.
5. Log progress JSON.

## Tooling v4.0.4 (hemat eksekusi)

- **Audit trail batch**: pakai `audit_trail.py log-batch --events '[...]'` untuk log multi-event per gate. Hindari chain `log-event` x N.
- **LHE Generation** (akhir gate 9): pakai `scripts/render_lhp.py --penugasan ... --rekomendasi-file ...` dengan template `templates/_skeleton-lhp/template-lhp-evaluasi-reformasi-birokrasi.docx`. Kalau struktur LHE RB butuh section khusus (mis. AoI per komponen), fallback ke skeleton + edit manual sesuai pattern.
- **QC SAIPI preflight**: setelah gate 1 (Konfirmasi & Kelengkapan), jalankan `python3 scripts/qc_saipi.py --penugasan ... --preflight-context` supaya gap `context.md` (Tujuan, Ruang Lingkup) ketahuan dini.
- **QA placeholder**: di gate 1, panggil `python3 scripts/init_qa_artifacts.py --penugasan ...` agar `_QA-SAIPI/deklarasi-independensi.md` + `jawaban-needs-review.md` + `justifikasi.md` ter-skeleton sebelum QC SAIPI di gate akhir.

---

## 9 Gate Evaluasi RB

```
Gate 0 — Konfirmasi Awal (6 pertanyaan)
Gate 1 — Dimensi Pemenuhan: Manajemen Perubahan
Gate 2 — Dimensi Pemenuhan: Penguatan Sistem dan Prosedur
Gate 3 — Dimensi Pemenuhan: Kapabilitas SDM + Pelayanan Publik
Gate 4 — Dimensi Reform: Sasaran RB (pengungkit)
Gate 5 — Dimensi Reform: Outcome (hasil nyata)
Gate 6 — Triwulan ke-N (progress per triwulan berjalan)
Gate 7 — Verifikasi skoring + agregator LKE
Gate 8 — AoI Final + Rekomendasi + Draft LHE
```

> **Catatan 2025 — RB Transisi**: SE MenPAN RB 6/2025 mengatur fase transisi — beberapa komponen penilaian berbeda untuk tahun 2025-2026. Baca `references/03-se-menpanrb-6-2025-rb-transisi.md` sebelum mulai.

### Gate 0 — Konfirmasi Awal (6 pertanyaan WAJIB)

1. **Obyek evaluasi**: kementerian/unit kerja spesifik?
2. **Tahun + triwulan**: evaluasi sampai triwulan berapa?
3. **Regulasi yang dipakai**: PermenPAN 9/2023 + juknis 182/2024 + SE 6/2025 (default) atau kondisi khusus?
4. **Cakupan dokumen**: LKE PMPRB self-assessment sudah diisi manajemen? Jika ya, apakah direplikasi atau di-independent-assess ulang?
5. **Evaluasi PMPRB mandiri vs PE eksternal**: posisi auditor sebagai APIP internal (PMPRB) atau tim PE eksternal MenPAN RB?
6. **Rencana LHE**: laporan triwulan atau tahunan?

Default:
- Regulasi: PermenPAN 9/2023 + 182/2024 + 6/2025
- Posisi: PMPRB mandiri oleh Itjen Kemkomdigi
- Cakupan: review ulang LKE self-assessment dengan bukti dukung

### Gate 1 — Manajemen Perubahan

Komponen penilaian (Pemenuhan):
- Tim Kerja RB (SK, rapat, rencana kerja)
- Road Map RB (keselarasan dengan RPJMN, revisi tahunan)
- Monev pelaksanaan RB
- Perubahan pola pikir & budaya kerja (agen perubahan, internalisasi)

### Gate 2 — Penguatan Sistem dan Prosedur

Komponen:
- Penataan peraturan perundang-undangan
- Penataan organisasi (right-sizing, eliminasi tumpang tindih)
- Penataan tata laksana (SOP, bisnis proses, e-government)
- Sistem informasi (SPBE maturity)

### Gate 3 — Kapabilitas SDM + Pelayanan Publik

SDM:
- Perencanaan SDM (Anjab, ABK)
- Rekrutmen, seleksi, penempatan
- Diklat & sertifikasi
- Manajemen kinerja SDM

Pelayanan Publik:
- Standar pelayanan (ada, lengkap, dipublikasikan)
- Budaya pelayanan prima
- Pengelolaan pengaduan
- Penilaian kepuasan

### Gate 4 — Dimensi Reform: Sasaran RB (Pengungkit)

Evaluasi outcome pengungkit berdasarkan SE 6/2025:
- Birokrasi yang akuntabel
- Birokrasi yang efektif dan efisien
- Pelayanan publik yang prima

### Gate 5 — Dimensi Reform: Outcome Hasil Nyata

- Survey kepuasan masyarakat (IKM)
- Indeks Reformasi Birokrasi (nilai akhir)
- Indikator capaian publik yang terukur dari program prioritas

### Gate 6 — Triwulan Berjalan

Jika evaluasi dilakukan setiap triwulan:
- Update LKE triwulan
- Identifikasi *delta* dari triwulan sebelumnya
- Highlight komponen yang stagnan / memburuk

### Gate 7 — Verifikasi Skoring + Agregator LKE

- Pemenuhan (bobot 60%) + Reform (bobot 40%) = skor RB
- Kategori: AA (>90), A (80–90), BB (70–80), B (60–70), CC (50–60), C (30–50), D (<30)
- Verifikasi formula LKE tidak tertimpa

### Gate 8 — AoI Final + Rekomendasi + Draft LHE

- Konsolidasi AoI lintas gate
- Rekomendasi prioritas tinggi untuk PMPRB periode berikutnya
- Draft LHE bahasa keyakinan terbatas

---

## Kode AoI

- **RB-MC** = Manajemen Perubahan (Gate 1)
- **RB-PS** = Penguatan Sistem/Prosedur (Gate 2)
- **RB-SD** = SDM (Gate 3)
- **RB-PP** = Pelayanan Publik (Gate 3)
- **RB-SR** = Sasaran Reform (Gate 4)
- **RB-OR** = Outcome Reform (Gate 5)

Contoh: `AoI-RB-MC-02` = AoI kedua di Manajemen Perubahan.

---

## Bahasa Keyakinan LHE

Paradigma = keyakinan terbatas. Frasa baku:

> "Berdasarkan prosedur evaluasi PMPRB yang kami laksanakan sesuai PermenPAN RB 9/2023 jo. KepMenPAN 182/2024, tidak terdapat hal-hal yang membuat kami yakin bahwa implementasi Reformasi Birokrasi [obyek] tidak sesuai dengan kebijakan yang berlaku, kecuali untuk Area of Improvement sebagai berikut: ..."

---

## Status Adopsi (per 19 April 2026)

⬜ Template gate-based ini baru kerangka. Perlu piloting di 1 penugasan RB Kemkomdigi 2026 (Triwulan 1) untuk kalibrasi durasi per gate dan refinement format AoI per komponen.
