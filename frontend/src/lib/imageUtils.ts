/**
 * Intelligent client-side image compression & optimization utility.
 * Prevents HTTP 413 "Request Entity Too Large" and server payload limits.
 */

export interface OptimizedImageResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  dimensions: { width: number; height: number };
}

/**
 * Progressively compresses and downscales an image file to guarantee it stays below
 * server payload thresholds (e.g. max 350KB for logos and avatars) while retaining crisp quality.
 *
 * @param file Original File object from file input
 * @param maxDimension Maximum width/height in pixels (default: 800 for logos)
 * @param targetMaxBytes Maximum desired byte size (default: 350KB)
 * @param quality JPEG/WebP quality (0.1 to 1.0, default: 0.85)
 */
export const compressImage = async (
  file: File,
  maxDimension = 800,
  targetMaxBytes = 350 * 1024,
  quality = 0.85
): Promise<File> => {
  const result = await processImageOptimization(file, maxDimension, targetMaxBytes, quality);
  return result.file;
};

/**
 * Full optimization process returning both the optimized File and base64 DataURL.
 */
export const processImageOptimization = async (
  file: File,
  maxDimension = 800,
  targetMaxBytes = 350 * 1024,
  quality = 0.85
): Promise<OptimizedImageResult> => {
  // SVGs are vector text. If already small (< 500KB), return untouched.
  if (file.type === 'image/svg+xml' || (!file.type.startsWith('image/') && !file.name.match(/\.(png|jpe?g|webp|svg|gif|bmp)$/i))) {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      dataUrl,
      originalSize: file.size,
      optimizedSize: file.size,
      dimensions: { width: 0, height: 0 },
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let currentMaxDim = maxDimension;
        let currentQuality = quality;

        const attemptCompression = (dim: number, qual: number): { blob: Blob; mime: string; width: number; height: number } => {
          let { width, height } = img;

          if (width > dim || height > dim) {
            if (width > height) {
              height = Math.round((height * dim) / width);
              width = dim;
            } else {
              width = Math.round((width * dim) / height);
              height = dim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return {
              blob: new Blob([], { type: file.type }),
              mime: file.type,
              width,
              height,
            };
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // For transparent PNGs, try PNG first
          const isPng = file.type === 'image/png';
          let outputMime = isPng ? 'image/png' : (file.type === 'image/webp' ? 'image/webp' : 'image/jpeg');

          // Synchronously create data URL to check size or convert to blob
          let dataUrl = canvas.toDataURL(outputMime, isPng ? undefined : qual);
          
          // If PNG is too large (over target bytes), switch to WebP or JPEG with transparency check
          if (isPng && dataUrl.length * 0.75 > targetMaxBytes) {
            outputMime = 'image/webp';
            dataUrl = canvas.toDataURL('image/webp', qual);
          }

          // Convert dataURL to binary Blob
          const byteString = atob(dataUrl.split(',')[1]);
          const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });

          return { blob, mime: mimeString, width, height };
        };

        // Iteration 1: Initial compression attempt
        let result = attemptCompression(currentMaxDim, currentQuality);

        // Iteration 2: If still exceeds target max bytes, progressively reduce dimensions & quality
        if (result.blob.size > targetMaxBytes) {
          result = attemptCompression(600, 0.8);
        }

        // Iteration 3: Second fail-safe reduction if needed
        if (result.blob.size > targetMaxBytes) {
          result = attemptCompression(450, 0.75);
        }

        const ext = result.mime === 'image/png' ? '.png' : (result.mime === 'image/webp' ? '.webp' : '.jpg');
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const optimizedFileName = `${baseName}${ext}`;

        const optimizedFile = new File([result.blob], optimizedFileName, {
          type: result.mime,
          lastModified: Date.now(),
        });

        const readerOut = new FileReader();
        readerOut.onloadend = () => {
          resolve({
            file: optimizedFile,
            dataUrl: readerOut.result as string,
            originalSize: file.size,
            optimizedSize: optimizedFile.size,
            dimensions: { width: result.width, height: result.height },
          });
        };
        readerOut.readAsDataURL(optimizedFile);
      };

      img.onerror = () => {
        fileToDataUrl(file).then((dataUrl) => {
          resolve({
            file,
            dataUrl,
            originalSize: file.size,
            optimizedSize: file.size,
            dimensions: { width: 0, height: 0 },
          });
        });
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      fileToDataUrl(file).then((dataUrl) => {
        resolve({
          file,
          dataUrl,
          originalSize: file.size,
          optimizedSize: file.size,
          dimensions: { width: 0, height: 0 },
        });
      });
    };

    reader.readAsDataURL(file);
  });
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const DEFAULT_PLACEHOLDER_IMAGE = '/placeholder.svg';

