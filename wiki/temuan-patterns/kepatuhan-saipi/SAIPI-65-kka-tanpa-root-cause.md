---
id: SAIPI-65
skill: kepatuhan-saipi
kategori: SAIPI-2300
severity: HIGH
judul: "KKA/KKP Tidak Memuat Root Cause & Atribut Temuan Lengkap"
kriteria_baku: "SAIPI 2300 (pelaksanaan: dokumentasi, supervisi, reviu berjenjang)"
tags: [saipi, kka, kkp, root-cause, atribut-temuan, reviu-berjenjang, kepatuhan-saipi]
---

# SAIPI-65: KKA/KKP Tidak Memuat Root Cause & Atribut Temuan Lengkap

## Pattern Kondisi

Kertas Kerja Audit/Pengawasan (KKA/KKP) tidak memuat analisis akar masalah (*root cause*) dan atribut temuan lengkap, serta dokumentasi reviu berjenjang lemah. Indikator umum:

- Temuan hanya korektif administratif, tanpa *root cause analysis*
- Atribut temuan tidak lengkap (Kondisi, Kriteria, Sebab, Akibat) → lihat SAIPI-61
- Tidak ada identifikasi pengendalian kunci yang lemah + implikasi risiko
- KKP tidak memuat jejak prosedur uji, analisis, sumber data, bukti memadai
- Reviu berjenjang (KKP) tidak terdokumentasi

## Kriteria

SAIPI Standar **2300** (pelaksanaan penugasan) — setiap simpulan/opini wajib didukung KKA/KKP yang memuat jejak prosedur, analisis akar masalah, bukti memadai, dan reviu berjenjang.

## Akibat

1. Rekomendasi tidak menyentuh akar masalah (temuan berulang)
2. Simpulan tidak dapat dipertanggungjawabkan (bukti lemah)
3. Kualitas LHP rendah; skor IACM Elemen Kualitas Peran & Layanan tertahan

## Bukti Yang Harus Dicari

| Dokumen | Yang dicari |
|---------|-------------|
| Template KKA Asurans | root cause + atribut KKSAR + pengendalian kunci |
| KKP penugasan | jejak prosedur + bukti + sumber data |
| Lembar reviu berjenjang | dokumentasi reviu Dalnis/KT |

## Format Temuan (untuk diisi agen ke `append_temuan`)

```json
{
  "sasaran_id": "S-SAIPI-65",
  "assigned_to": "{nama anggota}",
  "judul": "KKA/KKP {penugasan} Tidak Memuat Root Cause & Atribut Temuan Lengkap",
  "kondisi": "KKA/KKP {penugasan}: temuan hanya korektif administratif tanpa root cause analysis; atribut temuan tidak lengkap (KKSAR); tidak identifikasi pengendalian kunci lemah + implikasi risiko; KKP tidak memuat jejak prosedur uji/analisis/bukti memadai; reviu berjenjang tidak terdokumentasi.",
  "kriteria": "SAIPI 2300 — setiap simpulan/opini wajib didukung KKA/KKP memuat jejak prosedur, root cause, bukti memadai, dan reviu berjenjang.",
  "akibat": "Rekomendasi tidak menyentuh akar masalah (temuan berulang); simpulan tidak dapat dipertanggungjawabkan; kualitas LHP rendah; skor IACM tertahan.",
  "dokumen_sumber": [{"file": "...", "halaman": "X", "kutipan": "..."}]
}
```

## Contoh Kasus Historis

- **ND-138 Rencana Pengawasan IACM (Elemen 1 — Kualitas Peran & Layanan, bobot 40% skor 2,00 = prioritas tertinggi)** — kegiatan 1A Pendampingan Penyusunan **Template KKA Asurans**: wajib memuat *root cause analysis*, implikasi risiko, identifikasi pengendalian kunci lemah, rekomendasi perbaikan proses/kebijakan (bukan hanya korektif administratif), + checklist atribut temuan lengkap (KKSAR). Kegiatan 2D Pendampingan Standar Dokumentasi Reviu Berjenjang. Lihat [[nota-dinas-ir2-mei-2026]] (ND-138).

## Catatan

- Pattern paling prioritas dalam IACM (Elemen 1 bobot 40%, skor terendah 2,00).
- Sinergi: SAIPI-61 (terminologi KKSAR), SAIPI-62 (PIA substantif), [[evaluasi-reformasi-birokrasi/ERB-46-data-dukung-matriks]].
- Rekomendasi: dampingi penyusunan Template KKA Asurans + Standar Dokumentasi Reviu Berjenjang.
