import re
import time
import random
import logging
from typing import Optional
from scrapling.fetchers import Fetcher
from .base import parse_price, extract_brand, is_relevant, clean_name, clean_query

log = logging.getLogger(__name__)

_SPONSORED_RE = re.compile(r"(?i)^sponsored\s+ad\s+-\s+")

STORE_NAME = "Amazon"
BASE_URL = "https://www.amazon.in/s?k="

# Title selectors tried in order — aria-label is the most reliable in current Amazon HTML
_TITLE_SELECTORS = [
    "h2[aria-label]::attr(aria-label)",
    "h2 a span.a-size-medium::text",
    "h2 a span.a-color-base::text",
    "h2 a span.a-text-normal::text",
    "h2 a span::text",
    "h2 a::text",
    "h2 span::text",
]

_PRICE_SELECTORS = [
    "span.a-offscreen::text",
    "span.a-price-whole::text",
]

_MAX_RETRIES = 3
_RETRY_DELAYS = [2, 5, 10]   # seconds between retries

# Real Chrome UA strings rotated per attempt to reduce 503 fingerprinting
_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
]


def scrape(query: str, max_results: int = 25) -> list[dict]:
    # Strip conversational filler before building the search URL
    search_term = clean_query(query) or query
    url = BASE_URL + search_term.replace(" ", "+")
    log.info("[Amazon] Scraping: %s", url)

    page = None
    for attempt, delay in enumerate([0] + _RETRY_DELAYS, start=1):
        if delay:
            time.sleep(delay * random.uniform(1.5, 3.0))
        try:
            ua = _USER_AGENTS[(attempt - 1) % len(_USER_AGENTS)]
            page = Fetcher().get(
                url,
                follow_redirects=True,
                headers={"User-Agent": ua},
            )
            if page.css("div[data-component-type=s-search-result]"):
                break
            log.warning("[Amazon] No product cards on attempt %d (possible block), retrying…", attempt)
            page = None
        except Exception as exc:
            log.warning("[Amazon] Fetch error on attempt %d: %s", attempt, exc)
            page = None

    if page is None:
        log.error("[Amazon] All retries exhausted")
        return []

    cards = page.css("div[data-component-type=s-search-result]")
    log.info("[Amazon] Found %d product cards", len(cards))

    results: list[dict] = []
    for card in cards:
        if len(results) >= max_results:
            break
        try:
            item = _parse_card(card, search_term)
            if item:
                results.append(item)
        except Exception as exc:
            log.warning("[Amazon] Card parse error: %s", exc)

    log.info("[Amazon] Returning %d valid results", len(results))
    return results


def _parse_card(card, query: str) -> Optional[dict]:
    # ── Title ──────────────────────────────────────────────────────────────
    title: Optional[str] = None
    for sel in _TITLE_SELECTORS:
        raw = card.css(sel).get()
        if raw and raw.strip():
            title = _SPONSORED_RE.sub("", raw).strip()
            break
    if not title:
        return None

    if not is_relevant(title, query):
        return None

    brand = extract_brand(title)
    title = clean_name(title, brand)

    # ── Price ───────────────────────────────────────────────────────────────
    price_raw: Optional[str] = None
    for sel in _PRICE_SELECTORS:
        raw = card.css(sel).get()
        if raw and raw.strip():
            price_raw = raw.strip()
            break

    price = parse_price(price_raw)
    if not price or price <= 0:
        return None

    # ── URL ─────────────────────────────────────────────────────────────────
    href = card.css("a.a-link-normal::attr(href)").get() or ""
    product_url = href if href.startswith("http") else f"https://www.amazon.in{href}"

    # ── Image ────────────────────────────────────────────────────────────────
    image_url = card.css("img.s-image::attr(src)").get() or ""

    return {
        "productName": title,
        "brand": brand,
        "price": price,
        "currency": "INR",
        "productUrl": product_url,
        "imageUrl": image_url,
    }
