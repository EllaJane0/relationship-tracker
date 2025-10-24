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
    // In local development, use localhost:3001
    // In production (Vercel), use the serverless function
    const apiUrl = process.env.EXPO_PUBLIC_APP_URL
      ? `${process.env.EXPO_PUBLIC_APP_URL}/api/extract-metadata`
      : 'http://localhost:3001'; // Local metadata server

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for real fetching

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

    if (!response.ok) {
      console.warn('Metadata extraction failed:', response.status);
      return {
        title: null,
        imageUrl: null,
        price: null,
        description: null,
        success: false,
      };
    }

    const data = await response.json();

    if (data.success && data.metadata) {
      console.log('Metadata extracted successfully:', data.metadata.title);
      return {
        title: data.metadata.title,
        imageUrl: data.metadata.imageUrl,
        price: data.metadata.price,
        description: data.metadata.description,
        success: true,
      };
    }

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
      console.warn('Metadata extraction timeout');
    } else {
      console.error('Metadata extraction error:', error.message);
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
