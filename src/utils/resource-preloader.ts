/**
 * Resource Preloader Utility
 * 
 * This utility provides functions for preloading critical resources
 * to improve application performance and user experience.
 * 
 * Features:
 * - Preload critical JavaScript modules
 * - Preload CSS stylesheets
 * - Preload images and other assets
 * - DNS prefetch for external domains
 * - Resource hints for better loading performance
 * 
 * Usage:
 * - Call preloadCriticalResources() on app initialization
 * - Use individual preload functions as needed
 * - Implement in main.tsx or App.tsx for best results
 * 
 * Note:
 * - Uses modern browser APIs with fallbacks
 * - Respects user's connection speed preferences
 * - Implements error handling for failed preloads
 */

/**
 * Check if the browser supports resource preloading
 */
const supportsPreload = (): boolean => {
  const link = document.createElement('link');
  return link.relList && link.relList.supports && link.relList.supports('preload');
};

/**
 * Check if the browser supports module preloading
 */
const supportsModulePreload = (): boolean => {
  const link = document.createElement('link');
  return link.relList && link.relList.supports && link.relList.supports('modulepreload');
};

/**
 * Get user's connection speed preference
 */
const getConnectionSpeed = (): 'slow' | 'fast' => {
  // Check for Save-Data header or slow connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return 'slow';
    }
  }
  return 'fast';
};

/**
 * Preload a JavaScript module
 */
export const preloadModule = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!supportsModulePreload()) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload module: ${href}`));
    
    document.head.appendChild(link);
  });
};

/**
 * Preload a CSS stylesheet
 */
export const preloadStylesheet = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!supportsPreload()) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload stylesheet: ${href}`));
    
    document.head.appendChild(link);
  });
};

/**
 * Preload an image
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};

/**
 * Preload a font
 */
export const preloadFont = (href: string, type: string = 'font/woff2'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!supportsPreload()) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = type;
    link.href = href;
    link.crossOrigin = 'anonymous';
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload font: ${href}`));
    
    document.head.appendChild(link);
  });
};

/**
 * DNS prefetch for external domains
 */
export const dnsPrefetch = (domain: string): void => {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;
  document.head.appendChild(link);
};

/**
 * Preconnect to external domains
 */
export const preconnect = (domain: string, crossorigin: boolean = false): void => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
};

/**
 * Preload critical resources for the application
 */
export const preloadCriticalResources = async (): Promise<void> => {
  const connectionSpeed = getConnectionSpeed();
  
  // Skip preloading on slow connections to save bandwidth
  if (connectionSpeed === 'slow') {
    console.log('Skipping resource preloading due to slow connection');
    return;
  }

  try {
    // DNS prefetch for external services
    dnsPrefetch('//fonts.googleapis.com');
    dnsPrefetch('//fonts.gstatic.com');
    
    // Preconnect to Supabase if configured
    if (import.meta.env.VITE_SUPABASE_URL) {
      preconnect(import.meta.env.VITE_SUPABASE_URL, true);
    }

    // Preload critical route modules (only on fast connections)
    const criticalModules = [
      '/src/pages/Home.tsx',
      '/src/pages/tasks/task-list.tsx',
      '/src/components/layout/header.tsx',
      '/src/components/layout/sidebar.tsx',
    ];

    const preloadPromises = criticalModules.map(module => 
      preloadModule(module).catch(error => {
        console.warn('Failed to preload module:', module, error);
      })
    );

    await Promise.allSettled(preloadPromises);
    console.log('Critical resources preloaded successfully');
  } catch (error) {
    console.error('Error preloading critical resources:', error);
  }
};

/**
 * Preload route-specific resources
 */
export const preloadRouteResources = async (routeName: string): Promise<void> => {
  const connectionSpeed = getConnectionSpeed();
  
  if (connectionSpeed === 'slow') {
    return;
  }

  const routeModules: Record<string, string[]> = {
    'tasks': [
      '/src/pages/tasks/task-form.tsx',
      '/src/pages/tasks/task-detail.tsx',
    ],
    'profile': [
      '/src/pages/profile/profile.tsx',
    ],
    'auth': [
      '/src/pages/auth/login.tsx',
      '/src/pages/auth/register.tsx',
    ],
  };

  const modules = routeModules[routeName] || [];
  
  try {
    const preloadPromises = modules.map(module => 
      preloadModule(module).catch(error => {
        console.warn('Failed to preload route module:', module, error);
      })
    );

    await Promise.allSettled(preloadPromises);
  } catch (error) {
    console.error('Error preloading route resources:', error);
  }
};

/**
 * Image optimization utility
 */
export const optimizeImageLoading = (): void => {
  // Add loading="lazy" to all images that don't have it
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    (img as HTMLImageElement).loading = 'lazy';
  });

  // Add decoding="async" for better performance
  const allImages = document.querySelectorAll('img');
  allImages.forEach(img => {
    if (!(img as HTMLImageElement).decoding) {
      (img as HTMLImageElement).decoding = 'async';
    }
  });
};

/**
 * Initialize performance optimizations
 */
export const initializePerformanceOptimizations = (): void => {
  // Optimize image loading
  optimizeImageLoading();
  
  // Set up intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Preload critical resources
  preloadCriticalResources();
};