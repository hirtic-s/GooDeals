import re
from typing import Optional

ACCESSORY_KEYWORDS = {
    "charger", "cable", "adapter", "case", "cover", "protector",
    "sleeve", "stand", "dock", "hub", "holder", "pouch", "skin",
    "screen guard", "tempered glass", "earphone", "headphone",
    "back cover", "flip cover", "bumper",
}

# Apple products omit "Apple" from the listing title on Amazon/Flipkart
_APPLE_PREFIXES = ("iphone", "ipad", "macbook", "airpods", "imac", "apple watch")

def parse_price(raw: Optional[str]) -> Optional[float]:
    if not raw:
        return None
    cleaned = re.sub(r"[₹$€£¥,\s]", "", raw)
    cleaned = re.sub(r"[^\d.]", "", cleaned)
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None

def extract_brand(title: str) -> str:
    if not title:
        return ""
    lower = title.lower()
    for prefix in _APPLE_PREFIXES:
        if lower.startswith(prefix):
            return "Apple"
    parts = title.split()
    return parts[0] if parts else ""

def clean_name(title: str, brand: str = "") -> str:
    """
    Returns a concise "Brand Model" name, stripping long marketing suffixes.

    Strategy:
    1. Strip everything after the first ':' (e.g. ": 15.93 cm (6.3″) Display…")
    2. Strip everything after '(' when it looks like a spec list — keep if it's
       storage/color info at the start (e.g. "(Black, 256 GB)").
    3. Collapse multiple spaces.
    4. Prepend brand if missing.
    """
    if not title:
        return title

    # Remove content after first colon
    title = title.split(":")[0].strip()

    # Remove parenthetical specs that are NOT color/storage — e.g. "(15.93 cm…)"
    # Keep "(Black, 256 GB)" style parentheticals
    def _should_strip_parens(inner: str) -> bool:
        """Return True if the parenthetical looks like a long spec string."""
        return len(inner) > 30 or any(c in inner for c in ("cm", "inch", "Hz", "mAh", "MP"))

    title = re.sub(
        r"\(([^)]+)\)",
        lambda m: "" if _should_strip_parens(m.group(1)) else m.group(0),
        title,
    ).strip()

    # Collapse extra whitespace
    title = re.sub(r"\s{2,}", " ", title).strip()

    # Prepend brand if not already in title
    if brand and not title.lower().startswith(brand.lower()):
        title = f"{brand} {title}"

    return title


def is_relevant(title: str, query: str) -> bool:
    """
    Returns True only when:
      1. The title contains no accessory keywords.
      2. Every query word (len >= 2) appears in the title.
    """
    if not title or not query:
        return False
    lower_title = title.lower()
    for kw in ACCESSORY_KEYWORDS:
        if kw in lower_title:
            return False
    for word in query.lower().split():
        if len(word) >= 2 and word not in lower_title:
            return False
    return True
