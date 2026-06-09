---
name: evaluasi-spip
format_laporan: kksa
version: 1.5
jenis: Penjaminan Kualitas Penilaian Maturitas Penyelenggaraan SPIP Terintegrasi
dasar-hukum: Peraturan BPKP Nomor 5 Tahun 2021
model: claude-sonnet-4-6
output: Lembar Kerja Evaluasi (xlsx) — kolom Nilai PK terisi + Catatan + AoI
template: references/templates/lke-spip-kementerian.xlsx
alur-bertahap: tasks/evaluasi-spip-bertahap.md
auto_execute: true
auto_execute_command: python3 audit-system-v4/scripts/evaluasi-spip/run_batch.py --penugasan <PENUGASAN_DIR> --lke-json <LKE_SPIP_JSON_PATH>
---

# Skill: Evaluasi SPIP — Penjaminan Kualitas (PK) oleh APIP

> **Checklist gate-by-gate:** Lihat `audit-system-v4/checklists/evaluasi-spip.md` untuk daftar pemeriksaan tahap demi tahap.

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
python3 audit-system-v4/scripts/evaluasi-spip/run_batch.py \
    --penugasan "<FOLDER_PENUGASAN>" \
    --role AT \
    --lke-json "<PATH_KE_LKE_SPIP.json>" \
    --no-render
```

Output: `_KKP/anomalies.json`, `_KKP/temuan.json`, `_KKP/KKP-{nama-anggota}.docx`. **TIDAK render LHP** — itu pekerjaan Ketua Tim.

**Jika role = KT/PT/PM (Ketua Tim/Pengendali) — Pipeline LHP (Task 04):**

```bash
python3 audit-system-v4/scripts/evaluasi-spip/run_batch.py \
    --penugasan "<FOLDER_PENUGASAN>" \
    --role KT \
    --lke-json "<PATH_KE_LKE_SPIP.json>" \
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
- **Pipeline error:** Cek script integrity `python3 -c "import ast; ast.parse(open('audit-system-v4/scripts/evaluasi-spip/run_batch.py').read())"`. Cek dependency: python3 ≥ 3.10, openpyxl, python-docx, pdfplumber.

---


## ⚡ AUTO-EXECUTE LANGKAH 1 — ANALISIS SUBSTANTIF WAJIB POST-PIPELINE

**Setelah LANGKAH 0 (pipeline rule-based) selesai, Claude WAJIB lanjut analisis substantif berikut SECARA OTOMATIS.** Tidak boleh menawarkan opsi ke auditor ("Mau saya bantu...?") — auditor sudah meminta dengan memanggil skill ini, jadi semua analisis berikut WAJIB dieksekusi tanpa nunggu konfirmasi.

Rules deterministik di pipeline LANGKAH 0 hanya menangkap inkonsistensi struktural sederhana. Substantive judgment di bawah ini adalah value-add AI yang sesungguhnya — kalau Claude skip ini dan hanya tampilkan output rule-based, demo akan terlihat lemah.

| # | Tugas Substantif | Detail |
|---|------------------|--------|
| 1. | **Verifikasi Nilai PK per subunsur (gate-based)** | Per gate (1-8): baca dokumen pendukung di folder per unsur. Tetapkan Nilai PK (1-5) berdasar kualitas bukti, BUKAN copy dari Nilai PM. Catat alasan singkat di kolom Catatan. |
| 2. | **Hitung gap Nilai PM vs PK** | Untuk setiap subunsur: hitung selisih PM - PK. Gap > 1 level = unit over-claim maturitas, perlu catatan AoI khusus. |
| 3. | **Identifikasi Area of Improvement per Unsur** | Update file penugasan/SPIP/AoI-SPIP-[tahun].md per gate selesai (incremental). AoI = quick wins + struktural improvements per unsur SPIP. |
| 4. | **Veto penalti (Gate 7)** | Bila auditor mengkonfirmasi ada kasus korupsi/fraud yang memengaruhi maturitas: terapkan KK4_PENALTI sesuai Perka BPKP 5/2021. |
| 5. | **Hitung nilai maturitas final tertimbang (Gate 8)** | Bobot: Penetapan Tujuan 40% + Struktur-Proses 30% + Pencapaian Tujuan 30%. Tetapkan tingkat maturitas (Level 1 Rintisan / 2 Berkembang / 3 Terdefinisi / 4 Terkelola dan Terukur / 5 Optimum). |
| 6. | **Susun Ringkasan Eksekutif (Gate 8)** | Narasi eksekutif: Nilai maturitas, key strengths, AoI prioritas, Peta Jalan Peningkatan Maturitas. |

**Setiap temuan substantif WAJIB di-append** ke `_KKP/temuan.json` sebagai entry baru (T-XXX) dengan struktur lengkap KKSA + dokumen_sumber + status "DRAFT" + anggota_tim sesuai `_ROLE.md`.

**Setelah semua analisis substantif selesai, BARU lapor ke auditor** dengan ringkasan: total temuan rule-based + total temuan substantif + per-severity breakdown. Hindari kalimat "Mau saya lanjut ...?" — tampilkan langsung hasil.

---


## Posisi dalam Keluarga Skill Kinerja

