import time
import random
import logging
from typing import Optional
from scrapling.fetchers import Fetcher
from .base import parse_price, extract_brand, is_relevant, clean_name, clean_query

log = logging.getLogger(__name__)

STORE_NAME = "Flipkart"
BASE_URL = "https://www.flipkart.com/search?q="

# Flipkart uses minified class names that change — current as of 2026-04
# The anchor a.k7wcnx wraps both the image (div.T6hTMI) and the info card (div.ZFwe0M.row)
# and carries the product href directly.
_CARD_SELECTORS  = ["a.k7wcnx", "div.ZFwe0M.row", "div._1AtVbE", "div._2kHMtA"]
_TITLE_SELECTORS = ["div.RG5Slk::text", "div._4rR01T::text", "a.s1Q9rs::text", "div.KzDlHZ::text"]
_PRICE_SELECTORS = ["div.hZ3P6w::text", "div._30jeq3::text", "div.Nx9bqj::text"]
_IMG_SELECTORS   = ["img.UCc1lI::attr(src)", "img._396cs4::attr(src)", "img._2r_T1I::attr(src)"]

_MAX_RETRIES = 3
_RETRY_DELAYS = [2, 5, 10]


def scrape(query: str, max_results: int = 25) -> list[dict]:
    search_term = clean_query(query) or query
    url = BASE_URL + search_term.replace(" ", "+")
    log.info("[Flipkart] Scraping: %s", url)

    cards = []
    for attempt, delay in enumerate([0] + _RETRY_DELAYS, start=1):
        if delay:
            time.sleep(delay * random.uniform(1.5, 3.0))
        try:
            page = Fetcher().get(url, follow_redirects=True)
            for sel in _CARD_SELECTORS:
                cards = page.css(sel)
                if cards:
                    break
            if cards:
                break
            log.warning("[Flipkart] No product cards on attempt %d, retrying…", attempt)
        except Exception as exc:
            log.warning("[Flipkart] Fetch error on attempt %d: %s", attempt, exc)

    if not cards:
        log.error("[Flipkart] All retries exhausted or no cards found")
        return []
    log.info("[Flipkart] Found %d product cards", len(cards))

    results: list[dict] = []
    for card in cards:
        if len(results) >= max_results:
            break
        try:
            item = _parse_card(card, search_term)
            if item:
                results.append(item)
        except Exception as exc:
            log.warning("[Flipkart] Card parse error: %s", exc)

    log.info("[Flipkart] Returning %d valid results", len(results))
    return results


def _parse_card(card, query: str) -> Optional[dict]:
    # ── Title ──────────────────────────────────────────────────────────────
    title: Optional[str] = None
    for sel in _TITLE_SELECTORS:
        raw = card.css(sel).get()
        if raw and raw.strip():
            title = raw.strip()
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
    # When card is a.k7wcnx the href is on the element itself; fallback to first child anchor
    href = card.attrib.get("href") or card.css("a[href*='/p/']::attr(href)").get() or ""
    product_url = href if href.startswith("http") else f"https://www.flipkart.com{href}"

    # ── Image ────────────────────────────────────────────────────────────────
    image_url = ""
    for sel in _IMG_SELECTORS:
        src = card.css(sel).get()
        if src:
            image_url = src
            break

    return {
        "productName": title,
        "brand": brand,
        "price": price,
        "currency": "INR",
        "productUrl": product_url,
        "imageUrl": image_url,
    }
