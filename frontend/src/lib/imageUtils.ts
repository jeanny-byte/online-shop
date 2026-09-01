/**
 * Utility functions for image compression and client-side optimization.
 */

/**
 * Compresses and resizes an image file client-side before upload to prevent payload limits
 * and "file too large" errors on the server.
 *
 * @param file The original File object from input[type=file]
 * @param maxWidth Max width in pixels (default: 1600)
 * @param maxHeight Max height in pixels (default: 1600)
 * @param quality Compression quality for JPEG/WebP from 0 to 1 (default: 0.85)
 * @returns A promise that resolves to the compressed/optimized File object
 */
export const compressImage = async (
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<File> => {
  // SVGs are vector format and should not be rasterized or compressed via canvas
  if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) {
    return file;
  }

  // If the file is already small (under 300KB), keep the original untouched
  if (file.size <= 300 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image onto canvas with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output MIME format (preserve PNG transparency, use JPEG for photos/others)
        const isPng = file.type === 'image/png';
        const isWebp = file.type === 'image/webp';
        const outputType = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // If compressed blob happens to be larger (rare), retain original
            if (blob.size >= file.size) {
              resolve(file);
              return;
            }

            const optimizedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            });

            resolve(optimizedFile);
          },
          outputType,
          isPng ? undefined : quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};
