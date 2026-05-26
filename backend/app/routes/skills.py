"""Routes Skill — daftar skill pengawasan terdaftar (folder-driven).

Dipakai frontend untuk dropdown jenis penugasan (dinamis, bukan hardcode).
Read-only; sumber data = app.skills_registry (path APP_SKILLS_PATH).
"""
from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.models import Role, User
from app.skills_registry import list_skills

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("")
async def get_skills(
    _current: tuple[User, Role] = Depends(get_current_user),
) -> list[dict]:
    """Daftar skill terdaftar (slug, name, jenis, output, has_pipeline)."""
    return [
        {
            "slug": s["slug"],
            "name": s["name"],
            "jenis": s["jenis"],
            "output": s["output"],
            "has_pipeline": s["has_pipeline"],
        }
        for s in list_skills()
    ]
