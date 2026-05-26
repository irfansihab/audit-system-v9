"""Tool fill_lke — isi Lembar Kerja Evaluasi (LKE) Excel untuk skill evaluasi
(SAKIP/SPIP) TANPA mengubah rumus. Hanya cell input yang ditulis; cell formula
& sheet agregator DITOLAK.

Sumber LKE:
  - SPIP: template ber-rumus yang dibawa skill (knowledge/skills/evaluasi-spip/
    references/templates/lke-spip-kementerian.xlsx + cell-map).
  - SAKIP / lainnya: LKE .xlsx yang DIUPLOAD auditor ke folder penugasan.
Output ditulis ke salinan kerja `_KKP/LKE-terisi-<skill>.xlsx` (template/upload
asli tidak pernah diubah).
"""
import json
import re
import shutil
from pathlib import Path

from claude_agent_sdk import tool

from app.config import get_settings
from app.lke_writer import LKEWriter

# Sheet agregator SPIP (formula-only) — tak boleh ditulis.
_SPIP_AGGREGATORS = {"KKlead I KL", "KKLEAD II", "KKLEAD III", "KKLEAD_SPIP"}


def _slug(skill: str) -> str:
    return re.sub(r"[^a-z0-9\-]", "-", str(skill).strip().lower())


def _spip_template() -> tuple[Path, Path]:
    base = get_settings().skills_path / "evaluasi-spip" / "references" / "templates"
    return base / "lke-spip-kementerian.xlsx", base / "cell-map-formulas.json"


def _find_uploaded_xlsx(folder: Path) -> Path | None:
    """Cari LKE .xlsx yang diupload auditor di subfolder input penugasan.

    Abaikan output kerja (_KKP/_LHP/_QA-SAIPI) supaya tidak memungut hasil sendiri.
    """
    skip = {"_KKP", "_LHP", "_QA-SAIPI", "_INGESTED"}
    candidates: list[Path] = []
    for p in folder.rglob("*.xlsx"):
        if any(part in skip for part in p.relative_to(folder).parts):
            continue
        if p.name.startswith("~$"):  # lock file Excel
            continue
        candidates.append(p)
    return sorted(candidates)[0] if candidates else None


def _resolve_source(folder: Path, skill: str) -> tuple[Path | None, Path | None, str]:
    """Tentukan (source_xlsx, cellmap, note). Prefer upload auditor; SPIP fallback ke template."""
    uploaded = _find_uploaded_xlsx(folder)
    if uploaded is not None:
        return uploaded, None, f"LKE dari upload: {uploaded.name}"
    if _slug(skill) == "evaluasi-spip":
        tpl, cmap = _spip_template()
        if tpl.is_file():
            return tpl, (cmap if cmap.is_file() else None), f"LKE template SPIP: {tpl.name}"
    return None, None, "tidak ada LKE — upload file .xlsx LKE dulu"


@tool(
    "fill_lke",
    "Isi Lembar Kerja Evaluasi (LKE) Excel untuk skill evaluasi (SAKIP/SPIP) TANPA "
    "mengubah rumus — hanya cell INPUT yang ditulis; cell formula & sheet agregator "
    "DITOLAK otomatis (dilaporkan di 'refused'). Sumber: LKE .xlsx yang diupload "
    "auditor, atau template SPIP bawaan. Output: _KKP/LKE-terisi-<skill>.xlsx (asli "
    "tak diubah). `entries` = list of {sheet, coord (mis. 'K6'), value, note?}. "
    "Pakai SEBELUM menyusun catatan/temuan untuk skill ber-LKE.",
    {"penugasan_folder": str, "skill": str, "entries": list},
)
async def fill_lke(args: dict) -> dict:
    folder = Path(args["penugasan_folder"])
    skill = str(args.get("skill", "")).strip()
    entries = args.get("entries") or []
    if not isinstance(entries, list) or not entries:
        return {"content": [{"type": "text", "text": "FAILED|entries kosong (list of {sheet,coord,value})"}], "is_error": True}

    src, cellmap, note = _resolve_source(folder, skill)
    if src is None:
        return {"content": [{"type": "text", "text": f"FAILED|{note}"}], "is_error": True}

    out = folder / "_KKP" / f"LKE-terisi-{_slug(skill)}.xlsx"
    out.parent.mkdir(parents=True, exist_ok=True)
    # Mulai dari salinan kerja yang sudah ada (akumulatif) bila ada, else dari source.
    base = out if out.is_file() else src
    try:
        writer = LKEWriter(
            base, cellmap_path=cellmap,
            aggregator_sheets=_SPIP_AGGREGATORS if _slug(skill) == "evaluasi-spip" else None,
        )
    except Exception as e:  # noqa: BLE001
        return {"content": [{"type": "text", "text": f"FAILED|gagal buka LKE: {e}"}], "is_error": True}

    for e in entries:
        if not isinstance(e, dict):
            continue
        writer.set(str(e.get("sheet", "")), str(e.get("coord", "")), e.get("value"), e.get("note"))
    writer.save(out)

    payload = {
        "ok": True,
        "sumber": note,
        "output": str(out.relative_to(folder)),
        "ditulis": len(writer.written),
        "ditolak_formula": writer.refused,  # cell yg ditolak (formula/agregator) — pilih cell input lain
    }
    return {"content": [{"type": "text", "text": json.dumps(payload, ensure_ascii=False)[:4000]}]}


LKE_TOOLS = [fill_lke]
