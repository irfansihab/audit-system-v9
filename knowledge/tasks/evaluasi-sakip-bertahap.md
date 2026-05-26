# Task — Evaluasi SAKIP Bertahap (Gate-Based)

> **Model**: `claude-sonnet-4-6` untuk skoring/narasi + `claude-haiku-4-5` untuk klasifikasi file.
> **Skill induk**: `evaluasi-sakip` (lihat `skills/evaluasi-sakip/SKILL.md`).
> **Output**: `LKE-SAKIP-[obyek]-[tahun].xlsx` + `AoI-SAKIP-[tahun].md` + `penilaian-progress.json` + `LHE-SAKIP-[obyek]-[tahun].docx`.
> **Dasar**: Permenpan RB 88/2021 tentang Evaluasi AKIP.

Alur evaluasi SAKIP dipecah menjadi **7 gate berurutan** mengikuti pola SPIP bertahap. Setiap gate WAJIB mendapat konfirmasi eksplisit auditor (**LANJUT / KOREKSI / ULANG**). Progress dicatat di `penilaian-progress.json` agar resume-able.

---

## Prinsip Umum (sama dengan SPIP bertahap)

1. **Satu gate = satu komponen** (atau satu sub-komponen berat) — hindari batch besar.
2. **Isi LKE langsung per gate** — jangan akumulasi di memori, langsung tulis ke Excel.
3. **Generate AoI per gate (WAJIB)** — update `AoI-SAKIP-[tahun].md` setelah LKE terisi.
4. **Ringkas temuan tiap gate** dalam 3 baris: apa yang dinilai, skor akhir, hal yang perlu perhatian auditor.
5. **Auditor memegang kendali**: LANJUT → gate berikut; KOREKSI → revisi di gate sama; ULANG → ulang dari nol.
6. **Log progress**:
   ```json
   {"gate": 2, "status": "LANJUT", "tanggal": "...", "skor_komponen": 18.5, "max": 25, "aoi_ids": ["SK-01","SK-02"]}
   ```

## Tooling v4.0.4 (hemat eksekusi)

- **Audit trail batch**: di setiap gate, log multi-event sekaligus dengan `audit_trail.py log-batch --events '[...]'` (TASK_STARTED, FILE_GENERATED LKE, GATE_PASSED).
- **LHE Generation** (akhir gate 7): pakai `scripts/render_lhp.py --penugasan ... --rekomendasi-file ...` dengan `templates/_skeleton-lhp/template-lhp-evaluasi-sakip.docx`. Untuk konten skoring per komponen, isi `--gambaran-umum` dengan ringkasan 4 komponen + skor.
- **Preflight QC SAIPI** setelah Gate 0: `python3 scripts/qc_saipi.py --penugasan ... --preflight-context` agar gap context.md ketahuan sebelum Gate 1.
- **QA placeholder** di Gate 0: `python3 scripts/init_qa_artifacts.py --penugasan ...` skeleton-kan deklarasi independensi + jawaban needs-review.

---

## 7 Gate Evaluasi SAKIP

```
Gate 0 — Konfirmasi Awal (5 pertanyaan wajib)
Gate 1 — Komponen Perencanaan Kinerja (bobot 30%)
Gate 2 — Komponen Pengukuran Kinerja (bobot 30%)
Gate 3 — Komponen Pelaporan Kinerja (bobot 15%)
Gate 4 — Komponen Evaluasi Akuntabilitas Kinerja Internal (bobot 25%)
Gate 5 — Verifikasi skoring + agregator LKE
Gate 6 — AoI Final + Rekomendasi + Draft LHE
```

### Gate 0 — Konfirmasi Awal (5 pertanyaan WAJIB)

Sebelum isi LKE, tanya auditor:

1. **Obyek evaluasi**: kementerian/ditjen/satker spesifik mana?
2. **Tahun evaluasi**: tahun kinerja yang dinilai (biasanya t-1)?
3. **Cakupan dokumen**: PK, Renstra, LAKIP, data realisasi IK — sudah tersedia semua?
4. **Metode bukti**: wawancara dilakukan? observasi lapangan? atau desk review saja?
5. **Hasil evaluasi sebelumnya**: ada LHE tahun lalu untuk dibandingkan?

Default jika auditor tidak spesifikasi:
- Cakupan: 4 Ditjen Kemkomdigi + 1 Badan (BAKTI sebagai BLU — framework pembanding terpisah)
- Metode: desk review + konfirmasi tertulis
- Banding: ya, tarik dari LHE t-2