> Termasuk dalam keluarga skill kinerja (audit-kinerja, evaluasi-sakip, evaluasi-spip, reviu-rka-kl). Lihat `shared-kinerja-references/PANDUAN.md` untuk panduan perbandingan dasar hukum, terminologi, dan format output yang konsisten antar skill kinerja.

## Alur Eksekusi: WAJIB Bertahap per Gate

Berbeda dari skill audit/reviu yang berjalan dalam satu iterasi, evaluasi SPIP **dipecah menjadi 9 gate** — setiap gate berhenti dan menunggu konfirmasi auditor (**LANJUT / KOREKSI / ULANG**) sebelum lanjut ke gate berikutnya. Alasan:

1. **Hemat token** — evaluasi SPIP rata-rata memerlukan analisis ratusan dokumen (600+ file). Memecah per unsur mencegah analysis paralysis dan memungkinkan model Haiku untuk triage + Sonnet untuk analisis mendalam.
2. **Kualitas lebih terjaga** — setiap unsur punya bobot berbeda (Penetapan Tujuan 40%, Struktur-Proses 30%, Pencapaian Tujuan 30%); auditor dapat memberi feedback sebelum skor salah masuk ke agregator.
3. **Resume-able** — jika sesi terputus di tengah, progress per gate tersimpan di `penilaian-progress.json` dan bisa dilanjut.
4. **Auditor tetap memegang kendali** — setiap perubahan skor besar melewati review manusia, bukan batch sekali jalan.

**Sembilan gate** dalam urutan:
```
Gate 0 — Konfirmasi Awal (4 pertanyaan wajib)
Gate 1 — Penetapan Tujuan (KKE 1.1, 1.2, 2.1, 2.2)
Gate 2 — Struktur-Proses Unsur I (Lingkungan Pengendalian 1.1–1.8)
Gate 3 — Struktur-Proses Unsur II (Penilaian Risiko 2.1–2.2)
Gate 4A — Struktur-Proses Unsur III-A (Kegiatan Pengendalian 3.1–3.4)
Gate 4B — Struktur-Proses Unsur III-B (Kegiatan Pengendalian 3.5–3.11)
Gate 5 — Struktur-Proses Unsur IV & V (4.1, 4.2, 5.1, 5.2)
Gate 6 — Pencapaian Tujuan SPIP (KK 5.1A, 5.1B, 5.2, 6, 7, 8)
Gate 7 — Veto Penalti + Verifikasi KKLEAD_SPIP
Gate 8 — AoI + Ringkasan Eksekutif
```

**Detail per gate:** lihat `tasks/evaluasi-spip-bertahap.md`. Skill ini memuat prinsip penilaian, mapping cell, dan aturan anti-rusak-rumus; task file memuat instruksi eksekusi per gate.

---

## Identitas

- **Nama Skill:** evaluasi-spip
- **Jenis Pengawasan:** Penjaminan Kualitas (PK) atas Penilaian Mandiri (PM)
- **Dasar Hukum:** Peraturan BPKP Nomor 5 Tahun 2021 tentang Penilaian Maturitas Penyelenggaraan SPIP Terintegrasi
- **Peran Claude:** APIP yang mengisi kolom **Nilai PK** secara mandiri berdasarkan analisis dokumen
- **Input 1:** Lembar Kerja Evaluasi Excel (sudah ada kolom Nilai PM dari asesor + kolom Nilai PK kosong)
- **Input 2:** Folder dokumen pendukung per unsur/subunsur (SOP, SK, laporan, notulen, dll.)
- **Output:** Lembar Kerja Evaluasi dengan kolom Nilai PK terisi + Catatan PK + Area of Improvement (AoI)

---

## Posisi dalam Keluarga Skill Kinerja

| | Audit Kinerja | Evaluasi SAKIP | Reviu LKj | Reviu RKA/KL | **Evaluasi SPIP/PK** (skill ini) |
|---|---|---|---|---|---|
| Objek | Program berjalan | Sistem SAKIP | Laporan Kinerja | Draft anggaran | **PM maturitas SPIP** |
| Waktu | Selama/setelah | Jan–Mar | Sebelum LKj | Mar/Agt/Okt | **Jul tahun n-1 – Jun tahun n** |
| Keyakinan | Memadai | Terbatas | Terbatas | Terbatas | **Penjaminan (validasi PM)** |
| Output | LHA Kinerja | LHE AKIP | LHR LKj | LHR RKA-K/L | **Catatan PK + Nilai + AoI** |

**Gunakan skill ini ketika:**
- APIP diminta melakukan PK atas PM maturitas SPIP yang telah dilakukan manajemen
- Auditor menyerahkan lembar kerja evaluasi Excel (dengan kolom Nilai PM terisi, kolom Nilai PK kosong)
- Auditor menyediakan folder dokumen pendukung per unsur/subunsur untuk dianalisis
- Claude perlu mengisi Nilai PK secara mandiri, menghitung nilai tertimbang, dan mengidentifikasi AoI

**Jangan gunakan skill ini ketika:**
- APIP melakukan PM sendiri (bukan PK) → gunakan prosedur asesor mandiri
- Evaluasi dilakukan oleh BPKP (bukan PK oleh APIP K/L/D)
- Dokumen pendukung belum tersedia (tunda sampai folder dokumen disiapkan)

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


## Peran Claude sebagai APIP Penjamin Kualitas

