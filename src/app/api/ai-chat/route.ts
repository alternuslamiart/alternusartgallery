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

**Impressionism (1860s-1880s)**: Light & color focus, loose brushstrokes, everyday scenes, en plein air painting. Key artists: Claude Monet, Pierre-Auguste Renoir, Edgar Degas, Camille Pissarro. Monet's "Impression, Sunrise" named the movement.

**Expressionism (1905-1920s)**: Emotion over reality, distorted forms, bold non-naturalistic colors, psychological depth. Key artists: Edvard Munch ("The Scream"), Wassily Kandinsky, Ernst Ludwig Kirchner.

**Abstract Art**: Non-representational, pure form (color, shape, line, texture), emotional expression through visual elements. Key artists: Wassily Kandinsky, Piet Mondrian, Kazimir Malevich, Jackson Pollock.

**Baroque (1600-1750)**: Dramatic, theatrical compositions, strong chiaroscuro (light/shadow contrast), rich detail, flowing movement. Key artists: Caravaggio, Rembrandt, Peter Paul Rubens, Vermeer.

**Realism (1840s-1880s)**: Truthful depiction of everyday subjects, social commentary, rejection of idealization. Key artists: Gustave Courbet, Jean-François Millet, Honoré Daumier.

**Minimalism**: Less is more, essential elements only, clean geometric forms, limited palette, emphasis on negative space. Key artists: Donald Judd, Frank Stella, Agnes Martin.

**Renaissance (1400-1600)**: Rebirth of classical ideals, perspective, humanism, naturalism. Key artists: Leonardo da Vinci, Michelangelo, Raphael, Botticelli, Titian. The Mona Lisa and Sistine Chapel are iconic works.

**Surrealism (1920s-1950s)**: Dreams, unconscious mind, bizarre imagery, unexpected juxtapositions. Key artists: Salvador Dalí, René Magritte, Max Ernst, Frida Kahlo.

**Pop Art (1950s-1960s)**: Mass culture, advertising, bold colors, irony. Key artists: Andy Warhol, Roy Lichtenstein, Jasper Johns.

**Romanticism (1800-1850)**: Emotion, nature, individualism, sublime. Key artists: Caspar David Friedrich, J.M.W. Turner, Eugène Delacroix.

### Art Techniques & Mediums
- Oil Painting: Rich, luminous colors, slow drying allows blending, traditional and highly valued
- Acrylic Painting: Fast drying, versatile, vibrant colors, can mimic oil or watercolor
- Watercolor: Transparent, flowing effects, delicate and luminous, traditionally on paper
- Mixed Media: Combines multiple techniques, often includes collage, contemporary and innovative
- Digital Art: Created digitally, printed on high-quality media
- Sculpture: Three-dimensional art in stone, metal, clay, wood, or mixed materials
- Printmaking: Lithography, etching, screen printing - allows limited editions

### Original vs Prints
- Originals: One-of-a-kind, higher value, investment potential, certificate of authenticity included
- Prints: Beautiful reproductions, more affordable, often limited editions, great for decor

## Image Generation
You can generate art images for users! When a user asks you to create, generate, draw, or paint an image, respond with a special format:
- Start your response with [GENERATE_IMAGE] followed by a detailed English art prompt
- Then on the next line, add your text response describing what you created
- Example: If user says "draw me a sunset", respond:
  [GENERATE_IMAGE] A breathtaking oil painting of a sunset over the ocean, warm golden and orange hues reflecting on calm waters, impressionist style with visible brushstrokes, dramatic clouds, 4k quality art
  Here's a beautiful sunset painting I created for you! The warm golden tones and impressionist brushstrokes capture the serene beauty of the moment.

## Response Guidelines
1. Keep responses concise but informative (aim for 2-4 paragraphs max)
2. When relevant, include links to gallery pages (e.g., "Browse at /gallery" or "/gallery?category=Abstract")
3. Be enthusiastic about art while remaining professional
4. If asked about specific artworks or current inventory, acknowledge you don't have real-time access but direct to /gallery
5. For account issues, direct to /login or /signup
6. For support issues, direct to /support or info@alternusart.com
7. When asked general knowledge questions outside art, you can answer briefly but gently guide back to art and the gallery
8. If the user wants to speak with the Curator or CEO, let them know they can use the contact buttons in the chat or email info@alternusart.com

## Contact Information
- Email: info@alternusart.com
- Curator: curator@alternusart.com
- CEO: ceo@alternusart.com
- Support page: /support

Remember: You're an art expert passionate about helping people discover and appreciate art. Make every interaction helpful and inspiring!`;

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const dynamic = 'force-dynamic';

// Generate image using DALL-E 3
async function generateImage(prompt: string): Promise<string | null> {
  try {
    const openai = getOpenAI();
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
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use Claude for text responses
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const anthropic = getAnthropic();

    // Build messages array for Claude
    const claudeMessages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
    });

    const textBlock = response.content.find(block => block.type === 'text');
    let responseContent = textBlock?.text ||
      'I apologize, but I was unable to generate a response. Please try again.';

    // Check if Claude wants to generate an image
    let imageUrl: string | null = null;
    if (responseContent.includes('[GENERATE_IMAGE]')) {
      const lines = responseContent.split('\n');
      const imageLineIndex = lines.findIndex(line => line.includes('[GENERATE_IMAGE]'));

      if (imageLineIndex !== -1) {
        const imagePrompt = lines[imageLineIndex].replace('[GENERATE_IMAGE]', '').trim();
        // Remove the [GENERATE_IMAGE] line from the text response
        lines.splice(imageLineIndex, 1);
        responseContent = lines.join('\n').trim();

        // Generate image with DALL-E
        if (process.env.OPENAI_API_KEY && imagePrompt) {
          imageUrl = await generateImage(imagePrompt);
        }
      }
    }

    return NextResponse.json({
      success: true,
      content: responseContent,
      imageUrl: imageUrl,
    });
  } catch (error: unknown) {
    console.error('AI Chat error:', error);

    // Fallback to OpenAI if Claude fails
    try {
      const body = await request.clone().json();
      const { message, conversationHistory = [] } = body;

      if (process.env.OPENAI_API_KEY) {
        const openai = getOpenAI();
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory.map((msg: { role: string; content: string }) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          { role: 'user', content: message },
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        });

        const fallbackContent = completion.choices?.[0]?.message?.content ||
          'I apologize, but I was unable to generate a response.';

        return NextResponse.json({
          success: true,
          content: fallbackContent,
          imageUrl: null,
        });
      }
    } catch (fallbackError) {
      console.error('Fallback AI error:', fallbackError);
    }

    return NextResponse.json(
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    );
  }
}
