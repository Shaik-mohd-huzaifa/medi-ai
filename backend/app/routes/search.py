from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from app.services.firecrawl_service import firecrawl_service

router = APIRouter(prefix="/api/v1/search", tags=["search"])


class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5
    format: Optional[str] = "markdown"


class ScrapeRequest(BaseModel):
    url: HttpUrl
    formats: Optional[List[str]] = ["markdown"]


class CrawlRequest(BaseModel):
    url: HttpUrl
    max_depth: Optional[int] = 2
    limit: Optional[int] = 10


@router.post("/web")
async def search_web(request: SearchRequest):
    """
    Search the web using Firecrawl.

    Args:
        request: SearchRequest with query, limit, and format options

    Returns:
        Search results with titles, URLs, descriptions, and content

    Raises:
        HTTPException: If search fails
    """
    try:
        results = await firecrawl_service.search_web(
            query=request.query,
            limit=request.limit,
            format=request.format
        )

        if not results.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=results.get("error", "Web search failed"),
            )

        return results

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Web search failed: {str(e)}",
        )


@router.post("/scrape")
async def scrape_url(request: ScrapeRequest):
    """
    Scrape content from a specific URL using Firecrawl.

    Args:
        request: ScrapeRequest with URL and format options

    Returns:
        Scraped content in requested formats

    Raises:
        HTTPException: If scraping fails
    """
    try:
        result = await firecrawl_service.scrape_url(
            url=str(request.url),
            formats=request.formats
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "URL scraping failed"),
            )

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"URL scraping failed: {str(e)}",
        )


@router.post("/crawl")
async def crawl_website(request: CrawlRequest):
    """
    Crawl a website starting from a URL using Firecrawl.

    Args:
        request: CrawlRequest with URL, max depth, and limit options

    Returns:
        Crawled pages and content

    Raises:
        HTTPException: If crawling fails
    """
    try:
        result = await firecrawl_service.crawl_website(
            url=str(request.url),
            max_depth=request.max_depth,
            limit=request.limit
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Website crawling failed"),
            )

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Website crawling failed: {str(e)}",
        )
