import sharp from "sharp";
import path from "path";
import fs from "fs";
import { TextElement } from "@/pages/EditorPage";

const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_HEIGHT = 720;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  filterName: string | null;
}

export class ImageProcessor {
  /**
   * Resize an image to YouTube thumbnail dimensions (1280x720)
   */
  static async resizeImage(
    imageBuffer: Buffer,
    options: { width?: number; height?: number; fit?: keyof sharp.FitEnum } = {}
  ): Promise<Buffer> {
    const { width = THUMBNAIL_WIDTH, height = THUMBNAIL_HEIGHT, fit = "cover" } = options;

    return await sharp(imageBuffer)
      .resize({ width, height, fit })
      .toBuffer();
  }

  /**
   * Apply filters to an image
   */
  static async applyFilters(imageBuffer: Buffer, filters: ImageFilters): Promise<Buffer> {
    let image = sharp(imageBuffer);

    if (filters.brightness !== 0) {
      image = image.modulate({ brightness: 1 + filters.brightness / 100 });
    }

    if (filters.contrast !== 0) {
      image = image.modulate({ contrast: 1 + filters.contrast / 100 });
    }

    if (filters.saturation !== 0) {
      image = image.modulate({ saturation: 1 + filters.saturation / 100 });
    }

    if (filters.blur > 0) {
      image = image.blur(filters.blur);
    }

    // Apply preset filters
    if (filters.filterName) {
      switch (filters.filterName) {
        case "Muted":
          image = image.modulate({ saturation: 0.5 });
          break;
        case "Vibrant":
          image = image.modulate({ saturation: 1.5 });
          break;
        default:
          break;
      }
    }

    return await image.toBuffer();
  }

  /**
   * Save an image to the uploads directory
   */
  static async saveImage(
    imageBuffer: Buffer,
    options: { format?: string; quality?: number } = {}
  ): Promise<string> {
    const { format = "webp", quality = 90 } = options;
    const filename = `thumbnail-${Date.now()}.${format}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    await sharp(imageBuffer)
      .toFormat(format as keyof sharp.FormatEnum)
      .toFile(filepath);

    return `/uploads/${filename}`;
  }

  /**
   * Generate a thumbnail with text overlays
   * This is a simplified version that doesn't actually add text
   * In a real implementation, you would use a canvas library or
   * another approach to add text overlays to the image
   */
  static async generateThumbnail(
    imageUrl: string,
    elements: TextElement[],
    filters: ImageFilters
  ): Promise<Buffer> {
    try {
      // Get the image buffer
      let imageBuffer: Buffer;

      // For external URLs, download the image
      if (imageUrl.startsWith("http")) {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        imageBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        // For local files, read from disk
        const filepath = path.join(process.cwd(), imageUrl.replace(/^\/+/, ""));
        imageBuffer = await fs.promises.readFile(filepath);
      }

      // Resize the image to thumbnail dimensions
      const resizedBuffer = await this.resizeImage(imageBuffer);

      // Apply filters
      const processedBuffer = await this.applyFilters(resizedBuffer, filters);

      // In a real implementation, you would add text overlays here
      // For now, just return the processed image
      return processedBuffer;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      throw error;
    }
  }
}

export default ImageProcessor;
