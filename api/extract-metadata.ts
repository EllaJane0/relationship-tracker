import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Metadata Extraction API Endpoint
 *
 * Purpose: Extract product metadata from URLs to avoid CORS issues
 * and provide automatic product information for list items.
 *
 * This serverless function fetches HTML from product URLs and extracts:
 * - Title (Open Graph or standard title tag)
 * - Image URL (Open Graph image)
 * - Price (schema.org structured data)
 * - Description (Open Graph description)
 */

interface MetadataResponse {
  success: boolean;
  metadata?: {
    title: string | null;
    imageUrl: string | null;
    price: number | null;
    description: string | null;
  };
  error?: string;
}

/**
 * Extract Open Graph meta tag content from HTML
 * @param html - HTML content to parse
 * @param property - Open Graph property name (e.g., 'og:title')
 * @returns Extracted content or null
 */
function extractOGTag(html: string, property: string): string | null {
  try {
    // Match Open Graph meta tags: <meta property="og:title" content="...">
    const regex = new RegExp(
      `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
      'i'
    );
    const match = html.match(regex);

    if (match && match[1]) {
      return match[1];
    }

    // Also try reversed order: <meta content="..." property="og:title">
    const reverseRegex = new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`,
      'i'
    );
    const reverseMatch = html.match(reverseRegex);

    return reverseMatch && reverseMatch[1] ? reverseMatch[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Extract standard HTML tag content
 * @param html - HTML content to parse
 * @param tag - HTML tag name (e.g., 'title')
 * @returns Extracted content or null
 */
function extractTag(html: string, tag: string): string | null {
  try {
    const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
    const match = html.match(regex);
    return match && match[1] ? match[1].trim() : null;
  } catch (error) {
    return null;
  }
}

/**
 * Extract price from schema.org structured data or common patterns
 * @param html - HTML content to parse
 * @returns Extracted price as number or null
 */
function extractPrice(html: string): number | null {
  try {
    // Try schema.org JSON-LD structured data
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    const jsonLdMatches = html.matchAll(jsonLdRegex);

    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1]);

        // Check for Product schema with offers
        if (data['@type'] === 'Product' && data.offers) {
          const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offers.price) {
            const price = parseFloat(offers.price);
            if (!isNaN(price)) return price;
          }
        }
      } catch (e) {
        // Continue to next JSON-LD block
      }
    }

    // Try common price patterns in HTML
    const pricePatterns = [
      /"price"\s*:\s*"?(\d+\.?\d*)"?/i,
      /\$(\d+\.?\d+)/,
      /price[^>]*>.*?\$?(\d+\.?\d+)/i,
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const price = parseFloat(match[1]);
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Main handler function for the API endpoint
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
    return;
  }

  const { url } = req.body;

  // Validate URL parameter
  if (!url || typeof url !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Invalid request. URL is required.'
    });
    return;
  }

  // Validate URL format
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      res.status(400).json({
        success: false,
        error: 'Invalid URL. Only HTTP and HTTPS protocols are supported.',
      });
      return;
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid URL format.',
    });
    return;
  }

  try {
    // Fetch HTML from the URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ChristmasListBot/1.0; +https://christmaslist.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      res.status(500).json({
        success: false,
        error: `Failed to fetch URL. Status: ${response.status}`,
      });
      return;
    }

    const html = await response.text();

    // Extract metadata from HTML
    const metadata = {
      title: extractOGTag(html, 'og:title') || extractTag(html, 'title'),
      imageUrl: extractOGTag(html, 'og:image'),
      price: extractPrice(html),
      description: extractOGTag(html, 'og:description') || extractTag(html, 'meta[name="description"]'),
    };

    // Return successful response
    res.status(200).json({
      success: true,
      metadata,
    } as MetadataResponse);

  } catch (error: any) {
    // Handle timeout
    if (error.name === 'AbortError') {
      res.status(408).json({
        success: false,
        error: 'Request timeout. The URL took too long to respond.',
      });
      return;
    }

    // Handle other errors
    console.error('Metadata extraction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract metadata from the URL.',
    });
  }
}
