import fs from "fs";
import path from "path";
import https from "https";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate or find an image based on a text prompt
 * Using Lorem Picsum (picsum.photos) for free placeholder images
 * with a seed based on the search term to provide different images
 * for different prompts
 */
export async function generateImageFromPrompt(prompt: string): Promise<string> {
  try {
    // Create a search-friendly version of the prompt
    const searchTerm = prompt.trim().toLowerCase();
    
    // Convert the search term to a numeric seed by summing character codes
    const seed = searchTerm.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use picsum.photos with a seed based on the search term so different terms give different images
    const imageUrl = `https://picsum.photos/seed/${seed}/1280/720`;
    
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
    const request = https.get(url, (response) => {
      // Handle redirects (status codes 301, 302, 307, 308)
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // If we get a redirect, follow it
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }

      if (!response.statusCode || response.statusCode !== 200) {
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
    });
    
    request.on("error", (err) => {
      reject(err);
    });
    
    // Set a timeout of 10 seconds
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error("Request timeout"));
    });
  });
}