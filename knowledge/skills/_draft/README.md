# Staging Area — Draft Skill Hasil Graduasi

Folder ini menampung **draft skill spesifik** yang dihasilkan oleh meta-skill `graduasi-skill-spesifik`. Skill di sini **belum aktif** — auditor harus review dan promote dulu sebelum dipakai untuk penugasan.

## Status Lifecycle

```
[Penugasan dengan skill umum]
        ↓ (auditor jalankan: graduasi-skill --penugasan ID1 ID2 ...)
[skills/_draft/<nama-skill>/]   ← di sini, status: draft-pending-approval
        ↓ (auditor review)
        ├── promote → [skills/<nama-skill>/] (aktif)
        └── reject  → folder dihapus
```

## Cara Pakai

### Generate draft baru

```
python ../graduasi-skill-spesifik/scripts/graduasi.py \
    --penugasan 2026-014 2026-021 2026-027 \
    --nama reviu-bantuan-frekuensi
```

Atau via dialog dengan Claude (skill `graduasi-skill-spesifik` akan menjalankan script).

### Lihat daftar draft

```
python ../graduasi-skill-spesifik/scripts/graduasi.py --list
```

### Promote draft → skill aktif

```
python ../graduasi-skill-spesifik/scripts/graduasi.py --promote <nama-skill>
```

Setelah promote:
1. Buka `skills/<nama-skill>/SKILL.md`
2. **Hapus banner ⚠️ STATUS DRAFT**
3. Ubah `version: 0.1` → `version: 1.0`
4. Hapus field `status: draft-pending-approval`
5. Update `audit-system-v4/skills/README-skills-umum.md` — tambah ke decision tree

### Reject draft

```
python ../graduasi-skill-spesifik/scripts/graduasi.py --reject <nama-skill>
```

Folder draft akan dihapus dan log `audit-system-v4/feedback/graduasi-log.json` di-update.

## Aturan Review

Sebelum mempromote draft, auditor wajib memeriksa:

- [ ] **SKILL.md** — frontmatter valid, isi sesuai parent skill, tidak ada placeholder `{{...}}` tersisa
- [ ] **References** — `01-regulasi-utama.md` dan `02-regulasi-pendukung.md` berisi kriteria yang relevan
- [ ] **Red flag** — `03-checklist-redflag.md` direview manual; buang false positive
- [ ] **Templates** — bila perlu, salin template KKA/LHA dari `audit-system-v4/templates/` yang relevan
- [ ] **Pipeline script** (jika ada) — TODO di `digest.py` & `cross_check.py` diisi sebelum dipakai
- [ ] **METADATA.md** — daftar penugasan sumber tepat dan akurat

## Tidak Boleh

- ❌ Skill di folder `_draft/` **tidak boleh** dipakai langsung untuk penugasan operasional — mereka belum diverifikasi
- ❌ Jangan rename folder draft secara manual — pakai `--reject` lalu re-run dengan nama baru
- ❌ Jangan promote tanpa edit minimum (hapus banner DRAFT, update version)
- ❌ Jangan menyimpan output penugasan di sini — folder ini khusus skill spesifikasi

## Audit Trail

Setiap operasi graduasi/promote/reject dicatat di:
```
audit-system-v4/feedback/graduasi-log.json
```

File log adalah append-only — jangan diedit manual kecuali untuk koreksi yang sengaja.

## Pemeliharaan

Jika folder `_draft/` menampung terlalu banyak draft yang tidak pernah di-review (mis. >10), pertimbangkan:
- Tetapkan **kebijakan TTL** (mis. draft >90 hari yang belum di-promote → reject otomatis)
- Konsolidasi draft yang mirip menjadi satu skill
- Audit ulang apakah graduasi terlalu agresif (perlu naikkan threshold ≥3 penugasan)
