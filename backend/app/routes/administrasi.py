"""Routes Administrasi / Pasca-Persetujuan (Tahapan 8 — peran TU).

Ranah ADMINISTRASI di garis serah: setelah laporan disetujui, TU mengelola paket
ekspor (LHP final + Daftar Temuan & Rekomendasi) + draft surat penyampaian.
Lingkup "handoff + register ringkas": penomoran resmi/TTE/distribusi/arsip TETAP
di SIMWAS. Tindak lanjut dipantau via modul TLHP (sudah ter-ingest saat approval).
"""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import LhpReview, Penugasan, Role, User

router = APIRouter(prefix="/penugasan", tags=["administrasi"])

_WRITE_ROLES = {Role.TU, Role.PT, Role.PM, Role.ADMIN}


async def _penugasan(db: AsyncSession, pid: int) -> Penugasan:
    p = (await db.execute(select(Penugasan).where(Penugasan.id == pid))).scalar_one_or_none()
    if not p:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Penugasan tidak ditemukan.")
    return p


async def _is_approved(db: AsyncSession, pid: int) -> bool:
    r = (await db.execute(
        select(LhpReview).where(LhpReview.penugasan_id == pid).order_by(LhpReview.id.desc()).limit(1)
    )).scalar_one_or_none()
    return bool(r and r.status == "APPROVED")


def _docx(folder: Path, sub: str, *, exclude: tuple[str, ...] = ()) -> list[dict]:
    d = folder / sub
    if not d.is_dir():
        return []
    out = []
    for f in sorted(d.glob("*.docx")):
        if f.name.startswith("~$") or any(x in f.name for x in exclude):
            continue
        out.append({"name": f.name, "path": str(f.relative_to(folder))})
    return out


@router.get("/{penugasan_id}/administrasi")
async def get_administrasi(
    penugasan_id: int,
    _current: tuple[User, Role] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    p = await _penugasan(db, penugasan_id)
    folder = Path(p.folder_path)
    approved = await _is_approved(db, penugasan_id)
    lhp_files = _docx(folder, "_LHP", exclude=("SUBSTANSI", "Daftar-Temuan", "Surat-Penyampaian"))
    daftar = _docx(folder, "_LHP")
    daftar = [f for f in daftar if f["name"].startswith("Daftar-Temuan")]
    surat = _docx(folder, "_ADMIN")
    return {
        "penugasan_id": p.id,
        "approved": approved,
        "paket_ekspor": {
            "lhp": lhp_files,
            "daftar_temuan": daftar,          # auto-generate saat approval (Fase 3)
        },
        "surat_penyampaian": surat,           # draft (Tahapan 8)
        "catatan_simwas": "Penomoran resmi, TTE, distribusi, dan arsip dilakukan di SIMWAS. "
                          "Tindak lanjut dipantau via modul TLHP (rekomendasi ter-ingest saat approval).",
    }


@router.post("/{penugasan_id}/administrasi/surat-penyampaian")
async def buat_surat_penyampaian(
    penugasan_id: int,
    payload: dict = Body(default={}),
    current: tuple[User, Role] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    _user, role = current
    if role not in _WRITE_ROLES:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Surat penyampaian hanya untuk TU/PT/PM/Admin.")
    p = await _penugasan(db, penugasan_id)
    if not await _is_approved(db, penugasan_id):
        raise HTTPException(status.HTTP_409_CONFLICT, "Laporan belum disetujui — administrasi belum dapat dimulai.")
    from app.export_surat import build_surat_penyampaian
    out = build_surat_penyampaian(
        Path(p.folder_path),
        nomor=str(payload.get("nomor", "")),
        tanggal=str(payload.get("tanggal", "")),
        tujuan=str(payload.get("tujuan", "")),
        perihal=str(payload.get("perihal", "")),
        auditi=str(payload.get("auditi", "")),
    )
    return {"ok": True, "path": str(out.relative_to(Path(p.folder_path))), "name": out.name}
