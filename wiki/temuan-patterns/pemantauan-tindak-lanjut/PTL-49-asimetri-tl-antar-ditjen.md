---
id: PTL-49
skill: pemantauan-tindak-lanjut
kategori: TLHP-KINERJA
severity: MEDIUM
judul: "Asimetri Penyelesaian TL Eksternal vs Internal Antar-Ditjen"
kriteria_baku: "Pedoman Pemantauan TLHP (klasifikasi & rate penyelesaian)"
tags: [tlhp, asimetri, kinerja-tl, wasdig, ekdig, pemantauan-tl]
---

# PTL-49: Asimetri Penyelesaian TL Eksternal vs Internal Antar-Ditjen

## Pattern Kondisi

Tingkat penyelesaian TL berbeda ekstrem antar-Ditjen sejenis, mengindikasikan kompleksitas rekomendasi yang berbeda. Indikator umum:

- Gap rate penyelesaian >50 poin persentase antar-Ditjen (mis. 17,07% vs 83,33%)
- Ditjen dengan rate rendah didominasi rekomendasi struktural (mis. 34/35 = BPK TKPPSE)
- Ditjen dengan rate tinggi didominasi rekomendasi operasional
- TL eksternal & internal punya rate berbeda di Ditjen yang sama

## Kriteria

Pedoman Pemantauan TLHP — penyelesaian TL diukur sebagai rate (Sesuai/total); perbedaan ekstrem perlu dianalisis akar penyebabnya (kompleksitas rekomendasi).

## Akibat

1. Misinterpretasi kinerja (rate rendah belum tentu lalai)
2. Alokasi sumber daya pemantauan tidak tepat
3. Rekomendasi struktural terabaikan jika hanya dilihat dari rate

## Bukti Yang Harus Dicari

| Dokumen | Yang dicari |
|---------|-------------|
| Rekap TLHP per Ditjen | rate Sesuai per Ditjen |
| Klasifikasi rekomendasi | operasional vs struktural |
| Komparasi eksternal vs internal | rate per jenis |

## Format Temuan (untuk diisi agen ke `append_temuan`)

```json
{
  "sasaran_id": "S-PTL-49",
  "assigned_to": "{nama anggota}",
  "judul": "Asimetri TL: {Ditjen A} {x}% vs {Ditjen B} {y}%",
  "kondisi": "Pemantauan TLHP {periode}: {Ditjen A} {x}% sesuai ({a}/{b} rek) vs {Ditjen B} {y}% ({c}/{d}). {Ditjen A} didominasi rekomendasi struktural ({m}/{n} = {sumber}), {Ditjen B} operasional.",
  "kriteria": "Pedoman Pemantauan TLHP — perbedaan rate ekstrem perlu dianalisis akar penyebab (kompleksitas rekomendasi).",
  "akibat": "Misinterpretasi kinerja; alokasi sumber daya tidak tepat; rekomendasi struktural terabaikan.",
  "dokumen_sumber": [{"file": "...", "halaman": "X", "kutipan": "Wasdig 7/41 (17,07%) vs EkDig 15/18 (83,33%) ..."}]
}
```

## Contoh Kasus Historis

- **Pemantauan TLHP November 2025** — **Wasdig 17,07%** sesuai (7/41 rek; 34/35 = BPK TKPPSE struktural) vs **EkDig 83,33%** (15/18 rek operasional). Lihat [[pemantauan-tlhp-wasdig-november-2025]], [[pemantauan-tlhp-ekdig-november-2025]], [[pattern-temuan]] P-26.

## Catatan

- Rekomendasi: resource khusus untuk rekomendasi struktural; jangan nilai semata dari rate.
- Sinergi: PTL-48 (akar: rekomendasi struktural).