/**
 * Normalizes any image or logo URL to ensure it resolves accurately across local dev and production on AWS.
 * Handles:
 * - base64 data URLs and object blob URLs
 * - local/dev host URLs (localhost, 127.0.0.1) dynamically converted to current VITE_API_URL host
 * - relative storage paths like /storage/... or product-images/...
 * - external CDNs (AWS S3, Cloudinary, Unsplash) preserved with HTTPS enforcement
 * - mixed content: ensures https protocol when running on https
 */
export const normalizeImageUrl = (url: string | null | undefined, fallback = ''): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  const trimmed = url.trim();

  // Keep data URLs and blobs as-is
  if (trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
  const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
  const baseHost = cleanApiUrl.replace(/\/api$/, '');

  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

  // Check if it is an external cloud CDN / storage service (AWS S3, Cloudinary, Unsplash, etc.)
  const isExternalCdn = (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
    !trimmed.includes('localhost') &&
    !trimmed.includes('127.0.0.1') &&
    (
      trimmed.includes('amazonaws.com') ||
      trimmed.includes('unsplash.com') ||
      trimmed.includes('cloudinary.com') ||
      trimmed.includes('imgur.com') ||
      trimmed.includes('googleusercontent.com')
    );

  if (isExternalCdn) {
    if (isSecure && trimmed.startsWith('http://')) {
      return trimmed.replace(/^http:\/\//, 'https://');
    }
    return trimmed;
  }

  // Handle paths containing /storage/
  const storageIdx = trimmed.indexOf('/storage/');
  if (storageIdx !== -1) {
    const relativePath = trimmed.substring(storageIdx);

    // If it's localhost, relative, or an old server IP, route through the current baseHost
    if (baseHost) {
      let fullUrl = `${baseHost}${relativePath}`;
      if (isSecure && fullUrl.startsWith('http://')) {
        fullUrl = fullUrl.replace(/^http:\/\//, 'https://');
      }
      return fullUrl;
    }

    if (isSecure && relativePath.startsWith('http://')) {
      return relativePath.replace(/^http:\/\//, 'https://');
    }
    return relativePath;
  }

  // Relative path without /storage/ (e.g. "product-images/pic.jpg" or "/product-images/pic.jpg")
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    const cleanRel = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const storagePath = cleanRel.startsWith('/storage/') ? cleanRel : `/storage${cleanRel}`;

    if (baseHost) {
      let fullUrl = `${baseHost}${storagePath}`;
      if (isSecure && fullUrl.startsWith('http://')) {
        fullUrl = fullUrl.replace(/^http:\/\//, 'https://');
      }
      return fullUrl;
    }
    return storagePath;
  }

  // Fallback for general absolute URLs pointing to current API host or needing HTTPS upgrade
  if (isSecure && trimmed.startsWith('http://') && !trimmed.includes('localhost') && !trimmed.includes('127.0.0.1')) {
    return trimmed.replace(/^http:\/\//, 'https://');
  }

  return trimmed;
};

/**
 * Standard onError handler for <img> elements to gracefully retry via API streaming endpoint, then fallback to placeholder.
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = DEFAULT_PLACEHOLDER_IMAGE
): void => {
  const target = e.currentTarget;

  // If failed on a /storage/ URL, attempt streaming via API before falling back to placeholder
  if (!target.dataset.triedApiFallback && target.src && target.src.includes('/storage/')) {
    target.dataset.triedApiFallback = 'true';
    const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
    const baseHost = rawApiUrl.replace(/\/api$/, '');
    const storageIdx = target.src.indexOf('/storage/');
    const subpath = target.src.substring(storageIdx + 9); // strip '/storage/'

    if (subpath.startsWith('settings/')) {
      target.src = `${baseHost || ''}/api/settings/logo`;
      return;
    }

    target.src = `${baseHost || ''}/api/storage/${subpath}`;
    return;
  }

  if (target.src !== fallback && !target.src.endsWith(fallback)) {
    target.onerror = null; // Prevent infinite loop if fallback fails
    target.src = fallback;
  }
};


