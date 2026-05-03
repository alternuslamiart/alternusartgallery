import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

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

async function getOpenAIResponse(message: string, conversationHistory: Array<{ role: string; content: string }>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { text: null, error: 'OPENAI_API_KEY not set' };
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const chatMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.map((msg): ChatCompletionMessageParam => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.7,
      max_tokens: 1024,
      messages: chatMessages,
    });

    const text = response.choices[0]?.message?.content;
    if (text) {
      return { text, error: null };
    }

    return { text: null, error: 'No response from OpenAI' };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('OpenAI error:', errMsg);
    return { text: null, error: errMsg };
  }
}

async function getAnthropicResponse(message: string, conversationHistory: Array<{ role: string; content: string }>) {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    return { text: null, error: 'ANTHROPIC_API_KEY not set' };
  }

  const messages = [
    ...conversationHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', response.status, errorData);
      return { text: null, error: `Anthropic API error: ${response.status}` };
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;

    if (text) {
      return { text, error: null };
    }

    return { text: null, error: 'No response from Claude' };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Anthropic error:', errMsg);
    return { text: null, error: errMsg };
  }
}

async function getAIResponse(message: string, conversationHistory: Array<{ role: string; content: string }>) {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);

  if (!hasOpenAI && !hasAnthropic) {
    return { text: null, error: 'No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.' };
  }

  if (hasOpenAI) {
    const openAIResult = await getOpenAIResponse(message, conversationHistory);
    if (openAIResult.text) return openAIResult;

    console.error('OpenAI provider failed:', openAIResult.error);
    if (!hasAnthropic) {
      return { text: null, error: `OpenAI failed: ${openAIResult.error}` };
    }
  }

  if (hasAnthropic) {
    const anthropicResult = await getAnthropicResponse(message, conversationHistory);
    if (anthropicResult.text) return anthropicResult;
    return { text: null, error: `Anthropic failed: ${anthropicResult.error}` };
  }

  return { text: null, error: 'No AI provider available.' };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.error('No AI provider API key configured');
      return NextResponse.json(
        { error: 'AI provider is not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY on the server.' },
        { status: 500 }
      );
    }

    const result = await getAIResponse(message, conversationHistory);

    if (!result.text) {
      console.error('AI provider failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Our AI assistant is temporarily unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: result.text,
      imageUrl: null,
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    );
  }
}
