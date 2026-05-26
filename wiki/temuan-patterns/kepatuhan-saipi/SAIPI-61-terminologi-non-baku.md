---
id: SAIPI-61
skill: kepatuhan-saipi
kategori: SAIPI-2400
severity: MEDIUM
judul: "Terminologi Temuan Non-Baku (CCCER vs KKSAR)"
kriteria_baku: "SAIPI 2400 (komunikasi hasil penugasan)"
tags: [saipi, terminologi, kksar, cccer, atribut-temuan, kepatuhan-saipi]
---

# SAIPI-61: Terminologi Temuan Non-Baku (CCCER vs KKSAR)

## Pattern Kondisi

Dokumen/proses bisnis pengawasan menggunakan terminologi temuan yang tidak baku menurut SAIPI/IPPF. Indikator umum:

- Memakai akronim non-baku (mis. "CCCER") alih-alih atribut temuan SAIPI
- Atribut temuan tidak lengkap (Kondisi, Kriteria, Sebab, Akibat, Rekomendasi)
- Inkonsistensi istilah lintas dokumen pengawasan
- Belum mencantumkan fungsi consulting/pendampingan sebagai jenis pengawasan

## Kriteria

SAIPI Standar **2400** (komunikasi hasil) — temuan dikomunikasikan dengan atribut baku **KKSAR** (Kondisi, Kriteria, Sebab, Akibat, Rekomendasi); terminologi mengikuti SAIPI/IPPF.

## Akibat

1. Komunikasi hasil tidak konsisten/standar
2. Kualitas temuan sulit dinilai (atribut tidak lengkap)
3. Tidak selaras standar nasional APIP

## Bukti Yang Harus Dicari

| Dokumen | Yang dicari |
|---------|-------------|
| Peta proses bisnis pengawasan | istilah output temuan |
| Template LHP/LHA | atribut KKSAR lengkap? |
| Pedoman pengawasan | terminologi baku |

## Format Temuan (untuk diisi agen ke `append_temuan`)

```json
{
  "sasaran_id": "S-SAIPI-61",
  "assigned_to": "{nama anggota}",
  "judul": "Terminologi Temuan Non-Baku ('{istilah}') — Belum Sesuai KKSAR (SAIPI 2400)",
  "kondisi": "Dokumen/proses bisnis pengawasan memakai '{CCCER/istilah non-baku}' alih-alih atribut baku KKSAR (Kondisi, Kriteria, Sebab, Akibat, Rekomendasi); jenis pengawasan belum mencantumkan consulting/pendampingan.",
  "kriteria": "SAIPI 2400 — temuan dikomunikasikan dengan atribut baku KKSAR; terminologi mengikuti SAIPI/IPPF.",
  "akibat": "Komunikasi hasil tidak konsisten/standar; kualitas temuan sulit dinilai; tidak selaras standar nasional APIP.",
  "dokumen_sumber": [{"file": "...", "halaman": "X", "kutipan": "akronim CCCER ..."}]
}
```

## Contoh Kasus Historis

- **ND-136 Masukan Peta Proses Bisnis (butir 3)** — akronim **"CCCER"** tidak diakui SAIPI/IPPF; disarankan terminologi baku **"KKSAR" (Kondisi, Kriteria, Sebab, Akibat, Rekomendasi)**; tambahkan fungsi consulting/pendampingan sebagai jenis pengawasan. Lihat [[nota-dinas-ir2-mei-2026]] (ND-136).

## Catatan

- Sinergi: SAIPI-65 (atribut temuan lengkap di KKA/KKP).
- Rekomendasi: standarkan terminologi KKSAR di seluruh template + pedoman pengawasan.