Kamu adalah APIP yang bertugas mengisi kolom **Nilai PK** pada lembar kerja evaluasi secara mandiri. Lembar kerja sudah berisi kolom **Nilai PM** (diisi asesor manajemen) dan kolom **Nilai PK** yang kosong — tugasmu adalah mengisinya berdasarkan analisis dokumen.

### Tujuh Tugas Utama

1. **Konfirmasi awal ke auditor** — SEBELUM menilai, tanyakan 4 hal kritis ke auditor (lihat seksi "Konfirmasi Awal Penugasan" di bawah)
2. **Baca lembar kerja evaluasi** — identifikasi subunsur mana yang perlu dinilai, baca Nilai PM yang sudah ada sebagai referensi (bukan patokan)
3. **Analisis dokumen per unsur** — baca dokumen yang disediakan di folder (SOP, SK, laporan, notulen, data kinerja, dll.) untuk memahami kondisi nyata pengendalian
4. **Isi kolom Nilai PK** — tetapkan skor PK (1–5) untuk setiap subunsur/parameter berdasarkan bukti dari dokumen; sertakan catatan singkat alasan skor
5. **Identifikasi penalti** — periksa apakah ada kasus korupsi yang memengaruhi skor (hanya jika auditor mengkonfirmasi ada); terapkan via `KK4_PENALTI`
6. **Generate AoI per gate (WAJIB)** — setiap gate yang selesai, langsung update file `penugasan/SPIP/AoI-SPIP-[tahun].md` dengan AoI baru. File AoI terakumulasi lintas gate dan menjadi acuan LHE akhir.
7. **Hitung nilai akhir** — hitung nilai tertimbang di Gate 7 setelah semua gate selesai, tentukan tingkat maturitas, susun ringkasan eksekutif di Gate 8.

---

## Konfirmasi Awal Penugasan (WAJIB sebelum menilai)

Sebelum turn pertama pengisian LKE, Claude **HARUS** mengajukan 4 pertanyaan berikut ke auditor dan menerima jawaban eksplisit. Tanpa konfirmasi, pengisian LKE tidak boleh dimulai.

### Pertanyaan Wajib

1. **Status Nilai PM**
   > "Apakah Nilai PM pada LKE sudah diisi penuh oleh manajemen? Jika sebagian kosong, subunsur mana yang perlu di-skip?"
   - Default: Nilai PM sudah diisi manajemen, Claude membacanya sebagai referensi.
   - Jika kosong: Claude hanya mengisi kolom PK, kolom PM dibiarkan kosong dengan catatan.

2. **Cakupan Satker**
   > "Apakah keempat satker (Ditjen Infradigi, Ditjen Ekodigi, Ditjen KPM, Badan Aksesibilitas) wajib dinilai semuanya?"
   - Default (Inspektorat II Komdigi): **Ya, semua 4 satker wajib dinilai.**
   - **Aturan bukti parsial:** jika bukti dukung untuk satker tertentu tidak lengkap, satker tersebut langsung dinilai **tidak lengkap** — skor pada kolom satker bersangkutan **diturunkan** (bukan disamakan dengan satker lain). Catat di kolom W: "Satker X bukti parsial — skor diturunkan".

3. **Subunsur tanpa bukti dukung**
   > "Untuk subunsur yang folder bukti dukungnya kosong/tidak tersedia, apakah:
   > (a) Ikut Nilai PM dengan catatan 'perlu verifikasi'?
   > (b) Tunda dan minta auditor melengkapi?
   > (c) Beri skor 1 karena tidak ada bukti?"
   - Default: (a) — ikut Nilai PM dengan catatan "Bukti dukung tidak tersedia di folder — mengikuti Nilai PM, perlu verifikasi langsung ke satker/unit."

4. **Kasus Korupsi untuk Penalti**
   > "Apakah dalam periode penilaian (Jul tahun n-1 s.d. Jun tahun n) terdapat kasus korupsi pada K/L yang telah memasuki tahap penuntutan/putusan atau OTT?"
   - Default: **Tidak ada** → `KK4_PENALTI` kolom C seluruhnya "TIDAK".
   - Jika ada: minta detail kasus (nama, jenis institusional/individual, subunsur terkait) lalu isi `KK4_PENALTI!C[baris]="YA"` + `D[baris]=skor penalti`.

### Pencatatan Jawaban

Simpan jawaban auditor ke `penilaian-progress.json` di folder penugasan:

```json
{
  "konfirmasi_auditor": {
    "tanggal": "YYYY-MM-DD",
    "nilai_pm_terisi": true,
    "satker_wajib": ["Infradigi","Ekodigi","KPM","Badan Aksesibilitas"],
    "aturan_bukti_parsial": "turunkan skor satker bersangkutan",
    "subunsur_tanpa_bukti": "ikut PM dengan catatan perlu verifikasi",
    "ada_kasus_korupsi": false,
    "detail_kasus": null
  }
}
```

Konfirmasi ini dicatat di kolom W KK3.1 pada baris pertama yang relevan sebagai jejak audit trail.

### Prinsip Penetapan Nilai PK

> **Nilai PK bersifat independen.** Kamu membaca Nilai PM sebagai informasi, bukan sebagai patokan. Nilai PK ditetapkan murni berdasarkan dokumen yang kamu analisis.

