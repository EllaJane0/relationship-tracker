/**
 * Metadata Service
 * Extracts product metadata from URLs using the serverless API endpoint
 */

import type { ProductMetadata } from '../types/list-models';

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if valid HTTP/HTTPS URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generate mock metadata for local development
 * This simulates metadata extraction when the API endpoint is unavailable
 */
function generateMockMetadata(url: string): ProductMetadata {
  // Extract domain for a more realistic mock title
  let domain = 'Product';
  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname.replace('www.', '').split('.')[0];
    domain = domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (e) {
    // Ignore parsing errors
  }

  // Generate mock data
  return {
    title: `${domain} Product - Sample Item`,
    imageUrl: 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=Product+Image',
    price: Math.floor(Math.random() * 100) + 9.99,
    description: `This is a sample product from ${domain}. In production, real metadata will be extracted.`,
    success: true,
  };
}

/**
 * Extract metadata from a product URL
 * Calls the /api/extract-metadata endpoint to avoid CORS issues
 *
 * @param url - Product URL to extract metadata from
 * @returns ProductMetadata object with title, imageUrl, price, description, and success flag
 */
export async function extractMetadata(url: string): Promise<ProductMetadata> {
  // Validate URL format
  if (!isValidUrl(url)) {
    return {
      title: null,
      imageUrl: null,
      price: null,
      description: null,
      success: false,
    };
  }

  try {
    // Determine API endpoint URL
    // Check if we're in production by looking at the window location
    const isProduction = typeof window !== 'undefined' &&
                        !window.location.hostname.includes('localhost') &&
                        !window.location.hostname.includes('127.0.0.1');

    const apiUrl = isProduction
      ? '/api/extract-metadata'  // Relative URL in production (Vercel)
      : (process.env.EXPO_PUBLIC_APP_URL
          ? `${process.env.EXPO_PUBLIC_APP_URL}/api/extract-metadata`
          : 'http://localhost:3001'); // Local metadata server

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`Fetching metadata from: ${apiUrl}`);

    // Call the metadata extraction API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Metadata extraction failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return {
        title: null,
        imageUrl: null,
        price: null,
        description: null,
        success: false,
      };
    }

    const data = await response.json();
    console.log('Metadata response:', data);

    if (data.success && data.metadata) {
      console.log('Metadata extracted successfully:', {
        title: data.metadata.title,
        hasImage: !!data.metadata.imageUrl,
        hasPrice: !!data.metadata.price
      });
      return {
        title: data.metadata.title,
        imageUrl: data.metadata.imageUrl,
        price: data.metadata.price,
        description: data.metadata.description,
        success: true,
      };
    }

    console.warn('Metadata extraction unsuccessful:', data);
    return {
      title: null,
      imageUrl: null,
      price: null,
      description: null,
      success: false,
    };
  } catch (error: any) {
    // Handle timeout or other errors
    if (error.name === 'AbortError') {
      console.warn('Metadata extraction timeout after 10 seconds');
    } else {
      console.error('Metadata extraction error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    return {
      title: null,
      imageUrl: null,
      price: null,
      description: null,
      success: false,
    };
  }
}
