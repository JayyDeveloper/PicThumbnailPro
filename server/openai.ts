import OpenAI from "openai";
import fs from "fs";
import path from "path";
import https from "https";
import { v4 as uuidv4 } from "uuid";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an image using DALL-E 3 and save it to the uploads directory
 */
export async function generateImage(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  try {
    // Enhance the prompt for better thumbnail results
    const enhancedPrompt = `Create a YouTube thumbnail image for: ${prompt}. Make it high-quality, attention-grabbing, with vibrant colors, and designed for 16:9 aspect ratio. Should be professional and well-composed.`;

    // Request image generation from OpenAI
    // the newest OpenAI model is "dall-e-3" which was released after the knowledge cutoff.
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1792x1024", // Close to 16:9 aspect ratio
      quality: "standard",
      response_format: "url",
    });

    // Get the image URL from the response
    const imageUrl = response.data[0].url;
    
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    // Download and save the image
    const filename = `ai-generated-${uuidv4()}.png`;
    const uploadDir = path.resolve("uploads");
    const filepath = path.join(uploadDir, filename);

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Download the image
    await downloadImage(imageUrl, filepath);

    // Return the relative path to the image
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Helper function to download an image from a URL and save it to a file
 */
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      
      response.pipe(fileStream);
      
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on("error", (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there was an error
        reject(err);
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}