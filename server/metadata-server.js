/**
 * Local Metadata Extraction Server
 * Runs on port 3001 to handle metadata extraction during local development
 * This bypasses CORS restrictions that prevent direct fetching from the browser
 */

const http = require('http');
const https = require('https');

const PORT = 3001;

/**
 * Extract Open Graph meta tag content from HTML
 */
function extractOGTag(html, property) {
  try {
    const regex = new RegExp(
      `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
      'i'
    );
    const match = html.match(regex);
    if (match && match[1]) return match[1];

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
 */
function extractTag(html, tag) {
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
 */
function extractPrice(html) {
  try {
    // Try schema.org JSON-LD
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    const jsonLdMatches = html.matchAll(jsonLdRegex);

    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1]);
        if (data['@type'] === 'Product' && data.offers) {
          const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offers.price) {
            const price = parseFloat(offers.price);
            if (!isNaN(price)) return price;
          }
        }
      } catch (e) {
        // Continue
      }
    }

    // Try common price patterns
    const pricePatterns = [
      /"price"\s*:\s*"?(\d+\.?\d*)"?/i,
      /\$(\d+\.?\d+)/,
      /price[^>]*>.*?\$?(\d+\.?\d+)/i,
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const price = parseFloat(match[1]);
        if (!isNaN(price) && price > 0) return price;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch HTML from URL
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    };

    const req = protocol.get(url, options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let html = '';
      res.on('data', (chunk) => {
        html += chunk;
      });
      res.on('end', () => {
        resolve(html);
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * HTTP Server
 */
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    return;
  }

  // Parse request body
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { url } = JSON.parse(body);

      if (!url || typeof url !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid URL' }));
        return;
      }

      console.log(`Extracting metadata from: ${url}`);

      // Fetch and parse HTML
      const html = await fetchUrl(url);

      const metadata = {
        title: extractOGTag(html, 'og:title') || extractTag(html, 'title'),
        imageUrl: extractOGTag(html, 'og:image'),
        price: extractPrice(html),
        description: extractOGTag(html, 'og:description'),
      };

      console.log('Extracted:', metadata.title ? metadata.title.substring(0, 50) + '...' : 'No title');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, metadata }));

    } catch (error) {
      console.error('Error:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: `Failed to extract metadata: ${error.message}`
      }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Metadata extraction server running on http://localhost:${PORT}`);
  console.log('This server handles real metadata extraction for local development.\n');
});
