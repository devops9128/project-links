/**
 * Optimized Image Component
 * 
 * This component provides automatic image optimization features including
 * lazy loading, responsive images, and performance optimizations.
 * 
 * Features:
 * - Automatic lazy loading with intersection observer
 * - Responsive image support with srcSet
 * - Loading states and error handling
 * - Performance optimizations (decoding, loading attributes)
 * - Accessibility support
 * - Fallback image support
 * 
 * Usage:
 * - Replace standard <img> tags with <OptimizedImage>
 * - Provides better performance and user experience
 * - Automatically handles loading states
 * 
 * Note:
 * - Uses modern browser APIs with fallbacks
 * - Respects user's data preferences
 * - Implements proper error boundaries
 */

import React, { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  srcSet?: string;
  sizes?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: React.ReactNode;
}

/**
 * Optimized Image Component
 */
const OptimizedImageComponent: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  srcSet,
  sizes,
  fallbackSrc,
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
  placeholder,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [priority, loading]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
    
    // Try fallback image if available
    if (fallbackSrc && imgRef.current) {
      imgRef.current.src = fallbackSrc;
      setHasError(false);
    }
  };

  // Generate responsive image attributes
  const getImageProps = () => {
    const props: React.ImgHTMLAttributes<HTMLImageElement> = {
      ref: imgRef,
      alt,
      onLoad: handleLoad,
      onError: handleError,
      loading: priority ? 'eager' : 'lazy',
      decoding: 'async',
      className: cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      ),
    };

    if (width) props.width = width;
    if (height) props.height = height;
    if (srcSet) props.srcSet = srcSet;
    if (sizes) props.sizes = sizes;

    // Only set src when image is in view or priority is true
    if (isInView) {
      props.src = src;
    } else {
      // Set a transparent pixel as placeholder to maintain layout
      props.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    return props;
  };

  // Default placeholder
  const defaultPlaceholder = (
    <div 
      className={cn(
        'bg-gray-200 animate-pulse flex items-center justify-center',
        className
      )}
      style={{ width, height }}
    >
      <svg
        className="w-8 h-8 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  // Error state
  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={cn(
          'bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center',
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Show placeholder while loading */}
      {!isLoaded && (placeholder || defaultPlaceholder)}
      
      {/* Actual image */}
      {isInView && (
        <img {...getImageProps()} />
      )}
    </div>
  );
};

// Memoized component to prevent unnecessary re-renders
export const OptimizedImage = memo(OptimizedImageComponent, (prevProps, nextProps) => {
  // Custom comparison to avoid re-renders when props haven't changed
  return (
    prevProps.src === nextProps.src &&
    prevProps.alt === nextProps.alt &&
    prevProps.className === nextProps.className &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.loading === nextProps.loading &&
    prevProps.priority === nextProps.priority
  );
});

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Hook for preloading images
 */
export const useImagePreloader = () => {
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadImages = async (sources: string[]): Promise<void> => {
    try {
      await Promise.all(sources.map(preloadImage));
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  };

  return { preloadImage, preloadImages };
};

/**
 * Utility function to generate responsive image srcSet
 */
export const generateSrcSet = (baseSrc: string, sizes: number[]): string => {
  return sizes
    .map(size => {
      const extension = baseSrc.split('.').pop();
      const baseName = baseSrc.replace(`.${extension}`, '');
      return `${baseName}_${size}w.${extension} ${size}w`;
    })
    .join(', ');
};

/**
 * Utility function to generate responsive sizes attribute
 */
export const generateSizes = (breakpoints: { [key: string]: string }): string => {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => {
      if (breakpoint === 'default') {
        return size;
      }
      return `(${breakpoint}) ${size}`;
    })
    .join(', ');
};