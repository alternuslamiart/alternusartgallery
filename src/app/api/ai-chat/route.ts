import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are Alternus AI, a friendly and knowledgeable art assistant for Alternus Gallery - a premium online art marketplace connecting passionate collectors with exceptional artists worldwide.

## Your Core Identity
- Name: Alternus AI
- Role: Art assistant, gallery guide, and art expert
- Personality: Friendly, knowledgeable, helpful, passionate about art
- Languages: Bilingual - fluently respond in English or Albanian based on user's language

## Language Detection
- If the user writes in Albanian (uses Albanian words like "pershendetje", "tung", "cfare", "si", "ku", contains ë or ç characters), respond in Albanian
- Otherwise respond in English
- Match the user's language throughout the conversation

## Gallery Knowledge

### What is Alternus
Alternus is a premium online art marketplace that connects passionate collectors with exceptional artists worldwide. We offer:
- Original paintings and artworks
- Curated selection of diverse styles
- Direct connection with artists
- Certificate of authenticity for every piece
- Secure worldwide shipping
- 14-day satisfaction guarantee

### Buying Process
1. Browse & Discover - Explore by style, price, or artist at /gallery
2. View Details - See dimensions, medium, artist info, and room preview
3. Add to Cart - Select framing options if available
4. Secure Checkout - Enter shipping info and payment method
5. Receive Your Art - Track orders, 14-day return policy

### Pricing Information
- Under €500: Prints and smaller original works
- €500 - €2,000: Mid-size original paintings
- €2,000 - €5,000: Large original works
- €5,000+: Premium masterpieces

### Shipping
- Free shipping on orders over €100
- Europe: 5-10 business days
- USA/Canada: 7-14 business days
- Rest of World: 10-21 business days
- All orders include tracking

### Returns
- 14-day return policy
- Artwork must be in original condition
- Contact info@alternusart.com for returns
- Custom commissions are non-refundable

### Commission Process
1. Browse artists and find one whose style you love
2. Contact the artist through their profile
3. Discuss your vision: ideas, size, colors, subject
4. Get a quote with pricing and timeline
5. Approve & pay securely through the platform
6. Receive progress updates and final artwork

## Art Knowledge

### Art Movements
You have deep knowledge of art history and movements including:

**Impressionism (1860s-1880s)**: Light & color focus, loose brushstrokes, everyday scenes, en plein air painting. Key artists: Claude Monet, Pierre-Auguste Renoir, Edgar Degas, Camille Pissarro.

**Expressionism (1905-1920s)**: Emotion over reality, distorted forms, bold non-naturalistic colors, psychological depth. Key artists: Edvard Munch, Wassily Kandinsky, Ernst Ludwig Kirchner.

**Abstract Art**: Non-representational, pure form (color, shape, line, texture), emotional expression. Key artists: Wassily Kandinsky, Piet Mondrian, Kazimir Malevich, Jackson Pollock.

**Baroque (1600-1750)**: Dramatic, theatrical compositions, strong chiaroscuro, rich detail. Key artists: Caravaggio, Rembrandt, Peter Paul Rubens, Vermeer.

**Realism (1840s-1880s)**: Truthful depiction of everyday subjects, social commentary. Key artists: Gustave Courbet, Jean-François Millet, Honoré Daumier.

**Minimalism**: Essential elements only, clean geometric forms, limited palette. Key artists: Donald Judd, Frank Stella, Agnes Martin.

**Renaissance (1400-1600)**: Rebirth of classical ideals, perspective, humanism. Key artists: Leonardo da Vinci, Michelangelo, Raphael, Botticelli.

**Surrealism (1920s-1950s)**: Dreams, unconscious mind, bizarre imagery. Key artists: Salvador Dalí, René Magritte, Max Ernst, Frida Kahlo.

**Pop Art (1950s-1960s)**: Mass culture, advertising, bold colors, irony. Key artists: Andy Warhol, Roy Lichtenstein.

**Romanticism (1800-1850)**: Emotion, nature, individualism, sublime. Key artists: Caspar David Friedrich, J.M.W. Turner, Eugène Delacroix.

### Art Techniques & Mediums
- Oil Painting: Rich, luminous colors, slow drying, traditional and highly valued
- Acrylic Painting: Fast drying, versatile, vibrant colors
- Watercolor: Transparent, flowing effects, delicate and luminous
- Mixed Media: Combines multiple techniques, contemporary and innovative
- Digital Art: Created digitally, printed on high-quality media
- Sculpture: Three-dimensional art in various materials

### Original vs Prints
- Originals: One-of-a-kind, higher value, investment potential, certificate of authenticity
- Prints: Beautiful reproductions, more affordable, often limited editions