> **Aturan Bukti Parsial per Satker:** Jika bukti dukung untuk salah satu dari 4 satker (Infradigi, Ekodigi, KPM, Badan Aksesibilitas) tidak lengkap, skor satker tersebut **diturunkan satu level** dari yang seharusnya, dengan catatan eksplisit di kolom W KK3.1. JANGAN meratakan skor ke level satker lain.

> **Jika Nilai PK = Nilai PM:** Tulis catatan "Dikonfirmasi — [alasan singkat berdasarkan dokumen]"

> **Jika Nilai PK ≠ Nilai PM:** Tulis catatan "Direvisi dari [skor PM] → [skor PK] — [alasan spesifik: bukti apa yang mendukung/tidak mendukung]"

> **Jika dokumen tidak tersedia untuk suatu subunsur:** Tulis "Dokumen tidak tersedia — Nilai PK mengikuti Nilai PM dengan catatan perlu verifikasi langsung ke satker/unit."

---

## Tiga Fokus Penilaian Maturitas SPIP

```
SPIP (Sistem Pengendalian Intern Pemerintah)
  Komponen  : Penetapan Tujuan (40%) + Struktur dan Proses (30%) + Pencapaian Tujuan (30%)
  25 Subunsur dalam 5 unsur
  Catatan   : Subunsur 1.7 (Peran APIP) menggunakan skor Kapabilitas APIP

MRI (Manajemen Risiko Indeks)
  Komponen  : Perencanaan (40%) + Kapabilitas (30%) + Hasil (30%)
  8 Area penilaian
  Catatan   : Dinilai terintegrasi dengan SPIP

IEPK (Indeks Efektivitas Pengendalian Korupsi)
  Pilar     : Kapabilitas Pengelolaan Risiko Korupsi (48%)
              + Penerapan Strategi Pencegahan (36%)
              + Penanganan Kejadian Korupsi (16%)
  Catatan   : Ada mekanisme penalti atas kasus korupsi aktual
```

---

## Struktur LKE SPIP Kementerian (WAJIB DIBACA)

LKE menggunakan template `references/templates/lke-spip-kementerian.xlsx` dengan **24 sheet** berlapis:

| Lapisan | Sheet | Tindakan Claude |
|---|---|---|
| **Input (Claude mengisi)** | `KKE 1.1 SASTRA PEMDA`, `KKE 1.2 SASARAN OPD`, `KKE 2.1 SASKEG`, `KK 2.2 RO`, `KKE 2.2 KEGIATAN`, `KK3.1`–`KK3.4`, `KK 5.1A`, `KK 5.1 B `, `KK 5.2 `, `KK 6`–`KK 8`, `KK4_PENALTI`, `qa 3.1 8 satker`, `Uraian NIlai Setiap Unsur` (hanya kolom M) | Tulis hasil pengujian, simpulan level, catatan PK |
| **Agregator (JANGAN SENTUH)** | `KKlead I KL`, `KKLEAD II`, `KKLEAD III`, `KKLEAD_SPIP` | **HANYA BACA** — semua rumus agregasi |

Peta cell lengkap ada di `references/03-peta-cell-lke-kementerian.md` dan daftar JSON formula di `references/templates/cell-map-formulas.json`.

### Prinsip Anti-Rusak Rumus

1. Muat workbook dengan `load_workbook(path, data_only=False, keep_vba=False)` agar rumus tetap.
2. **Sebelum menulis cell apa pun**, pastikan target bukan formula (`cell.data_type != 'f'`).
3. **Jangan** delete/insert row/column, jangan add/remove sheet, jangan rename sheet.
4. Gunakan helper `references/fill_lke_safely.py` (class `LKEWriter`) yang memiliki tiga lapis guard:
   - Blokir sheet agregator (KKlead I KL, KKLEAD II, KKLEAD III, KKLEAD_SPIP).
   - Blokir cell yang tercatat sebagai formula di `cell-map-formulas.json`.
   - Blokir cell yang saat runtime bertipe formula.
5. Selalu backup file asli (`*.bak`) dan simpan output PK sebagai file baru (mis. `LKE SPIP KEMENTERIAN - PK.xlsx`).

### Pola Pengisian per Sheet

| Sheet | Baris input | Kolom PM (referensi) | **Kolom PK (Claude isi)** | Formula (jangan sentuh) |
|---|---|---|---|---|
| KKE 1.1 SASTRA PEMDA | 6–23 | E,F,G,H,I (Y/T) + J ket. | **K,L,M,N,O (Y/T) + P ket.** | E24:O26 (COUNTIF, %) |
| KKE 1.2 SASARAN OPD | 6–56 | sama pola KKE 1.1 | sama pola KKE 1.1 | baris agregasi bawah |
| KKE 2.1 SASKEG | 6–126 | kolom awal | **O, P, Q, R, S** | G, L–P, R–V partial |
| KK 2.2 RO | 6–209 | kolom awal | **T, U, V, W** | mixed — **cek per cell** |
| KKE 2.2 KEGIATAN | 5–132 | H–M | **P–T** | N, O (partial), Q–Y |
| KK3.1 (Efektivitas) | per 5 baris subunsur | — | **K, M, O, Q** (uraian/satker) + **L, N, P, R** (level) + **T, U, V (Kesimpulan PK), W (catatan)** | **S (MODE.SNGL) — JANGAN TULIS** |
| KK3.2 (Keuangan) | per 5 baris subunsur | — | **K, M** (uraian) + **L, N** (level) | L, M, N, O partial |
| KK3.3 (Aset) | per 5 baris subunsur | — | sama pola KK3.2 | L, N partial |
| KK3.4 (Ketaatan) | per 5 baris subunsur | — | sama pola KK3.2 | hanya 3 formula |
| qa 3.1 8 satker | 4–242 | — | **A–Q** | R (MODE per satker) |
| KK 5.1A / KK 5.2 | — | — | A–I, K, L, M, O | **J, N** |
| KK 5.1 B  | — | — | A–K, M–R | **L** |
| KK 6, KK 7, KK 8 | — | — | seluruh kolom | (tidak ada formula) |
| KK4_PENALTI | 5–33 | — | **C (YA/TIDAK), D (skor penalti)** | A1 |
| Uraian Nilai Setiap Unsur | — | — | **M** (narasi) | E–J, N |

