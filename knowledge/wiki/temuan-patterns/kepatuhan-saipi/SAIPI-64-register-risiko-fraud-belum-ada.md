---
id: SAIPI-64
skill: kepatuhan-saipi
kategori: SAIPI-2210
severity: HIGH
judul: "Register Risiko Fraud Belum Disusun"
kriteria_baku: "SAIPI 2210 (pertimbangan risiko kecurangan) + IEPK/SPIP"
tags: [saipi, fraud, register-risiko-fraud, iepk, anti-korupsi, kepatuhan-saipi]
---

# SAIPI-64: Register Risiko Fraud Belum Disusun

## Pattern Kondisi

Register risiko *fraud* (kecurangan) di lingkungan APIP/satker belum disusun. Indikator umum:

- Tidak ada daftar risiko kecurangan terdokumentasi (Likelihood, Impact, Risk Appetite)
- Sasaran penugasan belum mempertimbangkan risiko fraud secara eksplisit
- Kebijakan anti korupsi belum dievaluasi relevansinya
- Fraud Risk Assessment (FRA) belum terintegrasi dengan SPIP/IEPK/ZI

## Kriteria

SAIPI Standar **2210** (sasaran penugasan wajib mempertimbangkan risiko kecurangan) + IEPK/SPIP — APIP wajib menyusun register risiko fraud + Fraud Risk Assessment sebagai dasar pengawasan & pencegahan korupsi.

## Akibat

1. Risiko kecurangan tidak teridentifikasi/termitigasi
2. Penugasan tidak sensitif terhadap fraud
3. Skor IEPK + IACM (IEPK/SPIP tambahan) tertahan

## Bukti Yang Harus Dicari

| Dokumen | Yang dicari |
|---------|-------------|
| Register risiko fraud | ada/lengkap (L, I, Risk Appetite) |
| Kebijakan anti korupsi | evaluasi relevansi |
| FRA + integrasi SPIP/ZI | keterhubungan |

## Format Temuan (untuk diisi agen ke `append_temuan`)

```json
{
  "sasaran_id": "S-SAIPI-64",
  "assigned_to": "{nama anggota}",
  "judul": "Register Risiko Fraud {satker} Belum Disusun",
  "kondisi": "Register risiko fraud {satker} belum disusun (tidak ada daftar risiko kecurangan ber-Likelihood/Impact/Risk Appetite); sasaran penugasan belum pertimbangkan risiko fraud eksplisit; kebijakan anti korupsi belum dievaluasi; FRA belum terintegrasi SPIP/IEPK/ZI.",
  "kriteria": "SAIPI 2210 + IEPK/SPIP — APIP wajib susun register risiko fraud + FRA sebagai dasar pengawasan & pencegahan korupsi.",
  "akibat": "Risiko kecurangan tidak teridentifikasi/termitigasi; penugasan tidak sensitif fraud; skor IEPK/IACM tertahan.",
  "dokumen_sumber": [{"file": "...", "halaman": "X", "kutipan": "Register Risiko Fraud disusun dari awal ..."}]
}
```

## Contoh Kasus Historis

- **ND-138 Rencana Pengawasan IACM (kegiatan IEPK2)** — Pendampingan Penyusunan **Register Risiko Fraud Itjen** (dilengkapi Likelihood, Impact, Risk Appetite); "disusun dari awal — belum tersedia sebelumnya"; sinergi dengan IEPK1 Evaluasi Kebijakan Anti Korupsi. Lihat [[nota-dinas-ir2-mei-2026]] (ND-138).

## Catatan

- Sinergi: [[evaluasi-reformasi-birokrasi/ERB-47-zona-integritas-stagnan]] (ZI/IEPK), [[evaluasi-spip/ESP-36-register-risiko-strategis-belum-ada]].
- Rekomendasi: susun register risiko fraud + FRA; evaluasi kebijakan anti korupsi; integrasikan SPIP/ZI.
