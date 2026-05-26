---
id: SAIPI-63
skill: kepatuhan-saipi
kategori: SAIPI-1300
severity: MEDIUM
judul: "Telaah Sejawat Eksternal Kedaluwarsa (>3 Tahun)"
kriteria_baku: "SAIPI 1300 (Program Jaminan & Peningkatan Mutu / QAIP)"
tags: [saipi, telaah-sejawat, peer-review, qaip, mutu, kepatuhan-saipi]
---

# SAIPI-63: Telaah Sejawat Eksternal Kedaluwarsa (>3 Tahun)

## Pattern Kondisi

Telaah sejawat (*peer review*) eksternal belum dilaksanakan sesuai periode yang disyaratkan. Indikator umum:

- Telaah sejawat eksternal terakhir >3 tahun lalu (mis. terakhir 2022)
- Belum ada rencana/jadwal telaah sejawat berkala dalam program kerja
- Program QAIP (jaminan & peningkatan mutu) belum lengkap
- Belum ada koordinasi dengan APIP eksternal sebagai penelaah

## Kriteria

SAIPI Standar **1300** (Program Jaminan & Peningkatan Mutu / QAIP) — APIP wajib menjalani penilaian mutu eksternal (telaah sejawat) secara berkala (umumnya minimal sekali dalam 3–5 tahun).

## Akibat

1. Jaminan mutu independen atas APIP tidak terkini
2. Kepatuhan SAIPI tidak terverifikasi eksternal
3. Skor IACM Elemen Budaya & Hubungan Organisasi tertahan

## Bukti Yang Harus Dicari

| Dokumen | Yang dicari |
|---------|-------------|
| Laporan telaah sejawat terakhir | tanggal pelaksanaan |
| Program kerja QAIP | jadwal telaah sejawat berkala |
| Koordinasi APIP eksternal | rencana peer review |

## Format Temuan (untuk diisi agen ke `append_temuan`)

```json
{
  "sasaran_id": "S-SAIPI-63",
  "assigned_to": "{nama anggota}",
  "judul": "Telaah Sejawat Eksternal Kedaluwarsa — Terakhir {tahun}",
  "kondisi": "Telaah sejawat eksternal APIP terakhir dilaksanakan {tahun} (>3 tahun); belum ada rencana/jadwal telaah sejawat berkala dalam program kerja; program QAIP belum lengkap; belum ada koordinasi dengan APIP eksternal penelaah.",
  "kriteria": "SAIPI 1300 (QAIP) — APIP wajib menjalani penilaian mutu eksternal (telaah sejawat) berkala (min. sekali 3–5 tahun).",
  "akibat": "Jaminan mutu independen tidak terkini; kepatuhan SAIPI tidak terverifikasi eksternal; skor IACM tertahan.",
  "dokumen_sumber": [{"file": "...", "halaman": "X", "kutipan": "telaah sejawat terakhir 2022 ..."}]
}
```

## Contoh Kasus Historis

- **ND-138 Rencana Pengawasan IACM (kegiatan 5B)** — Pendampingan Penyusunan **Program Telaah Sejawat Eksternal Berkala**; dicatat "terakhir dilaksanakan tahun 2022". Lihat [[nota-dinas-ir2-mei-2026]] (ND-138), [[telaah-sejawat-internal]].

## Catatan

- Rekomendasi: susun program telaah sejawat eksternal berkala + koordinasi APIP eksternal.
- Sinergi: [[telaah-sejawat-internal]] (kerangka QAIP AAIPI).