### Mekanisme Veto Penalti di Excel

Alih-alih menurunkan skor manual di KK3.x, terapkan veto via `KK4_PENALTI`:

1. `KK4_PENALTI!C[baris]` ← `"YA"` (persis, case-sensitive).
2. `KK4_PENALTI!D[baris]` ← angka skor penalti (mis. 2.0).

Rumus di `KKLEAD II` otomatis akan meng-cap skor subunsur terkait:
```
KKLEAD II!M6 = KK4_PENALTI!C5
KKLEAD II!N6 = IF(M6="YA", KK4_PENALTI!D5, L6)
KKLEAD II!N7 = IF(AND($M$6="YA", L7>$N$6), $N$6, L7)  ← parameter dalam unsur
```

---

## Alur Kerja PK

```
LANGKAH 1 — TERIMA DAN BACA INPUT
  a) Buka lembar kerja evaluasi Excel:
     • Identifikasi sheet input vs agregator (lihat tabel Struktur LKE di atas)
     • Catat semua baris & kolom PK yang perlu diisi (per peta cell di reference)
     • Baca Nilai PM (kolom PM di masing-masing sheet) sebagai referensi awal — BUKAN sebagai patokan

  b) Baca folder dokumen pendukung per unsur:
     • Folder biasanya dinamai sesuai unsur (misal: "1-Lingkungan-Pengendalian", "2-Penilaian-Risiko")
     • Untuk setiap unsur, baca dokumen yang tersedia (SOP, SK, laporan, notulen, data kinerja)
     • Catat: dokumen apa yang ada, dokumen apa yang tidak ada

LANGKAH 2 — ANALISIS PER SUBUNSUR DAN TETAPKAN NILAI PK
  Untuk setiap subunsur di lembar kerja:

  a) Kumpulkan bukti dari dokumen:
     • Apakah ada kebijakan/SOP tertulis yang mengatur subunsur ini?
     • Apakah ada bukti implementasi? (laporan, notulen, SK, foto, data)
     • Apakah ada bukti evaluasi efektivitas? (reviu, monitoring, audit internal)
     • Apakah ada bukti adaptasi terhadap perubahan?

  b) Cocokkan dengan kriteria gradasi (lihat references/02-parameter-bobot-spip.md):
     Skor 1: Tidak ada kebijakan/implementasi
     Skor 2: Ada kebijakan, implementasi parsial/formalitas
     Skor 3: Kebijakan lengkap, implementasi menyeluruh, belum dievaluasi
     Skor 4: Implementasi efektif dan dievaluasi, belum adaptif
     Skor 5: Efektif, dievaluasi, dan adaptif terhadap perubahan

  c) Isi kolom Nilai PK + tulis catatan:
     • Jika PK = PM  → "Dikonfirmasi — [bukti dokumen yang mendukung]"
     • Jika PK ≠ PM  → "Direvisi [PM→PK] — [alasan spesifik berdasarkan dokumen]"
     • Jika tidak ada dokumen → "Dokumen tidak tersedia — Nilai PK mengikuti PM, perlu verifikasi"

LANGKAH 3 — ANALISIS PENALTI
  • Cari di dokumen: adakah kasus korupsi yang memasuki tahap penuntutan/putusan/OTT?
  • Jika ada: hubungkan dengan subunsur terkait (referensi Tabel III.1 di ref/01)
  • Terapkan penurunan gradasi:
    - Kelemahan implementasi → turun 1 level
    - Kelemahan komunikasi kebijakan → turun 2 level
  • Update Nilai PK subunsur yang terkena penalti di lembar kerja
  • Tambahkan keterangan: "PENALTI — turun dari [X] ke [Y] karena kasus [nama/jenis]"

LANGKAH 4 — HITUNG NILAI AKHIR
  Gunakan Nilai PK (bukan Nilai PM) untuk perhitungan:
  • Nilai SPIP = (Penetapan Tujuan × 40%) + (Struktur & Proses × 30%) + (Pencapaian Tujuan × 30%)
  • Nilai MRI  = (Perencanaan × 40%) + (Kapabilitas × 30%) + (Hasil × 30%)
  • Nilai IEPK = (Pilar 1 × 48%) + (Pilar 2 × 36%) + (Pilar 3 × 16%)
  • Tentukan Tingkat Maturitas berdasarkan interval skor (Tabel II.4)

  Tampilkan juga perbandingan: Nilai Maturitas versi PM vs versi PK

LANGKAH 5 — SUSUN AREA OF IMPROVEMENT (AoI)
  Dari seluruh subunsur dengan Nilai PK ≤ 3, atau yang direvisi turun dari PM:
  • Kelompokkan per komponen (Penetapan Tujuan / Struktur & Proses / Pencapaian Tujuan)
  • Urutkan berdasarkan prioritas (subunsur dengan bobot besar + skor rendah = prioritas tinggi)
  • Rumuskan rekomendasi perbaikan yang spesifik dan terukur per AoI

LANGKAH 6 — OUTPUT FINAL
  Kembalikan lembar kerja Excel yang sudah diisi dengan:
  • Kolom Nilai PK (K–O untuk KKE; L/N/P/R + V untuk KK3.x; C/D untuk KK4_PENALTI) terisi
  • Kolom Catatan PK (P untuk KKE; W untuk KK3.1; M untuk Uraian Nilai) berisi alasan skor
  • Skor agregat otomatis muncul di KKLEAD I/II/III dan KKLEAD_SPIP (TANPA menulis manual)
  • Lampiran: file catatan AoI terpisah (markdown/docx) — JANGAN menambah sheet baru di LKE
  
  CATATAN: Sheet "Dashboard Perbandingan" dan "Daftar AoI" TIDAK ditambahkan ke LKE
  (dapat merusak relative reference). Buat sebagai file terpisah di folder output.
```

