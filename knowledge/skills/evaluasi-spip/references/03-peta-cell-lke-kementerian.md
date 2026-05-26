# Peta Cell LKE SPIP Kementerian — Panduan Pengisian

**File rujukan:** `templates/lke-spip-kementerian.xlsx`
**File cell-map JSON (daftar lengkap semua formula):** `templates/cell-map-formulas.json`

> **Prinsip Mutlak:** Claude HANYA menulis pada **input cell** yang tercantum di dokumen ini.
> Semua cell formula (ditandai rumus `=...`) adalah **TERLARANG** — mengubahnya akan merusak perhitungan nilai akhir.
> Sebelum menulis, **WAJIB** memuat workbook dengan `openpyxl` dan memverifikasi bahwa target cell bukan formula (`cell.data_type != 'f'`). Gunakan helper `fill_lke_safely.py` di folder ini.

---

## Struktur Sheet dalam LKE

LKE terdiri dari 24 sheet dengan tiga lapisan:

| Lapisan | Sheet | Isi |
|---|---|---|
| **Input (Claude mengisi)** | `KKE 1.1 SASTRA PEMDA`, `KKE 1.2 SASARAN OPD`, `KKE 2.1 SASKEG`, `KK 2.2 RO`, `KKE 2.2 KEGIATAN`, `KK3.1`, `KK3.2`, `KK3.3`, `KK3.4`, `KK 5.1A`, `KK 5.1 B `, `KK 5.2 `, `KK 6`, `KK 7`, `KK 8`, `KK4_PENALTI`, `qa 3.1 8 satker` | Hasil pengujian, simpulan level, catatan PK |
| **Agregator (JANGAN SENTUH)** | `KKlead I KL`, `KKLEAD II`, `KKLEAD III`, `KKLEAD_SPIP`, `Uraian NIlai Setiap Unsur` | Rumus auto-compute — tidak boleh ditulis manual |
| **Lain-lain** | `Sheet8`, `Sheet3` | Kosong / scratch — abaikan |

---

## Mapping Sheet ↔ Bagian Penilaian SPIP

```
PENETAPAN TUJUAN (40%)
├── KKE 1.1 SASTRA PEMDA        → Sasaran Strategis K/L (IK, Target → Y/T per kriteria)
├── KKE 1.2 SASARAN OPD         → Sasaran Program per unit (OPD)
├── KKE 2.1 SASKEG              → Sasaran Kegiatan
├── KK 2.2 RO                   → Rincian Output
└── KKE 2.2 KEGIATAN            → Kegiatan (pendukung)
                       ↓ diagregasi otomatis di ↓
                                KKlead I KL  (formula)

STRUKTUR DAN PROSES (30%)
├── KK3.1  → Dimensi SPIP (Efektivitas/Efisiensi pencapaian tujuan)
├── KK3.2  → Dimensi KEUANGAN (keandalan pelaporan keuangan)
├── KK3.3  → Dimensi ASET (pengamanan aset)
├── KK3.4  → Dimensi KETAATAN (kepatuhan perundang-undangan)
├── qa 3.1 8 satker → QA per 8 satker (modus satker)
└── KK4_PENALTI → Veto YA/TIDAK per subunsur
                       ↓ diagregasi otomatis di ↓
                                KKLEAD II  (formula)

PENCAPAIAN TUJUAN SPIP (30%)
├── KK 5.1A, KK 5.1 B, KK 5.2  → Pemantauan (efektivitas + efisiensi)
├── KK 6                        → Capaian Output/Outcome
├── KK 7                        → Pengamanan Aset (administrasi, fisik, hukum)
└── KK 8                        → Ketaatan perundang-undangan
                       ↓ diagregasi otomatis di ↓
                                KKLEAD III  (formula)

RINGKASAN AKHIR
└── KKLEAD_SPIP  → Skor akhir maturitas (seluruhnya formula)
    Uraian NIlai Setiap Unsur → narasi per unsur (sebagian formula, sebagian input kolom M)
```

---

## Peta Input Cell — Per Sheet

### 1. `KKE 1.1 SASTRA PEMDA`

**Baris input:** 6 s.d. 23 (satu baris per sasaran strategis)
**Jangan ubah:** baris 24–26 (COUNTIF/COUNTA/persentase), kolom `B5:P5` (rumus header), `E24:O26`.

| Kolom | Isi | Dari mana |
|---|---|---|
| A | No (urut 1,2,3,…) | Urutan |
| B | Uraian Sasaran Strategis | Renstra K/L |
| C | Uraian Indikator Kinerja Sasaran | Renstra / PK |
| D | Target Kinerja | Renstra / PK |
| **E** | PM — SASTRA Berorientasi Hasil (Y/T) | Asesor PM |
| **F** | PM — Relevan & Menggambarkan Mandat (Y/T) | Asesor PM |
| **G** | PM — Indikator Kinerja Tepat (Y/T) | Asesor PM |
| **H** | PM — Uji Kecukupan Indikator (Y/T) | Asesor PM |
| **I** | PM — Target Kinerja Tepat (Y/T) | Asesor PM |
| J | Keterangan PM | Asesor PM |
| **K** | **PK — SASTRA Berorientasi Hasil (Y/T)** | **Claude isi** |
| **L** | **PK — Relevan & Menggambarkan Mandat (Y/T)** | **Claude isi** |
| **M** | **PK — Indikator Kinerja Tepat (Y/T)** | **Claude isi** |
| **N** | **PK — Uji Kecukupan Indikator (Y/T)** | **Claude isi** |
| **O** | **PK — Target Kinerja Tepat (Y/T)** | **Claude isi** |
| **P** | **Keterangan PK** | **Claude isi** — alasan bila beda dengan PM |

