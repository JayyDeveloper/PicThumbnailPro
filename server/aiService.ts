import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface ThumbnailSuggestion {
  title: string;
  tags: string[];
  description: string;
}

export interface AIThumbnailResult {
  enhancedImageUrl: string;
  suggestions: ThumbnailSuggestion[];
  analysisText: string;
}

/**
 * Analyze an uploaded image and generate thumbnail enhancement suggestions
 */
export async function analyzeImageForThumbnail(
  imagePath: string,
  userPrompt: string
): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in environment variables.');
  }

  try {
    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    console.log('🔍 Analyzing image with GPT-4 Vision...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a YouTube thumbnail optimization expert. Analyze this image and the user's description to suggest how to create a viral, eye-catching thumbnail.

User's description: "${userPrompt}"

Provide detailed suggestions for:
1. What elements to emphasize (faces, text, colors)
2. What text overlays would work best
3. Color adjustments to make it more attention-grabbing
4. Composition improvements for maximum click-through rate

Be specific and actionable. Focus on creating a thumbnail that will perform well on YouTube.`
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const analysis = response.choices[0]?.message?.content || '';
    console.log('✅ Image analysis complete');

    return analysis;
  } catch (error: any) {
    console.error('❌ Error analyzing image:', error.message);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

/**
 * Generate viral YouTube video suggestions based on image analysis and user prompt
 */
export async function generateViralSuggestions(
  imageAnalysis: string,
  userPrompt: string
): Promise<ThumbnailSuggestion[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in environment variables.');
  }

  try {
    console.log('🎯 Generating viral video suggestions...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a YouTube viral content strategist and SEO expert. You help creators generate high-performing video titles, tags, and descriptions that maximize views and engagement.`
        },
        {
          role: 'user',
          content: `Based on this thumbnail analysis and user description, generate 3 different viral video suggestions.

Thumbnail Analysis:
${imageAnalysis}

User's Video Concept:
"${userPrompt}"

For each suggestion, provide:
1. A catchy, click-worthy title (50-70 characters, uses power words, creates curiosity)
2. 10-15 SEO tags (mix of broad and specific, include trending topics)
3. An engaging video description (150-200 words, includes hooks, call-to-action, and keywords)

Make each suggestion have a different angle/strategy:
- Suggestion 1: Curiosity-driven (mystery, questions, intrigue)
- Suggestion 2: Value-driven (education, tips, how-to)
- Suggestion 3: Entertainment-driven (excitement, drama, bold claims)

Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    {
      "title": "...",
      "tags": ["tag1", "tag2", ...],
      "description": "..."
    },
    {
      "title": "...",
      "tags": ["tag1", "tag2", ...],
      "description": "..."
    },
    {
      "title": "...",
      "tags": ["tag1", "tag2", ...],
      "description": "..."
    }
  ]
}

Do not include any markdown formatting, explanations, or text outside the JSON object.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    console.log('📝 Raw AI response:', content.substring(0, 200) + '...');

    const parsed = JSON.parse(content);
    const suggestions = parsed.suggestions || [];

    if (suggestions.length !== 3) {
      throw new Error(`Expected 3 suggestions, got ${suggestions.length}`);
    }

    // Validate structure
    suggestions.forEach((s: any, i: number) => {
      if (!s.title || !Array.isArray(s.tags) || !s.description) {
        throw new Error(`Suggestion ${i + 1} missing required fields`);
      }
    });

    console.log('✅ Generated 3 viral suggestions');

    return suggestions;
  } catch (error: any) {
    console.error('❌ Error generating suggestions:', error.message);

    // Fallback suggestions if AI fails
    console.log('⚠️  Using fallback suggestions');
    return generateFallbackSuggestions(userPrompt);
  }
}

/**
 * Generate enhanced thumbnail text overlay suggestions
 */
export async function generateThumbnailText(
  imageAnalysis: string,
  userPrompt: string
): Promise<string[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log('💬 Generating thumbnail text overlays...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Based on this thumbnail analysis and user description, suggest 5 short, punchy text overlays that would work great on a YouTube thumbnail.

Thumbnail Analysis:
${imageAnalysis}

User's Concept:
"${userPrompt}"

Requirements:
- Each text should be 1-4 words maximum
- Use power words that grab attention
- Create curiosity or emotion
- Should be readable when large and bold
- Mix of statements and questions

Return ONLY a JSON array of strings, like:
["TEXT 1", "TEXT 2", "TEXT 3", "TEXT 4", "TEXT 5"]

No markdown, no explanations, just the JSON array.`
        }
      ],
      max_tokens: 200,
      temperature: 0.9
    });

    const content = response.choices[0]?.message?.content?.trim() || '[]';
    const textSuggestions = JSON.parse(content);

    if (!Array.isArray(textSuggestions) || textSuggestions.length === 0) {
      throw new Error('Invalid text suggestions format');
    }

    console.log('✅ Generated thumbnail text suggestions:', textSuggestions);
    return textSuggestions;
  } catch (error: any) {
    console.error('❌ Error generating thumbnail text:', error.message);

    // Fallback text suggestions
    return [
      'SHOCKING!',
      'YOU WON\'T BELIEVE',
      'MUST WATCH',
      'EXPOSED',
      'THE TRUTH'
    ];
  }
}

