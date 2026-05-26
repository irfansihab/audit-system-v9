"""Routes meta-skill Graduasi — suling penugasan jadi DRAFT skill spesifik.

Hanya PT/PM (pengembangan sistem, bukan pengawasan). Generate = DRAFT;
promote (manual) yang mendaftarkan skill ke registry.
"""
from pathlib import Path

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import graduasi as grad
from app.auth import get_current_user
from app.database import get_db
from app.models import Penugasan, Role, User
from app.storage import penugasan_folder

router = APIRouter(prefix="/graduasi", tags=["graduasi"])


def _require_dev(role: Role) -> None:
    if role not in (Role.PT, Role.PM):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"Graduasi skill hanya untuk PT/PM (pengembangan sistem). Role Anda: {role.value}.",
        )


@router.get("/candidates")
async def candidates(
    current: tuple[User, Role] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Penugasan yang punya temuan, dikelompokkan per skill — kandidat graduasi."""
    rows = (await db.execute(select(Penugasan))).scalars().all()
    groups: dict[str, list[dict]] = {}
    for p in rows:
        data = grad._read_temuan(penugasan_folder(p.kode))
        if not data or not grad._temuan_items(data):
            continue
        skill = p.skill if isinstance(p.skill, str) else p.skill.value
        groups.setdefault(skill, []).append({
            "kode": p.kode, "obyek": p.obyek, "n_temuan": len(grad._temuan_items(data)),
        })
    return {"groups": [{"skill": s, "penugasan": v} for s, v in sorted(groups.items())]}


@router.get("/drafts")
async def drafts(current: tuple[User, Role] = Depends(get_current_user)) -> dict:
    return {"drafts": grad.list_drafts()}


@router.post("/run")
async def run(
    body: dict = Body(...),
    current: tuple[User, Role] = Depends(get_current_user),
) -> dict:
    """Generate DRAFT skill dari beberapa penugasan (kode) skill sama."""
    _require_dev(current[1])
    kodes = body.get("penugasan_kodes") or body.get("kodes") or []
    if not isinstance(kodes, list) or not kodes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "penugasan_kodes wajib (list kode)")
    res = grad.generate_draft([str(k) for k in kodes], (body.get("nama") or "").strip() or None)
    if not res.get("ok"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "; ".join(res.get("issues", ["gagal generate"])))
    return res


@router.post("/promote")
async def promote(
    body: dict = Body(...),
    current: tuple[User, Role] = Depends(get_current_user),
) -> dict:
    _require_dev(current[1])
    nama = (body.get("nama") or "").strip()
    if not nama:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "nama draft wajib")
    res = grad.promote(nama)
    if not res.get("ok"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, res.get("error", "gagal promote"))
    return res


@router.post("/reject")
async def reject(
    body: dict = Body(...),
    current: tuple[User, Role] = Depends(get_current_user),
) -> dict:
    _require_dev(current[1])
    nama = (body.get("nama") or "").strip()
    if not nama:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "nama draft wajib")
    res = grad.reject(nama)
    if not res.get("ok"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, res.get("error", "gagal reject"))
    return res