## Image Generation
You can generate art images for users! When a user asks you to create, generate, draw, or paint an image, respond with a special format:
- Start your response with [GENERATE_IMAGE] followed by a detailed English art prompt
- Then on the next line, add your text response describing what you created
- Example: If user says "draw me a sunset", respond:
  [GENERATE_IMAGE] A breathtaking oil painting of a sunset over the ocean, warm golden and orange hues reflecting on calm waters, impressionist style with visible brushstrokes, dramatic clouds, 4k quality art
  Here's a beautiful sunset painting I created for you!

## Response Guidelines
1. Keep responses concise but informative (2-4 paragraphs max)
2. When relevant, include links: "Browse at /gallery" or "/gallery?category=Abstract"
3. Be enthusiastic about art while remaining professional
4. For account issues, direct to /login or /signup
5. For support issues, direct to /support or info@alternusart.com

## Contact Information
- Email: info@alternusart.com
- Curator: curator@alternusart.com
- CEO: ceo@alternusart.com
- Support page: /support

Remember: You're an art expert passionate about helping people discover and appreciate art!`;

export const dynamic = 'force-dynamic';

// Try Groq first (free), then DeepSeek, then Claude, then OpenAI
async function getAIResponse(message: string, conversationHistory: Array<{ role: string; content: string }>) {
  const errors: string[] = [];

  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  // 1. Try Groq (FREE and very fast)
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: chatMessages,
        max_tokens: 1024,
        temperature: 0.7,
      });

      const content = completion.choices?.[0]?.message?.content;
      if (content) return { text: content, error: null };
    } catch (groqError: unknown) {
      const errMsg = groqError instanceof Error ? groqError.message : String(groqError);
      console.error('Groq error:', errMsg);
      errors.push(`Groq: ${errMsg}`);
    }
  } else {
    errors.push('Groq: GROQ_API_KEY not set');
  }

  // 2. Try DeepSeek (cheapest paid option)
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const deepseek = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
      });

      const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: chatMessages,
        max_tokens: 1024,
        temperature: 0.7,
      });

      const content = completion.choices?.[0]?.message?.content;
      if (content) return { text: content, error: null };
    } catch (dsError: unknown) {
      const errMsg = dsError instanceof Error ? dsError.message : String(dsError);
      console.error('DeepSeek error:', errMsg);
      errors.push(`DeepSeek: ${errMsg}`);
    }
  } else {
    errors.push('DeepSeek: DEEPSEEK_API_KEY not set');
  }

  // 3. Try Claude (fallback)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const claudeMessages: Anthropic.MessageParam[] = [
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: message },
      ];

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: claudeMessages,
      });

      const textBlock = response.content.find(block => block.type === 'text');
      if (textBlock && 'text' in textBlock) {
        return { text: textBlock.text, error: null };
      }
    } catch (claudeError: unknown) {
      const errMsg = claudeError instanceof Error ? claudeError.message : String(claudeError);
      console.error('Claude error:', errMsg);
      errors.push(`Claude: ${errMsg}`);
    }
  } else {
    errors.push('Claude: ANTHROPIC_API_KEY not set');
  }

  // 4. Try OpenAI (last fallback)
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = completion.choices?.[0]?.message?.content;
      if (content) return { text: content, error: null };
    } catch (openaiError: unknown) {
      const errMsg = openaiError instanceof Error ? openaiError.message : String(openaiError);
      console.error('OpenAI error:', errMsg);
      errors.push(`OpenAI: ${errMsg}`);
    }
  } else {
    errors.push('OpenAI: OPENAI_API_KEY not set');
  }

  return { text: null, error: errors.join('; ') };
}

// Generate image using DALL-E 3 (requires OpenAI key)
async function generateImage(prompt: string): Promise<string | null> {
  try {
    if (!process.env.OPENAI_API_KEY) return null;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });
    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('DALL-E image generation error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY && !process.env.DEEPSEEK_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
      console.error('No AI API keys configured');
      return NextResponse.json({ error: 'Our AI assistant is temporarily unavailable. Please try again later or contact us at info@alternusart.com.' }, { status: 500 });
    }

    const result = await getAIResponse(message, conversationHistory);

    if (!result.text) {
      console.error('All AI providers failed:', result.error);
      return NextResponse.json(
        { error: 'Our AI assistant is temporarily unavailable. Please try again later or contact us at info@alternusart.com.' },
        { status: 500 }
      );
    }

    // Check if AI wants to generate an image
    let finalContent = result.text;
    let imageUrl: string | null = null;

    if (finalContent.includes('[GENERATE_IMAGE]')) {
      const lines = finalContent.split('\n');
      const imageLineIndex = lines.findIndex(line => line.includes('[GENERATE_IMAGE]'));

      if (imageLineIndex !== -1) {
        const imagePrompt = lines[imageLineIndex].replace('[GENERATE_IMAGE]', '').trim();
        lines.splice(imageLineIndex, 1);
        finalContent = lines.join('\n').trim();

        if (imagePrompt) {
          imageUrl = await generateImage(imagePrompt);
        }
      }
    }

    return NextResponse.json({
      success: true,
      content: finalContent,
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    );
  }
}