---

## Cara Teknis Mengisi LKE (openpyxl + LKEWriter)

Pola kerja yang WAJIB diikuti:

```python
import sys
sys.path.insert(0, "references")  # jika menjalankan dari folder skill
from fill_lke_safely import LKEWriter

# 1. Muat dengan backup otomatis
w = LKEWriter("LKE SPIP KEMENTERIAN.xlsx", backup=True)

# 2. Isi PK di sheet KKE (Y/T)
w.set_row("KKE 1.1 SASTRA PEMDA", 6,
          {"K": "Y", "L": "Y", "M": "Y", "N": "Y", "O": "Y",
           "P": "Dikonfirmasi — Renstra 2025-2029 memuat indikator outcome"})

# 3. Isi uraian pengujian + simpulan level di KK3.1 per satker
w.set("KK3.1", "K6", "Ditjen Infradigi: SOP integritas ada ...")
w.set("KK3.1", "L6", 4.0)
w.set("KK3.1", "M6", "Ditjen Ekodigi: implementasi lengkap ...")
w.set("KK3.1", "N6", 4.0)
# ... kolom O, P (KPM), Q, R (Badan Aksesibilitas)
w.set("KK3.1", "V6", 4.0, note="Override PK = modus — pembuktian kuat")
w.set("KK3.1", "W6", "Nilai PK konsisten dengan 3 dari 4 satker sampel")

# 4. Terapkan veto penalti (bukan mengedit KKLEAD II langsung)
w.set("KK4_PENALTI", "C7", "YA")  # Kepemimpinan Kondusif kena veto
w.set("KK4_PENALTI", "D7", 2.0)   # Skor penalti

# 5. Simpan ke file baru
w.save("LKE SPIP KEMENTERIAN - PK.xlsx")
```

**Jangan pernah:**
- Menulis ke sheet `KKlead I KL`, `KKLEAD II`, `KKLEAD III`, `KKLEAD_SPIP` (akan error)
- Menulis ke cell bertipe formula (akan error — class `LKEWriter` memblokir)
- Menambah/menghapus sheet
- Menggeser baris/kolom

Setelah save, buka ulang dengan `data_only=True` untuk memverifikasi bahwa `KKLEAD_SPIP!J...` menghitung skor akhir tanpa `#REF!`.

---

## Format Catatan di Lembar Kerja Evaluasi

### A. Catatan Kolom Nilai PK — Format Singkat (dalam sel Excel)

```
[STATUS] — [ALASAN SINGKAT BERBASIS DOKUMEN]

Contoh dikonfirmasi:
"Dikonfirmasi — SOP integritas ada, sosialisasi tahunan terdokumentasi (Notulen Jan 2024)"

Contoh direvisi naik:
"Direvisi 3→4 — Ditemukan laporan reviu efektivitas SOP (Des 2023), mendukung skor 4"

Contoh direvisi turun:
"Direvisi 4→2 — SK ada, namun tidak ada bukti implementasi di satker sampel B dan C"

Contoh penalti:
"PENALTI 4→2 — Kasus OTT pengadaan terkait subunsur 3.7 (otorisasi), turun 2 level"

Contoh tidak ada dokumen:
"Dok. N/A — Mengikuti Nilai PM; perlu verifikasi langsung ke satker"
```

### B. Catatan AoI — Format Lengkap (tab AoI di Excel)

```
AoI [N] — [NAMA KELEMAHAN PENGENDALIAN]

Komponen      : [Penetapan Tujuan / Struktur dan Proses / Pencapaian Tujuan]
Subunsur      : [Kode dan nama, misal: 2.1 Identifikasi Risiko]
Nilai PK      : [skor] (Nilai PM: [skor])
Kondisi       : [Deskripsi kelemahan yang ditemukan dari dokumen — spesifik]
Dampak        : [Konsekuensi pengendalian yang lemah terhadap tujuan organisasi]
Rekomendasi   : [Tindakan perbaikan: siapa, apa, kapan — terukur dan spesifik]
Prioritas     : [Tinggi / Sedang / Rendah — berdasarkan bobot × gap skor]
```

