from firecrawl import FirecrawlApp
from typing import Optional, Dict, Any, List
from app.config import settings


class FirecrawlService:
    """Service for web search and scraping using Firecrawl."""

    def __init__(self):
        """Initialize Firecrawl client."""
        self.client = FirecrawlApp(api_key=settings.firecrawl_api_key)

    async def search_web(
        self,
        query: str,
        limit: int = 5,
        format: str = "markdown"
    ) -> Dict[str, Any]:
        """
        Search the web using Firecrawl.

        Args:
            query: Search query
            limit: Maximum number of results to return (default: 5)
            format: Output format - 'markdown', 'html', or 'links' (default: 'markdown')

        Returns:
            Dict containing search results and metadata

        Raises:
            Exception: If search fails
        """
        try:
            # Perform web search using Firecrawl
            results = self.client.search(
                query=query,
                limit=limit
            )

            # Extract and format results
            formatted_results = []
            
            if results and 'data' in results:
                for item in results['data'][:limit]:
                    result_data = {
                        'title': item.get('title', ''),
                        'url': item.get('url', ''),
                        'description': item.get('description', ''),
                    }
                    
                    # Add content based on format
                    if format == 'markdown':
                        result_data['content'] = item.get('markdown', item.get('content', ''))
                    elif format == 'html':
                        result_data['content'] = item.get('html', item.get('content', ''))
                    elif format == 'links':
                        # Only include title, url, and description
                        pass
                    else:
                        result_data['content'] = item.get('content', '')
                    
                    formatted_results.append(result_data)

            return {
                "success": True,
                "query": query,
                "results": formatted_results,
                "count": len(formatted_results)
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Firecrawl search error: {str(e)}",
                "query": query,
                "results": [],
                "count": 0
            }

    async def scrape_url(
        self,
        url: str,
        formats: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Scrape content from a URL using Firecrawl.

        Args:
            url: URL to scrape
            formats: List of formats to return ('markdown', 'html', 'links', 'screenshot')

        Returns:
            Dict containing scraped content and metadata

        Raises:
            Exception: If scraping fails
        """
        if formats is None:
            formats = ['markdown']

        try:
            # Scrape URL using Firecrawl
            result = self.client.scrape_url(
                url=url,
                params={
                    'formats': formats
                }
            )

            scraped_data = {
                'url': url,
                'title': result.get('metadata', {}).get('title', ''),
                'description': result.get('metadata', {}).get('description', ''),
            }

            # Add requested formats
            if 'markdown' in formats:
                scraped_data['markdown'] = result.get('markdown', '')
            if 'html' in formats:
                scraped_data['html'] = result.get('html', '')
            if 'links' in formats:
                scraped_data['links'] = result.get('links', [])
            if 'screenshot' in formats:
                scraped_data['screenshot'] = result.get('screenshot', '')

            return {
                "success": True,
                "data": scraped_data
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Firecrawl scraping error: {str(e)}",
                "url": url
            }

    async def crawl_website(
        self,
        url: str,
        max_depth: int = 2,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Crawl a website using Firecrawl.

        Args:
            url: Starting URL to crawl
            max_depth: Maximum depth to crawl (default: 2)
            limit: Maximum number of pages to crawl (default: 10)

        Returns:
            Dict containing crawled pages and metadata

        Raises:
            Exception: If crawling fails
        """
        try:
            # Start crawl job
            crawl_result = self.client.crawl_url(
                url=url,
                params={
                    'maxDepth': max_depth,
                    'limit': limit
                }
            )

            return {
                "success": True,
                "url": url,
                "data": crawl_result
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Firecrawl crawling error: {str(e)}",
                "url": url
            }


# Singleton instance
firecrawl_service = FirecrawlService()
