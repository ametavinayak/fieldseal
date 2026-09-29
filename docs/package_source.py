"""Build a source-only sharing archive without evidence data or private keys."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
output = root / "output" / "FieldSeal-SIH-source.zip"
files = []
for name in ["README.md", "SECURITY.md", "DESIGN.md", ".gitignore", ".gitattributes", "Start-FieldSeal.ps1"]:
    path = root / name
    if path.is_file():
        files.append(path)
for folder in ["backend/app", "backend/tests", "frontend/src", "frontend/scripts", "demo", "docs", ".github", "output/pdf"]:
    files.extend(p for p in (root / folder).rglob("*") if p.is_file() and "__pycache__" not in p.parts and p.suffix != ".pyc" and p.name not in {"STATE.md", "DIRECTION.md", "FINISH-REVIEW.md"})
for name in ["requirements.txt", "requirements-dev.txt"]:
    files.append(root / "backend" / name)
for name in ["package.json", "package-lock.json", "tsconfig.json", "vite.config.ts", "index.html"]:
    files.append(root / "frontend" / name)
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(set(files)):
        archive.write(path, "FieldSeal/" + path.relative_to(root).as_posix())
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    assert not any("/data/" in name or name.endswith(".pem") for name in archive.namelist())
print(f"{output}: {len(set(files))} files, {output.stat().st_size:,} bytes")
