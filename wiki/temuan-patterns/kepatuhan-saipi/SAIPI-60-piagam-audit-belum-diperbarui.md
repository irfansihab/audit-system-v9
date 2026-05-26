---
id: SAIPI-60
skill: kepatuhan-saipi
kategori: SAIPI-3010
severity: HIGH
judul: "Piagam Audit Belum Diperbarui Sesuai SOTK/Standar Terkini"
kriteria_baku: "SAIPI Par. 3010 (Piagam Audit Intern) + IPPF 2017"
tags: [saipi, piagam-audit, audit-charter, sotk, iacm, kepatuhan-saipi]
---

# SAIPI-60: Piagam Audit Belum Diperbarui Sesuai SOTK/Standar Terkini

## Pattern Kondisi

Piagam Audit Intern (*Audit Charter*) masih merujuk dasar lama dan belum disesuaikan dengan SOTK/standar audit terkini. Indikator umum:

- Piagam Audit masih versi lama (mis. Kepmenkominfo 757/2018)
- Belum selaras dengan SOTK terkini (PM Komdigi 1/2025)
- Belum selaras dengan SAIPI Par. 3010 / IPPF 2017 / Framework AAIPI
- Evaluasi Piagam Audit menjadi prasyarat penguatan PKPT berbasis risiko (IACM)

## Kriteria

SAIPI Par. **3010** + IPPF 2017 — Piagam Audit Intern wajib memuat tujuan, kewenangan, tanggung jawab APIP; ditinjau berkala agar selaras SOTK & standar audit terkini.

## Akibat

1. Dasar legalitas fungsi APIP tidak selaras struktur organisasi
2. Penguatan IACM (Elemen Manajemen Pengawasan) terhambat
3. Kewenangan/tanggung jawab APIP berpotensi ambigu

## Bukti Yang Harus Dicari

| Dokumen | Yang dicari |
|---------|-------------|
| Piagam Audit Intern | nomor + tanggal + dasar |
| SOTK terkini (PM Komdigi 1/2025) | kesesuaian struktur |
| SAIPI 3010 / IPPF 2017 | kesesuaian muatan |

## Format Temuan (untuk diisi agen ke `append_temuan`)

```json
{
  "sasaran_id": "S-SAIPI-60",
  "assigned_to": "{nama anggota}",
  "judul": "Piagam Audit Intern Masih {dasar lama} — Belum Selaras SOTK/Standar Terkini",
  "kondisi": "Piagam Audit Intern masih {Kepmenkominfo 757/2018}; belum disesuaikan dengan SOTK PM Komdigi 1/2025 maupun SAIPI Par. 3010/IPPF 2017. Evaluasi Piagam Audit menjadi prasyarat penguatan PKPT berbasis risiko.",
  "kriteria": "SAIPI Par. 3010 + IPPF 2017 — Piagam Audit wajib memuat tujuan/kewenangan/tanggung jawab APIP & ditinjau berkala selaras SOTK + standar terkini.",
  "akibat": "Dasar legalitas APIP tidak selaras struktur; penguatan IACM terhambat; kewenangan/tanggung jawab ambigu.",
  "dokumen_sumber": [{"file": "...", "halaman": "X", "kutipan": "Piagam Audit 757/2018 ..."}]
}
```

## Contoh Kasus Historis

- **ND-138 Rencana Pengawasan IACM (kegiatan 3A)** — Evaluasi Piagam Audit **757/2018** terhadap SOTK terkini + SAIPI Par. 3010 & IPPF 2017; dinyatakan **KRITIS** (prerequisite sebelum reviu SOP PKPT 3B). **ND-136** + **Renstra 3.3.1** — pembaruan Piagam Audit selaras Framework AAIPI. Lihat [[nota-dinas-ir2-mei-2026]] (ND-138/136), [[renstra-itjen-2025-2029]], [[pattern-temuan]] P-23.

## Catatan

- Pattern lintas-skill P-23 (Pedoman/SOP Usang) — sama jenis dengan [[evaluasi-manajemen-risiko/EMR-42-pedoman-mr-usang]].
- Rekomendasi: perbarui Piagam Audit; jadikan dasar revisi SOP PKPT berbasis risiko.