/**
 * Fallback suggestions when AI is unavailable or fails
 */
function generateFallbackSuggestions(userPrompt: string): ThumbnailSuggestion[] {
  const baseTitle = userPrompt.substring(0, 50);

  return [
    {
      title: `${baseTitle} - You Won't Believe What Happened!`,
      tags: [
        'viral', 'trending', 'must watch', 'shocking', 'amazing',
        'youtube', 'popular', 'best', 'new', 'latest',
        baseTitle.split(' ')[0]?.toLowerCase() || 'video'
      ],
      description: `In this video, we explore ${userPrompt}. Get ready for an incredible journey that will change the way you see things. Don't forget to like, subscribe, and hit the notification bell for more amazing content!\n\n🔔 Subscribe: [Your Channel]\n👍 Like this video if you enjoyed it\n💬 Comment your thoughts below\n\n#Viral #Trending #MustWatch`
    },
    {
      title: `How to Master ${baseTitle} - Complete Guide 2025`,
      tags: [
        'tutorial', 'guide', 'how to', 'tips', 'tricks',
        'learn', 'education', 'beginner', 'expert', 'pro',
        baseTitle.split(' ')[0]?.toLowerCase() || 'video'
      ],
      description: `Learn everything about ${userPrompt} in this comprehensive guide! Whether you're a beginner or looking to improve your skills, this video has you covered.\n\n📚 What you'll learn:\n✓ Essential tips and tricks\n✓ Pro strategies\n✓ Common mistakes to avoid\n\nDon't forget to subscribe for more tutorials!\n\n#Tutorial #HowTo #Guide #Learn`
    },
    {
      title: `${baseTitle} - This Changes EVERYTHING! 🔥`,
      tags: [
        'entertainment', 'fun', 'exciting', 'awesome', 'incredible',
        'epic', 'insane', 'crazy', 'wow', 'omg',
        baseTitle.split(' ')[0]?.toLowerCase() || 'video'
      ],
      description: `🔥 This is the most INSANE video about ${userPrompt} you'll ever watch! The results will blow your mind.\n\n🎬 Watch till the end for a HUGE surprise!\n\n💪 If you enjoyed this, smash that like button and subscribe for more epic content. Your support means everything!\n\n👇 DROP A COMMENT and let me know what you think!\n\n#Epic #Insane #MindBlowing #Amazing`
    }
  ];
}

/**
 * Check if OpenAI is configured
 */
export function isAIEnabled(): boolean {
  return openai !== null;
}

/**
 * Get AI service status
 */
export function getAIServiceStatus() {
  return {
    enabled: isAIEnabled(),
    model: 'gpt-4o',
    features: isAIEnabled()
      ? ['image-analysis', 'viral-suggestions', 'text-generation']
      : []
  };
}
