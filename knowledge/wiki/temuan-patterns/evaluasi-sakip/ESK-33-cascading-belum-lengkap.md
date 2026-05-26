---
id: ESK-33
skill: evaluasi-sakip
kategori: SAKIP-CASCADING
severity: MEDIUM
judul: "Penjenjangan (Cascading) Kinerja Belum Lengkap s.d. Eselon II / Pegawai"
kriteria_baku: "Permenpan-RB 88/2021 (penjenjangan kinerja)"
tags: [sakip, cascading, penjenjangan, esr-menpan, eselon-ii, permenpanrb-88]
---

# ESK-33: Penjenjangan (Cascading) Kinerja Belum Lengkap

## Pattern Kondisi

Penjenjangan kinerja dari level kementerian hingga Eselon II/pegawai belum lengkap atau belum terukur kualitasnya. Indikator umum:

- Penjenjangan di aplikasi (mis. `esr.menpan.go.id`) belum lengkap sampai Eselon II
- Kualitas cascading (keselarasan pohon kinerja) belum dinilai
- Monev kinerja belum berjenjang sampai level pegawai
- Aplikasi manajemen kinerja belum digunakan efektif

## Kriteria

Permenpan-RB 88/2021 — kinerja harus dijabarkan berjenjang (cascading) dari Kementerian → Eselon I → Eselon II → pegawai dengan keselarasan pohon kinerja.

## Akibat

1. Kinerja unit bawah tidak selaras dengan sasaran strategis atas
2. Nilai komponen Perencanaan/Pengukuran tertahan
3. Akuntabilitas individu lemah

## Bukti Yang Harus Dicari

| Dokumen | Yang dicari |
|---------|-------------|
| Aplikasi e-SR/esr.menpan | kelengkapan penjenjangan s.d Eselon II |
| Pohon kinerja | keselarasan vertikal sasaran-indikator |
| SKP pegawai | turunan dari PK unit |

## Format Temuan (untuk diisi agen ke `append_temuan`)

```json
{
  "sasaran_id": "S-ESK-33",
  "assigned_to": "{nama anggota}",
  "judul": "Penjenjangan Kinerja {satker} Belum Lengkap s.d. Eselon II",
  "kondisi": "Penjenjangan kinerja {satker} di {aplikasi} belum lengkap hingga Eselon II; kualitas cascading belum terukur; monev belum berjenjang sampai pegawai; aplikasi manajemen kinerja belum digunakan efektif.",
  "kriteria": "Permenpan-RB 88/2021 — kinerja dijabarkan berjenjang dari Kementerian s.d. pegawai dengan keselarasan pohon kinerja.",
  "akibat": "Kinerja unit bawah tidak selaras sasaran strategis; nilai Perencanaan/Pengukuran tertahan; akuntabilitas individu lemah.",
  "dokumen_sumber": [{"file": "...", "halaman": "X", "kutipan": "..."}]
}
```

## Contoh Kasus Historis

- **LHE AKIP eksternal Kemenpan-RB 2023–2024** — penjenjangan kinerja hingga Eselon II belum lengkap di esr.menpan.go.id; kualitas cascading belum terukur; aplikasi manajemen kinerja belum efektif; monev belum berjenjang sampai pegawai. Lihat [[lhe-akip-eksternal-kemenpanrb-2023-2024]], [[lhe-akip-internal-itjen-2023-2025]].

## Catatan

- Rekomendasi: lengkapi penjenjangan s.d. Eselon II di aplikasi; nilai keselarasan pohon kinerja.
- Sinergi: ESK-32 (indikator SMART di tiap jenjang).
