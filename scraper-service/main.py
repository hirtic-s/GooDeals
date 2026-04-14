"""
GooDeals Scraper Service
Thin FastAPI wrapper around Scrapling-based store scrapers.
Run with: uvicorn main:app --port 8000
"""

import logging
from fastapi import FastAPI, Query, HTTPException
from scrapers import amazon, flipkart
from scrapers.base import clean_query

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s — %(message)s")

app = FastAPI(title="GooDeals Scraper Service", version="1.0.0")

_SCRAPERS = {
    "amazon":   amazon.scrape,
    "flipkart": flipkart.scrape,
}


@app.get("/scrape")
def scrape(
    store: str = Query(..., description="Target store: amazon | flipkart"),
    query: str = Query(..., min_length=1, max_length=200, description="Search query"),
    max_results: int = Query(25, ge=1, le=100, description="Max results to return"),
):
    scrape_fn = _SCRAPERS.get(store.lower())
    if not scrape_fn:
        raise HTTPException(status_code=400, detail=f"Unknown store '{store}'. Use: amazon, flipkart")

    # Remove conversational filler ("suggest me", "find", etc.) before scraping
    raw_query = query.strip()
    cleaned = clean_query(raw_query) or raw_query
    results = scrape_fn(cleaned, max_results)
    return {"store": store, "query": cleaned, "totalResults": len(results), "results": results}


@app.get("/health")
def health():
    return {"status": "ok"}
