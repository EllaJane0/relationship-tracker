/**
 * useMetadata Hook
 * Custom hook for extracting metadata from product URLs
 */

import { useState } from 'react';
import * as metadataService from '../services/metadataService';
import type { ProductMetadata } from '../types/list-models';

interface UseMetadataReturn {
  extractMetadata: (url: string) => Promise<ProductMetadata>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for extracting product metadata from URLs
 */
export function useMetadata(): UseMetadataReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractMetadata = async (url: string): Promise<ProductMetadata> => {
    setLoading(true);
    setError(null);

    try {
      const metadata = await metadataService.extractMetadata(url);

      if (!metadata.success) {
        setError('Could not extract metadata from URL');
      }

      return metadata;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to extract metadata';
      setError(errorMessage);

      // Return unsuccessful metadata instead of throwing
      return {
        title: null,
        imageUrl: null,
        price: null,
        description: null,
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    extractMetadata,
    loading,
    error,
  };
}
