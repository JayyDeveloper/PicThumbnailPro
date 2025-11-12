import sharp from "sharp";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { generateImage, generateThumbnailText, generateGradientColors, analyzeUploadedImage } from "./openai";

/**
 * Generate a high-quality YouTube thumbnail (1280x720) from an uploaded image and text
 * If no image is provided and OpenAI is configured, uses DALL-E 3 to generate a thumbnail
 */
export async function generateThumbnail(
  imageBuffer: Buffer | null,
  text: string,
  useAI: boolean = false
): Promise<string> {
  try {
    const YOUTUBE_WIDTH = 1280;
    const YOUTUBE_HEIGHT = 720;

    // Step 1: Analyze uploaded image if provided
    let imageAnalysis = "";
    if (imageBuffer && text && text.trim() && process.env.OPENAI_API_KEY) {
      console.log("Analyzing uploaded image with GPT-4 Vision...");
      try {
        const imageBase64 = imageBuffer.toString('base64');
        imageAnalysis = await analyzeUploadedImage(imageBase64, text.trim());
      } catch (error) {
        console.error("Failed to analyze image:", error);
      }
    }

    // Step 2: Generate viral thumbnail text using AI (incorporating image analysis)
    let thumbnailText = "";
    if (text && text.trim()) {
      if (process.env.OPENAI_API_KEY) {
        console.log("OpenAI API key found, generating AI text...");
        try {
          // Combine user description with image analysis for better text generation
          const contextForText = imageAnalysis
            ? `${text.trim()}. Image shows: ${imageAnalysis}`
            : text.trim();
          thumbnailText = await generateThumbnailText(contextForText);
          console.log(`AI transformed "${text}" → "${thumbnailText}"`);
        } catch (error) {
          console.error("Failed to generate AI text, using input:", error);
          thumbnailText = text.trim().toUpperCase();
        }
      } else {
        console.log("No OpenAI API key, using input text as-is");
        thumbnailText = text.trim().toUpperCase();
      }
    }

    // Step 3: Generate topic-related gradient colors (incorporating image analysis)
    let gradientColors = { color1: "rgb(99,102,241)", color2: "rgb(168,85,247)", color3: "rgb(236,72,153)" };
    if (text && text.trim()) {
      if (process.env.OPENAI_API_KEY) {
        console.log("Generating topic-related gradient colors...");
        try {
          // Combine user description with image analysis for better colors
          const contextForColors = imageAnalysis
            ? `${text.trim()}. ${imageAnalysis}`
            : text.trim();
          gradientColors = await generateGradientColors(contextForColors);
        } catch (error) {
          console.error("Failed to generate gradient colors, using default:", error);
        }
      } else {
        console.log("No OpenAI API key, using default gradient colors");
      }
    }

    let baseImage: sharp.Sharp;

    if (imageBuffer) {
      // Check if image needs background enhancement (detect if it's mostly white/plain)
      const needsBackground = await detectPlainBackground(imageBuffer);

      if (needsBackground) {
        console.log("Detected plain background, applying topic-related gradient");

        // First, remove the white/light background by making it transparent
        const imageWithTransparentBg = await sharp(imageBuffer)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });

        // Process the raw pixel data to make white/light pixels transparent
        const { data, info } = imageWithTransparentBg;
        const pixelArray = new Uint8ClampedArray(data);

        // Make ONLY near-white backgrounds transparent (preserve subject)
        for (let i = 0; i < pixelArray.length; i += 4) {
          const r = pixelArray[i];
          const g = pixelArray[i + 1];
          const b = pixelArray[i + 2];

          // Only remove pixels that are VERY close to pure white
          // Must be very bright AND have minimal color variation
          const isNearWhite = r > 240 && g > 240 && b > 240 &&
                              Math.abs(r - g) < 10 &&
                              Math.abs(g - b) < 10 &&
                              Math.abs(b - r) < 10;

          if (isNearWhite) {
            // Make this pixel transparent
            pixelArray[i + 3] = 0;
          }
        }

        console.log("White background removed, subject preserved");

        // Convert back to PNG with transparency
        const transparentImage = await sharp(pixelArray, {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4
          }
        })
        .png()
        .toBuffer();

        // Create gradient background
        const gradientBg = createGradientBackground(YOUTUBE_WIDTH, YOUTUBE_HEIGHT, gradientColors);
        const gradientBuffer = await gradientBg.toBuffer();

        // Resize the transparent image to fit
        const resizedTransparent = await sharp(transparentImage)
          .resize(YOUTUBE_WIDTH, YOUTUBE_HEIGHT, {
            fit: "contain",
            position: "center",
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .toBuffer();

        // Composite the transparent image on top of the gradient
        baseImage = sharp(gradientBuffer)
          .composite([{
            input: resizedTransparent,
            blend: "over"
          }])
          .sharpen()
          .modulate({ saturation: 1.2, brightness: 1.05 })
          .jpeg({ quality: 95 });
      } else {
        // Process uploaded image normally with enhanced quality
        baseImage = sharp(imageBuffer)
          .resize(YOUTUBE_WIDTH, YOUTUBE_HEIGHT, {
            fit: "cover",
            position: "center",
          })
          .sharpen()
          .modulate({ saturation: 1.2, brightness: 1.05 })
          .jpeg({ quality: 95 });
      }
    } else if (useAI && process.env.OPENAI_API_KEY && text) {
      // Use DALL-E 3 to generate a professional thumbnail background
      try {
        const aiImagePath = await generateImage(text);

        // Read the AI-generated image
        const aiImageFullPath = path.resolve(aiImagePath.replace(/^\//, ''));
        const aiImageBuffer = fs.readFileSync(aiImageFullPath);

        baseImage = sharp(aiImageBuffer)
          .resize(YOUTUBE_WIDTH, YOUTUBE_HEIGHT, {
            fit: "cover",
            position: "center",
          })
          .sharpen()
          .jpeg({ quality: 95 });
      } catch (aiError) {
        console.error("AI generation failed, falling back to gradient:", aiError);
        baseImage = createGradientBackground(YOUTUBE_WIDTH, YOUTUBE_HEIGHT, gradientColors);
      }
    } else {
      // Create a topic-related gradient background
      baseImage = createGradientBackground(YOUTUBE_WIDTH, YOUTUBE_HEIGHT, gradientColors);
    }

    // Add AI-generated text overlay
    if (thumbnailText) {
      const textSvg = createTextSVG(thumbnailText, YOUTUBE_WIDTH, YOUTUBE_HEIGHT);
      baseImage = baseImage.composite([
        {
          input: Buffer.from(textSvg),
          top: 0,
          left: 0,
        },
      ]);
    }

    // Save the final image
    const filename = `thumbnail-${uuidv4()}.jpg`;
    const uploadDir = path.resolve("uploads");
    const filepath = path.join(uploadDir, filename);

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await baseImage.toFile(filepath);

    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
}

/**
 * Detect if an image has a plain/white background
 */
async function detectPlainBackground(imageBuffer: Buffer): Promise<boolean> {
  try {
    const { dominant } = await sharp(imageBuffer).stats();

    // Check if dominant color is close to white, light gray, or very light colors
    const avgBrightness = (dominant.r + dominant.g + dominant.b) / 3;
    const isLight = avgBrightness > 200; // Brightness threshold for "plain" backgrounds

    // Also check color variance - plain backgrounds have low variance
    const variance = Math.abs(dominant.r - dominant.g) + Math.abs(dominant.g - dominant.b) + Math.abs(dominant.b - dominant.r);
    const isMonochrome = variance < 30; // Low variance = monochrome/plain

    console.log(`Background detection: brightness=${avgBrightness}, variance=${variance}, plain=${isLight && isMonochrome}`);

    return isLight && isMonochrome;
  } catch (error) {
    console.error("Error detecting background:", error);
    return false; // Default to not replacing background on error
  }
}

/**
 * Create a vibrant gradient background with custom colors
 */
function createGradientBackground(
  width: number,
  height: number,
  colors: { color1: string; color2: string; color3: string } = {
    color1: "rgb(99,102,241)",
    color2: "rgb(168,85,247)",
    color3: "rgb(236,72,153)"
  }
): sharp.Sharp {
  const svgGradient = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.color1};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${colors.color2};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.color3};stop-opacity:1" />
        </linearGradient>
        <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:rgb(255,255,255);stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.2" />
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad1)" />
      <rect width="${width}" height="${height}" fill="url(#grad2)" />
    </svg>
  `;

  return sharp(Buffer.from(svgGradient)).jpeg({ quality: 95 });
}

/**
 * Create an SVG text overlay for the thumbnail with enhanced styling
 */
function createTextSVG(text: string, width: number, height: number): string {
  // Calculate optimal font size based on text length
  const textLength = text.length;
  let fontSize = 140;

  if (textLength > 15) fontSize = 110;
  if (textLength > 25) fontSize = 85;
  if (textLength > 35) fontSize = 65;
  if (textLength > 45) fontSize = 55;

  // Split text into lines if it's too long
  const words = text.toUpperCase().split(" ");
  const lines: string[] = [];
  let currentLine = "";

  const maxCharsPerLine = fontSize > 100 ? 15 : fontSize > 80 ? 20 : 25;

  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    if (testLine.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Limit to 2 lines max for better readability
  const displayLines = lines.slice(0, 2);

  // Calculate vertical positioning
  const lineHeight = fontSize * 1.15;
  const totalHeight = displayLines.length * lineHeight;
  const startY = (height - totalHeight) / 2 + fontSize * 0.75;

  // Enhanced text with multiple layers for depth
  const textElements = displayLines
    .map((line, i) => {
      const y = startY + i * lineHeight;
      return `
        <!-- Shadow layer (dark bottom) -->
        <text
          x="50%"
          y="${y + 8}"
          font-family="Impact, Arial Black, sans-serif"
          font-size="${fontSize}"
          font-weight="900"
          text-anchor="middle"
          fill="#000000"
          opacity="0.6"
        >${escapeXml(line)}</text>

        <!-- Main stroke (thick black outline) -->
        <text
          x="50%"
          y="${y}"
          font-family="Impact, Arial Black, sans-serif"
          font-size="${fontSize}"
          font-weight="900"
          text-anchor="middle"
          fill="none"
          stroke="#000000"
          stroke-width="${fontSize * 0.08}"
          stroke-linejoin="round"
        >${escapeXml(line)}</text>

        <!-- Inner glow (yellow/white) -->
        <text
          x="50%"
          y="${y}"
          font-family="Impact, Arial Black, sans-serif"
          font-size="${fontSize}"
          font-weight="900"
          text-anchor="middle"
          fill="none"
          stroke="#FFD700"
          stroke-width="${fontSize * 0.02}"
          opacity="0.8"
        >${escapeXml(line)}</text>

        <!-- Main fill (white with slight gradient effect) -->
        <text
          x="50%"
          y="${y}"
          font-family="Impact, Arial Black, sans-serif"
          font-size="${fontSize}"
          font-weight="900"
          text-anchor="middle"
          fill="#FFFFFF"
        >${escapeXml(line)}</text>
      `;
    })
    .join("");

  return `
    <svg width="${width}" height="${height}">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      ${textElements}
    </svg>
  `;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