### Gate 1 — Perencanaan Kinerja (bobot 30%)

Sub-komponen yang dinilai (merujuk Permenpan RB 88/2021):
- Renstra (kualitas dokumen, keselarasan dengan RPJMN, logframe)
- Perjanjian Kinerja (IK yang SMART, target yang rasional, cascading ke unit)
- Rencana Kinerja Tahunan

**Teknik**:
- Baca dokumen per obyek (lihat `references/01-kriteria-lke-permen88-2021.md`)
- Isi LKE sub-komponen 1a, 1b, 1c
- Setiap penilaian rendah → buat AoI dengan kode **AoI-SK-[nomor]** (SK = SAKIP)

**Stop & tanya**: rata-rata skor sub-komponen 1 + list AoI → LANJUT/KOREKSI/ULANG.

### Gate 2 — Pengukuran Kinerja (bobot 30%)

Sub-komponen:
- Sistem pengukuran (proses, timing, tools)
- Kualitas IK (SMART, reliable, valid)
- Realisasi vs target (akurat, terdokumentasi, dapat diverifikasi)

**Fokus AoI tipikal**:
- IK yang berubah mid-year tanpa revisi PK resmi
- Target yang terlalu mudah tercapai (cenderung >100% semua)
- Sumber data IK tidak clear (aplikasi apa, siapa yang input)

### Gate 3 — Pelaporan Kinerja (bobot 15%)

Sub-komponen:
- Ketepatan waktu LAKIP
- Struktur dan substansi LAKIP (Permenpan RB 53/2014 jo. 88/2021)
- Pemanfaatan LAKIP untuk perbaikan kinerja

### Gate 4 — Evaluasi Akuntabilitas Kinerja Internal (bobot 25%)

Sub-komponen:
- Pemantauan internal oleh APIP
- Evaluasi mandiri unit
- Tindak lanjut rekomendasi evaluasi sebelumnya

**Koneksi dengan data lain**: cek folder `penugasan/SPIP/` dan `penugasan/pemantauan-tindak-lanjut/` untuk data pelengkap.

### Gate 5 — Verifikasi Skoring + Agregator LKE

- Hitung ulang total skor: Σ (skor sub × bobot) = skor akhir 0–100
- Konversi ke kategori: AA (>90), A (80–90), BB (70–80), B (60–70), CC (50–60), C (30–50), D (<30)
- Verifikasi formula LKE tidak tertimpa (mirror prinsip `fill_lke_safely.py`)

### Gate 6 — AoI Final + Rekomendasi + Draft LHE

- Konsolidasi seluruh AoI dari Gate 1–4 ke `AoI-SAKIP-[tahun].md`
- Draft bagian **Rekomendasi** di LHE berbasis AoI dengan prioritas tinggi
- Draft bagian **Simpulan** dengan bahasa keyakinan terbatas:
  > "Berdasarkan prosedur evaluasi yang kami laksanakan, penerapan SAKIP [obyek] memperoleh skor [nilai] dengan kategori [X]. Terdapat [n] Area of Improvement yang perlu perhatian manajemen, sebagai berikut: ..."
- Auditor review draft LHE → SETUJU → lanjut ke finalisasi manual (nomor surat, ND pengantar, TTD).

---

## Kode AoI

- **SK** = SAKIP secara umum (Gate 1–4)
- **SK-PR** = Perencanaan Kinerja (Gate 1)
- **SK-PG** = Pengukuran Kinerja (Gate 2)
- **SK-PL** = Pelaporan Kinerja (Gate 3)
- **SK-AI** = Akuntabilitas Internal (Gate 4)

Contoh: `AoI-SK-PR-03` = AoI ketiga di komponen Perencanaan Kinerja.

---

## File Terkait

- `skills/evaluasi-sakip/SKILL.md` — definisi skill
- `skills/evaluasi-sakip/references/01-kriteria-lke-permen88-2021.md` — kriteria per sub-komponen
- `skills/evaluasi-sakip/references/02-template-lhe.md` — template LHE SAKIP
- `templates/Laporan Hasil Evaluasi SAKIP.docx` — template Word final
- `checklists/evaluasi-sakip.md` — checklist dokumen yang diminta

---

## Status Adopsi (per 19 April 2026)

⬜ Template gate-based ini baru kerangka. Perlu piloting di 1 penugasan SAKIP Kemkomdigi 2026 untuk validasi durasi per gate, kalibrasi skoring, dan refinement format AoI. Setelah piloting, update bagian "Teknik" di tiap gate dengan insight konkret.
