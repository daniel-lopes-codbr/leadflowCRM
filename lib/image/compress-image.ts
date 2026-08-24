const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;

/**
 * Redimensiona/recomprime uma imagem raster no client antes do upload
 * (bucket workspace-assets, limite de 2MB). SVG é vetor — não passa por
 * canvas, sobe como está.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/svg+xml") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, outputType, JPEG_QUALITY)
  );

  if (!blob || blob.size >= file.size) return file;

  const ext = outputType === "image/png" ? "png" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + `.${ext}`;
  return new File([blob], name, { type: outputType });
}