> Nilai yang boleh ditulis di E–I dan K–O hanyalah string `"Y"` atau `"T"`. Cell E24:O26 adalah formula COUNTIF/COUNTA/%, JANGAN SENTUH.

### 2. `KKE 1.2 SASARAN OPD`

Struktur sama dengan KKE 1.1, baris input dimulai baris 6 sampai 56.
Pola kolom identik: E–I = PM, K–O = PK (input Claude), J & P = keterangan.
**Jangan ubah baris agregasi** di bagian bawah.

### 3. `KKE 2.1 SASKEG`

Baris input: 6 s.d. 126 (per sasaran kegiatan).
Kolom input Claude: **O (Relevan), P (Orientasi hasil), Q (IK tepat), R (Cukup), S (Target tepat)**, kolom PM ada di kolom sebelumnya.
**Formula di kolom:** G (id), L–P (agregat sebagian), R–V (agregasi). Periksa `cell.data_type` sebelum tulis.

### 4. `KK 2.2 RO`

Baris input: 6 s.d. 209.
Kolom input Claude (PK): **T, U, V, W** (PK Y/T kriteria RO).
Semua kolom A–X memiliki mixed formula — **WAJIB cek `data_type != 'f'` sebelum tulis**.

### 5. `KKE 2.2 KEGIATAN`

Baris input: 5 s.d. 132.
Kolom input: B, C, D, H, I, J, K, L, M (PM), P–T (PK Y/T + keterangan).
Formula di: N, O, P (partial), Q, R, S, U, V, W, X, Y.

### 6. `KK3.1` — SPIP Struktur-Proses Dimensi Efektivitas

**Layout per subunsur**: 5 baris (A–E gradasi) — baris pertama berisi `C_n: 1.0` nomor parameter.

Baris input utama (contoh parameter 1.1): baris 6,12,18,23,28,…

| Kolom | Isi | Boleh diisi? |
|---|---|---|
| **K** | Uraian Hasil Pengujian — **Ditjen Infrastruktur Digital** | ✅ input Claude |
| **L** | Simpulan Level Ditjen Infradigi (1.0–5.0) | ✅ input Claude |
| **M** | Uraian Hasil Pengujian — **Ditjen Ekosistem Digital** | ✅ input Claude |
| **N** | Simpulan Level Ditjen Ekodigi | ✅ input Claude |
| **O** | Uraian — **Ditjen Komunikasi Publik dan Media** | ✅ input Claude |
| **P** | Simpulan Level Ditjen KPM | ✅ input Claude |
| **Q** | Uraian — **Badan Aksesibilitas Telekomunikasi dan Informasi** | ✅ input Claude |
| **R** | Simpulan Level Badan Aksesibilitas | ✅ input Claude |
| S | **Kesimpulan Akhir PM** = `MODE.SNGL(K6:R10)` | 🚫 FORMULA — jangan tulis |
| T | Pembuktian Tepat | ✅ input Claude |
| U | Modus Tepat | ✅ input Claude |
| **V** | **Kesimpulan Akhir PK** (override manual jika beda modus) | ✅ input Claude (angka 1.0–5.0) |
| **W** | Catatan jika Nilai PK berbeda dari PM | ✅ input Claude |
| Z | Reserved | ✅ input Claude |

> Pola yang sama berlaku untuk KK3.2, KK3.3, KK3.4, namun dengan kolom uraian/simpulan yang sedikit berbeda — gunakan `cell-map-formulas.json` untuk daftar formula pasti.

### 7. `KK3.2` — Dimensi Keuangan

Baris input: per 5 baris sesuai subunsur (sama seperti KK3.1).
Kolom input: **K, M** (Uraian hasil pengujian) dan **L, N** (Simpulan level).
**Jangan ubah:** semua cell di kolom L, M, N, O yang bertipe formula. Periksa `cell.data_type`.

### 8. `KK3.3` — Dimensi Aset

Sama seperti KK3.2. Formula di kolom L & N (sebagian).

### 9. `KK3.4` — Dimensi Ketaatan

Sama seperti KK3.2. Hanya 3 formula total — mayoritas kolom adalah input.

### 10. `qa 3.1 8 satker` — QA per Satker

Baris input: 4 s.d. 242.
Kolom input: A–Q (seluruhnya input).
**Jangan ubah** kolom R (68 formula MODE/agregasi).

### 11. `KK 5.1A`, `KK 5.1 B `, `KK 5.2 ` — Pemantauan

