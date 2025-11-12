import OpenAI from "openai";
import fs from "fs";
import path from "path";
import https from "https";
import { v4 as uuidv4 } from "uuid";

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Generate viral thumbnail text from user's topic description
 */
export async function generateThumbnailText(topicDescription: string): Promise<string> {
  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a viral YouTube thumbnail text expert. Your job is to transform video topic descriptions into short, punchy, attention-grabbing text that appears on thumbnails.

Key principles for viral thumbnail text:
1. EXTREMELY SHORT - Maximum 3-5 words, ideally 1-3 words
2. ALL CAPS - Creates urgency and grabs attention
3. EMOTIONAL TRIGGERS - Use power words that create curiosity, shock, excitement, or urgency
4. NUMBERS - When relevant, use specific numbers (e.g., "100K", "TOP 5", "24 HRS")
5. ACTION WORDS - Use verbs that create excitement (REVEALED, EXPOSED, DESTROYED, WON, etc.)
6. AVOID FULL SENTENCES - Short phrases only
7. CREATE CURIOSITY - Make people want to click to learn more

Examples:
- Input: "I made 100k in one day trading crypto" → Output: "100K IN 24 HRS"
- Input: "My secret recipe for the best chocolate cake" → Output: "SECRET RECIPE"
- Input: "I met a celebrity at the airport" → Output: "CELEBRITY ENCOUNTER"
- Input: "Top 5 tips for gaming like a pro" → Output: "PRO GAMING TIPS"
- Input: "This changed my life forever" → Output: "LIFE CHANGING"

Return ONLY the thumbnail text, nothing else. No quotes, no explanation.`
        },
        {
          role: "user",
          content: topicDescription
        }
      ],
      temperature: 0.9,
      max_tokens: 20
    });

    const viralText = completion.choices[0]?.message?.content?.trim().replace(/['"]/g, '') || topicDescription.toUpperCase().slice(0, 30);
    console.log("Generated viral thumbnail text:", viralText);
    return viralText;
  } catch (error) {
    console.error("Error generating thumbnail text:", error);
    // Fallback to simple uppercase conversion
    return topicDescription.toUpperCase().slice(0, 30);
  }
}

/**
 * Analyze an uploaded image using GPT-4 Vision to extract key details
 */
export async function analyzeUploadedImage(imageBase64: string, userDescription: string): Promise<string> {
  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing images for YouTube thumbnail creation. Describe the key elements of the uploaded image that would be useful for creating a viral thumbnail.

Focus on:
- Main subject (person, object, scene)
- Pose or action (if person)
- Colors and lighting
- Style/mood
- What would make this image work well in a thumbnail

Keep it concise (2-3 sentences).`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `User wants to create a thumbnail about: "${userDescription}". Analyze this image and describe how to make it into a viral thumbnail.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const analysis = completion.choices[0]?.message?.content?.trim() || "Image analysis not available";
    console.log("Image analysis:", analysis);
    return analysis;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Image contains subject for thumbnail";
  }
}

/**
 * Generate gradient colors based on topic/mood
 */
export async function generateGradientColors(topicDescription: string): Promise<{ color1: string; color2: string; color3: string }> {
  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a color psychology expert for YouTube thumbnails. Generate vibrant gradient colors that match the topic/mood.

Return ONLY a JSON object with three RGB colors in this exact format:
{"color1":"rgb(255,0,0)","color2":"rgb(255,128,0)","color3":"rgb(255,255,0)"}

Color guidelines:
- Gaming: Blues, purples, neon greens
- Tech: Blues, cyans, silvers
- Food: Warm oranges, reds, yellows
- Finance/Money: Greens, golds, blacks
- Motivation: Oranges, yellows, reds
- Mystery: Purples, dark blues, blacks
- Comedy: Bright yellows, oranges, pinks
- Beauty/Fashion: Pinks, purples, pastels
- Always use VIBRANT, SATURATED colors for maximum impact`
        },
        {
          role: "user",
          content: topicDescription
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (response) {
      const colors = JSON.parse(response);
      console.log("Generated gradient colors:", colors);
      return colors;
    }
  } catch (error) {
    console.error("Error generating gradient colors:", error);
  }

  // Fallback to default gradient
  return {
    color1: "rgb(99,102,241)",
    color2: "rgb(168,85,247)",
    color3: "rgb(236,72,153)"
  };
}

/**
 * Use GPT-4 to create an optimized viral thumbnail prompt
 */
async function createViralThumbnailPrompt(userPrompt: string): Promise<string> {
  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a viral YouTube thumbnail expert. Your job is to transform user descriptions into highly detailed DALL-E 3 prompts that create eye-catching, viral-worthy YouTube thumbnails.

Key principles for viral thumbnails:
1. HIGH CONTRAST - Bold, dramatic lighting with strong highlights and shadows
2. VIBRANT COLORS - Saturated, punchy colors that pop (reds, yellows, blues, greens)
3. DYNAMIC COMPOSITION - Diagonal lines, rule of thirds, depth, dramatic angles
4. EMOTIONAL IMPACT - Create curiosity, excitement, shock, or intrigue
5. CINEMATIC QUALITY - Professional, photorealistic, movie-poster aesthetic
6. CLEAR FOCAL POINT - One main subject that draws the eye immediately
7. NO TEXT - Never include text, logos, or words (text added separately)
8. 16:9 ASPECT RATIO - Wide, horizontal composition

Transform the user's idea into a detailed, specific DALL-E 3 prompt. Include:
- Specific lighting (dramatic, cinematic, neon, etc.)
- Color palette (bold reds and yellows, electric blues, etc.)
- Composition details (close-up, wide angle, over-the-shoulder, etc.)
- Emotional tone (exciting, mysterious, shocking, etc.)
- Style references (photorealistic, cinematic, professional photography, etc.)

Return ONLY the DALL-E 3 prompt, nothing else.`
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    const viralPrompt = completion.choices[0]?.message?.content?.trim() || userPrompt;
    console.log("Generated viral thumbnail prompt:", viralPrompt);
    return viralPrompt;
  } catch (error) {
    console.error("Error creating viral prompt, using original:", error);
    // Fallback to enhanced version of original prompt
    return `Cinematic YouTube thumbnail with dramatic lighting and vibrant colors for: ${userPrompt}. High contrast, professional photography, eye-catching composition, photorealistic, no text, 16:9 aspect ratio.`;
  }
}

/**
 * Generate an image using DALL-E 3 and save it to the uploads directory
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    const client = getOpenAIClient();

    // Use GPT-4 to create a viral thumbnail prompt
    const viralPrompt = await createViralThumbnailPrompt(prompt);

    // Request image generation from OpenAI
    // the newest OpenAI model is "dall-e-3" which was released after the knowledge cutoff.
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: viralPrompt,
      n: 1,
      size: "1792x1024", // Close to 16:9 aspect ratio
      quality: "hd", // Use HD quality for better results
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