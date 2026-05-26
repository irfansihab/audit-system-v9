---
id: SAIPI-62
skill: kepatuhan-saipi
kategori: SAIPI-2200
severity: HIGH
judul: "PIA Substantif / Survei Pendahuluan Belum Memadai"
kriteria_baku: "SAIPI 2200 (perencanaan penugasan: survei pendahuluan, PKA)"
tags: [saipi, pia, survei-pendahuluan, pka, perencanaan-penugasan, kepatuhan-saipi]
---

# SAIPI-62: PIA Substantif / Survei Pendahuluan Belum Memadai

## Pattern Kondisi

Perencanaan penugasan (Pengenalan Intern Auditi/PIA substantif, survei pendahuluan, Program Kerja Audit) belum memadai. Indikator umum:

- PIA hanya pemahaman proses bisnis, belum substantif (strategi, tujuan, risiko, isu strategis)
- Survei pendahuluan/LSP belum dijadikan output kritis perencanaan
- PKA/PKP tidak memuat risiko penugasan + titik kritis + tentative objectives
- Reviu pedoman audit rinci belum mengatur PIA sebagai langkah Pra-Perencanaan

## Kriteria

SAIPI Standar **2200** (perencanaan penugasan) — penugasan didahului survei pendahuluan + PIA substantif (analisis strategi/tujuan/proses bisnis/risiko) sebagai dasar PKA berbasis risiko.

## Akibat

1. Penugasan tidak terfokus pada risiko signifikan
2. Desain Program Pengawasan (DPP) lemah
3. Kualitas hasil pengawasan menurun

## Bukti Yang Harus Dicari

| Dokumen | Yang dicari |
|---------|-------------|
| Pedoman Audit Rinci (PIA) | PIA diatur sebagai Pra-Perencanaan? |
| LSP / dokumen survei pendahuluan | ada + substantif |
| PKA/PKP | muatan risiko + titik kritis + objectives |

## Format Temuan (untuk diisi agen ke `append_temuan`)

```json
{
  "sasaran_id": "S-SAIPI-62",
  "assigned_to": "{nama anggota}",
  "judul": "PIA Substantif / Survei Pendahuluan {penugasan} Belum Memadai",
  "kondisi": "Perencanaan penugasan {penugasan}: PIA hanya pemahaman proses bisnis (belum substantif: strategi/tujuan/risiko/isu strategis); LSP belum jadi output kritis; PKA tidak memuat risiko penugasan + titik kritis + tentative objectives. Pedoman audit rinci belum mengatur PIA sebagai Pra-Perencanaan.",
  "kriteria": "SAIPI 2200 — penugasan didahului survei pendahuluan + PIA substantif sebagai dasar PKA berbasis risiko.",
  "akibat": "Penugasan tidak terfokus pada risiko signifikan; DPP lemah; kualitas hasil pengawasan menurun.",
  "dokumen_sumber": [{"file": "...", "halaman": "X", "kutipan": "PIA substantif belum ada ..."}]
}
```

## Contoh Kasus Historis

- **ND-138 Rencana Pengawasan IACM (Elemen 2 — Profesionalisme Penugasan, skor 2,44)** — kegiatan 2A Reviu Pedoman Audit Rinci (atur PIA sebagai Pra-Perencanaan) + 2C Pendampingan Penyusunan **Dokumen PIA Substantif** (analisis strategi/tujuan/proses bisnis/risiko sebagai dasar DPP, bukan sekadar pemahaman proses bisnis). Lihat [[nota-dinas-ir2-mei-2026]] (ND-138).

## Catatan

- Sinergi: [[reviu-pengadaan/RP-12-kajian-tanpa-rencana-aksi]] (perencanaan berbasis output), [[audit-kinerja/README]] (survei pendahuluan).
- Rekomendasi: revisi pedoman audit rinci + dampingi penyusunan PIA substantif + PKA berbasis risiko.
