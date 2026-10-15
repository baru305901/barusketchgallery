/**
 * Client-Side Image Compression using HTML Canvas
 * 
 * - Retains natural dimensions if below 2800px, or scales down so max width and max height do not exceed 2800px (retaining aspect ratio).
 * - Exports with canvas.toBlob() and canvas.toDataURL() using 'image/jpeg' at 0.94 quality.
 * - Preserves intricate brush strokes, gold foil, and fine painting details while preventing uncompressed multi-megabyte payloads.
 */

export interface CompressedImageResult {
  dataUrl: string;
  blob: Blob;
  file: File;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export const compressImage = async (
  file: File,
  maxDimension = 2800,
  quality = 0.94
): Promise<CompressedImageResult> => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('The selected file is not an image.'));
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down so max width and max height do not exceed 2800px (retaining aspect ratio and natural dimensions if below)
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      // Ensure minimum non-zero dimensions
      width = Math.max(1, width);
      height = Math.max(1, height);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to obtain 2D canvas context for compression.'));
      }

      // Use a clean white background so transparent PNGs do not develop dark/black backgrounds in JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Render resized image onto canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Export with image/jpeg at high fidelity quality (default 0.94)
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Canvas toBlob returned null.'));
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          console.log(
            `[Image Compression] ${file.name}: ${(file.size / 1024).toFixed(1)} KB -> ${(blob.size / 1024).toFixed(1)} KB (${width}x${height})`
          );

          resolve({
            dataUrl,
            blob,
            file: compressedFile,
            originalSize: file.size,
            compressedSize: blob.size,
            width,
            height,
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image file for optimization: ${err}`));
    };

    img.src = objectUrl;
  });
};