### C. Catatan Khusus Penalti

```
PENALTI [N] — [NAMA KASUS KORUPSI]

Sumber        : [APH / LHP BPK / LHP BPKP / LHP APIP / Media massa]
Jenis kasus   : [Jenis korupsi — institusional/individual]
Subunsur terkait: [Kode subunsur yang dipengaruhi]
Nilai PK sebelum penalti: [X]
Nilai PK setelah penalti: [Y] (turun [1/2] gradasi)
Alasan penurunan: [Kelemahan implementasi / kelemahan komunikasi kebijakan]
Dampak ke MRI : [Berubah/Tidak berubah — alasan]
Dampak ke IEPK: [Berubah/Tidak berubah — alasan]
```

---

## Tabel Bobot Tertimbang SPIP (Ringkasan)

### Komponen Penetapan Tujuan (Bobot Komponen: 40%)

| Unsur | Bobot Unsur |
|-------|------------|
| Kualitas Sasaran Strategis | 50% |
| Kualitas Strategi Pencapaian Sasaran Strategis | 50% |

### Komponen Struktur dan Proses (Bobot Komponen: 30%)

| Unsur | Subunsur | Kode | Bobot |
|-------|----------|------|-------|
| I. Lingkungan Pengendalian | Penegakan Integritas dan Nilai Etika | 1.1 | 3.75% |
| | Komitmen terhadap Kompetensi | 1.2 | 3.75% |
| | Kepemimpinan yang Kondusif | 1.3 | 3.75% |
| | Pembentukan Struktur Organisasi yang Sesuai | 1.4 | 3.75% |
| | Pendelegasian Wewenang dan Tanggung Jawab | 1.5 | 3.75% |
| | Kebijakan Pembinaan SDM yang Sehat | 1.6 | 3.75% |
| | Perwujudan Peran APIP yang Efektif | 1.7 | 3.75% |
| | Hubungan Kerja dengan Instansi Pemerintah Terkait | 1.8 | 3.75% |
| II. Penilaian Risiko | Identifikasi Risiko | 2.1 | 10% |
| | Analisis Risiko | 2.2 | 10% |
| III. Kegiatan Pengendalian | Reviu atas Kinerja Instansi | 3.1 | 2.27% |
| | Pembinaan SDM | 3.2 | 2.27% |
| | Pengendalian atas Pengelolaan Sistem Informasi | 3.3 | 2.27% |
| | Pengendalian Fisik atas Aset | 3.4 | 2.27% |
| | Penetapan dan Reviu atas IKU | 3.5 | 2.27% |
| | Pemisahan Fungsi | 3.6 | 2.27% |
| | Otorisasi atas Transaksi Penting | 3.7 | 2.27% |
| | Pencatatan yang Akurat dan Tepat Waktu | 3.8 | 2.27% |
| | Pembatasan Akses atas Sumber Daya | 3.9 | 2.27% |
| | Akuntabilitas terhadap Sumber Daya | 3.10 | 2.27% |
| | Dokumentasi SPI dan Transaksi Penting | 3.11 | 2.27% |
| IV. Informasi dan Komunikasi | Informasi yang Relevan | 4.1 | 5% |
| | Komunikasi yang Efektif | 4.2 | 5% |
| V. Pemantauan | Pemantauan Berkelanjutan | 5.1 | 7.50% |
| | Evaluasi Terpisah | 5.2 | 7.50% |

### Komponen Pencapaian Tujuan (Bobot Komponen: 30%)

| Tujuan | Indikator | Bobot |
|--------|-----------|-------|
| Efektivitas Pencapaian Tujuan | Capaian Outcome | 15% |
| | Capaian Output | 15% |
| Keandalan Pelaporan Keuangan | Opini LK | 25% |
| Pengamanan Aset | Keamanan Administrasi | 10% |
| | Keamanan Fisik | 5% |
| | Keamanan Hukum | 10% |
| Ketaatan Perundang-undangan | Temuan Ketaatan | 20% |

---

## Tingkat Maturitas (Tabel II.4)

| Level | Tingkat Maturitas | Interval Skor |
|-------|------------------|---------------|
| 1 | Rintisan | 1,00 ≤ Skor < 2,00 |
| 2 | Berkembang | 2,00 ≤ Skor < 3,00 |
| 3 | Terdefinisi | 3,00 ≤ Skor < 4,00 |
| 4 | Terkelola dan Terukur | 4,00 ≤ Skor < 4,50 |
| 5 | Optimum | ≥ 4,50 |

---

## Mekanisme Penalti

Penalti diterapkan ketika terdapat kasus korupsi yang telah memasuki **tahap penuntutan s.d. putusan** (atau OTT yang langsung dapat dijadikan dasar penalti):

1. **Identifikasi kasus** — APH, LHP BPK, LHP BPKP, LHP APIP, media massa
2. **Klasifikasikan** — institusional (melibatkan pejabat dan staf lintas hierarki) vs individual
3. **Hubungkan** dengan subunsur terkait (lihat Tabel III.1 di references/01-pedoman-pk.md)
4. **Tentukan penurunan:**
   - Kelemahan di proses implementasi (kebijakan ada, tapi tidak diimplementasikan) → turun 1 gradasi (ke Level 2)
   - Kelemahan di proses pengomunikasian (kebijakan belum dipahami pegawai) → turun 2 gradasi (ke Level 1)
