#!/usr/bin/env python3
"""Normalize site images, preserve generated sources, and emit production WebP copies."""
from __future__ import annotations

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
SOURCES = ASSETS / "generated-source"
PAIRS = {
    "living": "transformation-living-diptych.jpg",
    "bedroom": "transformation-bedroom-diptych.jpg",
    "kitchen": "transformation-kitchen-diptych.jpg",
    "full-home": "transformation-fullhome-diptych.jpg",
}
PHOTO_STEMS = [
    "spm-hero-bangalore", "materials-study", "service-dining", "service-bathroom",
    "service-wardrobe", "service-lighting", "service-commercial", "service-office-furniture",
    "service-space-saving", "interiorsvideo-poster",
]


def archive_source(path: Path, name: str | None = None) -> None:
    SOURCES.mkdir(parents=True, exist_ok=True)
    with Image.open(path) as image:
        target = SOURCES / (name or f"{path.stem}.png")
        image.save(target, format="PNG", optimize=True)


def save_jpeg(image: Image.Image, destination: Path, max_width: int = 1900) -> None:
    image = image.convert("RGB")
    if image.width > max_width:
        height = round(image.height * max_width / image.width)
        image = image.resize((max_width, height), Image.Resampling.LANCZOS)
    image.save(destination, format="JPEG", quality=88, optimize=True, progressive=True, subsampling=0)


def normalize_photo(stem: str) -> None:
    source = ASSETS / f"{stem}.jpg"
    if not source.exists():
        raise SystemExit(f"Required generated source image is missing: {source}")
    max_width = 2300 if stem == "spm-hero-bangalore" else 1900
    with Image.open(source) as image:
        if image.format == "JPEG" and image.width <= max_width:
            print(f"Already normalized {source.name}")
            return
        if image.format != "JPEG":
            archive_source(source, f"{stem}.png")
        optimized = image.copy()
    save_jpeg(optimized, source, max_width)
    print(f"Optimized {source.name}")


def split_pair(name: str, source_name: str) -> None:
    source = ASSETS / source_name
    if not source.exists():
        before = ASSETS / f"{name}-before.jpg"
        after = ASSETS / f"{name}-after.jpg"
        if before.exists() and after.exists():
            print(f"Already split {name} comparison")
            return
        raise SystemExit(f"Required before/after source image is missing: {source}")
    with Image.open(source) as image:
        image = image.convert("RGB")
        if image.width % 2:
            raise SystemExit(f"Expected an even-width generated diptych: {source}")
        midpoint = image.width // 2
        archive_source(source, source.stem + ".png")
        before = image.crop((0, 0, midpoint, image.height))
        after = image.crop((midpoint, 0, image.width, image.height))
        save_jpeg(before, ASSETS / f"{name}-before.jpg", 1600)
        save_jpeg(after, ASSETS / f"{name}-after.jpg", 1600)
    source.unlink()
    print(f"Split {source.name} into {name}-before.jpg and {name}-after.jpg")


def main() -> None:
    for stem in PHOTO_STEMS:
        normalize_photo(stem)
    for name, source in PAIRS.items():
        split_pair(name, source)
    webp_stems = PHOTO_STEMS + [f"{name}-{side}" for name in PAIRS for side in ("before", "after")]
    for stem in webp_stems:
        jpeg = ASSETS / f"{stem}.jpg"
        webp = ASSETS / f"{stem}.webp"
        with Image.open(jpeg) as image:
            image.convert("RGB").save(webp, format="WEBP", quality=84, method=6)
        print(f"Generated production asset {webp.name}")
    print("Original generated source images are preserved under assets/generated-source/.")


if __name__ == "__main__":
    main()