- **KK 5.1A**: Input kolom A–I, K, L, M, O. **Jangan ubah kolom J dan N** (formula).
- **KK 5.1 B **: Input kolom A–K, M–R. **Jangan ubah kolom L** (formula).
- **KK 5.2 **: Input kolom A–I, K, L, M, O. **Jangan ubah kolom J dan N** (formula).

### 12. `KK 6`, `KK 7`, `KK 8` — Pencapaian Tujuan SPIP

Ketiganya **tidak mengandung formula sama sekali** — seluruhnya input manual.

- KK 6: kolom A–H (16 baris), capaian output/outcome.
- KK 7: kolom A, C–G (23 baris), pengamanan aset.
- KK 8: kolom A–G (25 baris), ketaatan perundang-undangan.

### 13. `KK4_PENALTI` — Veto Kasus Korupsi

Baris 5 s.d. 33.

| Kolom | Isi | Boleh diisi? |
|---|---|---|
| A, B | Kode & nama subunsur | (sudah terisi di template) |
| **C** | Veto — `"YA"` atau `"TIDAK"` | ✅ input Claude |
| **D** | Skor setelah penalti (bila Veto = YA) — angka 1.0–5.0 | ✅ input Claude |
| F–J | Tabel referensi kasus korupsi | (sudah terisi — jangan ubah) |

> Satu-satunya formula di sheet ini: `A1`. JANGAN SENTUH.
> Nilai di kolom C harus string `"YA"` atau `"TIDAK"` persis (case-sensitive, menyesuaikan formula di KKLEAD II kolom M/N).

### 14. `Uraian NIlai Setiap Unsur`

| Kolom | Status |
|---|---|
| A–D | Input (judul unsur & deskripsi) — sebagian sudah terisi |
| E, F, G, H | Formula agregasi — 🚫 jangan sentuh |
| I, J | Formula | 🚫 jangan sentuh |
| K, L | — |
| **M** | **Catatan narasi per unsur** — ✅ input Claude |
| N | Formula | 🚫 jangan sentuh |

---

## Sheet yang TIDAK BOLEH DISENTUH (Agregator)

Untuk keempat sheet ini, **Claude TIDAK PERNAH menulis ke cell apa pun**. Membaca (read-only) diperbolehkan untuk verifikasi skor akhir.

| Sheet | Formula cells | Fungsi |
|---|---|---|
| `KKlead I KL` | 31 | Agregasi Penetapan Tujuan (KKE 1.x, 2.x → level 1–5) |
| `KKLEAD II` | 469 | Agregasi Struktur & Proses (KK3.x → veto penalti → nilai akhir) |
| `KKLEAD III` | 7 | Agregasi Pencapaian Tujuan (KK 5–8) |
| `KKLEAD_SPIP` | 152 | Ringkasan akhir skor maturitas (bobot 40/30/30) |

---

## Veto Penalti — Mekanisme di Excel

Veto di `KK4_PENALTI` kolom C (YA/TIDAK) otomatis memicu formula di `KKLEAD II` kolom M & N:

```
KKLEAD II!M6 = KK4_PENALTI!C5
KKLEAD II!N6 = IF(M6="YA", KK4_PENALTI!D5, L6)
```

Artinya:
- Jika Claude mengubah `KK4_PENALTI!C5` menjadi `"YA"` dan mengisi `D5` dengan skor penalti (mis. 2.0), maka seluruh parameter di subunsur 1.1 akan di-cap pada skor itu via `IF(AND($M$6="YA",L7>$N$6),$N$6,L7)`.
- Jika veto "TIDAK", skor agregat berjalan normal dari `AVERAGE(H7:K7)`.

**Implikasi:** Untuk menerapkan penalti, Claude cukup menulis:
1. `KK4_PENALTI!C[baris]` ← `"YA"`
2. `KK4_PENALTI!D[baris]` ← angka skor penalti

Tidak perlu menurunkan skor manual di KK3.x.

---

## Daftar Lengkap Cell Formula

Untuk daftar pasti setiap cell formula per sheet, lihat `templates/cell-map-formulas.json` — format:

```json
{
  "NamaSheet": {
    "last_row": 26,
    "formula_cells_count": 45,
    "formula_cells_all": ["B5","C5","D5", ...]
  }
}
```

File ini **harus dimuat** oleh script pengisi sebagai guard list sebelum menulis.

---

## Aturan Penulisan

1. **Selalu load dengan** `load_workbook(path, data_only=False, keep_vba=False)` untuk mempertahankan rumus.
2. **Sebelum set nilai cell**, cek:
   ```python
   if ws[coord].data_type == 'f':
       raise RuntimeError(f"REFUSE: {sheet}!{coord} is a formula")
   ```
3. **Jangan** memanggil `ws.delete_rows` atau `ws.delete_cols` — dapat merusak reference di formula.
4. **Jangan** menambah/menghapus sheet.
5. **Setelah save**, buka ulang dengan `data_only=True` dan periksa bahwa `KKLEAD_SPIP!J...` (nilai akhir) terhitung. Jika #REF! muncul, ada formula yang rusak.
6. **Simpan backup** — sebelum modifikasi, copy file asli ke `*.bak.xlsx`.
