import fs from "fs";
import path from "path";
import https from "https";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate or find an image based on a text prompt
 * Using Unsplash source API for free images
 */
export async function generateImageFromPrompt(prompt: string): Promise<string> {
  try {
    // Create a search-friendly version of the prompt
    const searchTerm = encodeURIComponent(prompt.trim().toLowerCase());
    
    // Use Unsplash Source API which is free and doesn't require API keys
    // It returns a random image based on the search term
    // Format: https://source.unsplash.com/1600x900/?search_term
    const imageUrl = `https://source.unsplash.com/1600x900/?${searchTerm}`;
    
    // Download and save the image
    const filename = `generated-${uuidv4()}.jpg`;
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