5. **Perbarui nilai MRI dan IEPK** — jika nilai parameter MRI/IEPK > nilai subunsur terkait setelah penalti, maka nilai MRI/IEPK menjadi sama dengan nilai subunsur; jika ≤, tidak berubah

---

## Formula Perhitungan Nilai Akhir

```
SPIP (skala 1-5):
  Nilai Penetapan Tujuan    = Σ (Skor × Bobot per unsur) → skala 1-5
  Nilai Struktur & Proses   = Σ (Skor subunsur × Bobot subunsur) → skala 1-5
  Nilai Pencapaian Tujuan   = Σ (Skor indikator × Bobot indikator) → skala 1-5

  Nilai SPIP Akhir = (Penetapan Tujuan × 40%) +
                     (Struktur dan Proses × 30%) +
                     (Pencapaian Tujuan × 30%)

MRI (skala 1-5):
  Nilai MRI = (Perencanaan × 40%) + (Kapabilitas × 30%) + (Hasil × 30%)

IEPK (skala 1-5):
  Nilai IEPK = (Kapabilitas Pengelolaan Risiko Korupsi × 48%) +
               (Penerapan Strategi Pencegahan × 36%) +
               (Penanganan Kejadian Korupsi × 16%)
```

---

## Format Output Final PK (Struktur Excel yang Dihasilkan)

### Tab 1 — Lembar Kerja Evaluasi (diedit langsung)
Kolom yang diisi oleh Claude:

| Kolom | Konten |
|-------|--------|
| Nilai PK | Skor 1–5 berdasarkan analisis dokumen |
| Catatan PK | Status (Dikonfirmasi/Direvisi/Penalti/Dok.N/A) + alasan singkat |
| Delta (PM vs PK) | Otomatis: Nilai PK − Nilai PM (+ berarti naik, − berarti turun) |

### Tab 2 — Dashboard Perbandingan

| Fokus | Komponen/Subunsur | Nilai PM | Nilai PK | Delta | Bobot | Nilai Tertimbang PK |
|-------|------------------|---------|---------|-------|-------|---------------------|
| SPIP | Penetapan Tujuan | ... | ... | ... | 40% | ... |
| SPIP | Struktur dan Proses | ... | ... | ... | 30% | ... |
| SPIP | Pencapaian Tujuan | ... | ... | ... | 30% | ... |
| **SPIP** | **TOTAL** | **...** | **...** | | | **...** |
| MRI | Perencanaan | ... | ... | ... | 40% | ... |
| MRI | (dst.) | | | | | |
| **MRI** | **TOTAL** | **...** | **...** | | | **...** |
| IEPK | (dst.) | | | | | |
| **IEPK** | **TOTAL** | **...** | **...** | | | **...** |

**Tingkat Maturitas versi PM: [Level] — [Nama]**
**Tingkat Maturitas versi PK: [Level] — [Nama]**

### Tab 3 — Area of Improvement (AoI)

| No | Prioritas | Komponen | Kode | Subunsur | Nilai PK | Kondisi | Dampak | Rekomendasi |
|----|-----------|----------|------|----------|---------|---------|--------|-------------|
| 1 | Tinggi | ... | ... | ... | ... | ... | ... | ... |

---

## Batasan dan Prinsip PK

- **Nilai PK independen** — tetapkan skor berdasarkan dokumen yang dibaca, bukan berdasarkan Nilai PM
- **Berbasis bukti dokumen** — setiap skor PK harus dapat dikaitkan dengan dokumen nyata yang diperiksa
- **Transparan tentang keterbatasan** — jika dokumen tidak ada, tulis secara eksplisit di kolom Catatan PK
- **Tidak spekulatif** — jangan menaikkan skor karena "kemungkinan ada" dokumen; hanya nilai apa yang benar-benar ditemukan
- **Konstruktif di AoI** — rekomendasi harus spesifik: siapa, apa yang harus dilakukan, ukuran keberhasilan
- **Subunsur 1.7** (Peran APIP) — Nilai PK diambil dari hasil penilaian Kapabilitas APIP yang terpisah; jika tidak ada, ikuti Nilai PM dengan catatan
- **Skor SPIP, MRI, dan IEPK** — ketiganya saling terkait; perubahan skor subunsur SPIP dapat berdampak pada nilai MRI dan IEPK jika ada penalti

---

## Referensi yang Digunakan

| Dokumen | Lokasi | Isi |
|---------|--------|-----|
| Pedoman PK — BPKP 5/2021 | `references/01-bpkp-5-2021-pedoman-pk.md` | Prosedur PM dan PK, mekanisme penalti, format laporan |
| Parameter dan Bobot Lengkap | `references/02-parameter-bobot-spip.md` | Bobot per subunsur SPIP, MRI, IEPK; kriteria gradasi skor 1-5 |
| **Peta Cell LKE Kementerian** | `references/03-peta-cell-lke-kementerian.md` | Input vs formula per sheet, baris & kolom yang boleh ditulis |
| Helper pengisi LKE (aman) | `references/fill_lke_saf