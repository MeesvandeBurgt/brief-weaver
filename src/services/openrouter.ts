import { OpenRouterRequest, OpenRouterResponse, OpenRouterMessage } from '@/types';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = 'xiaomi/mimo-v2-flash:free';

interface RequestOptions {
  maxRetries?: number;
  initialDelay?: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callOpenRouter(
  request: Omit<OpenRouterRequest, 'model'>,
  options: RequestOptions = {}
): Promise<OpenRouterMessage> {
  const { maxRetries = 3, initialDelay = 1000 } = options;

  const fullRequest: OpenRouterRequest = {
    model: MODEL,
    ...request,
    temperature: request.temperature ?? 0.8,
    max_tokens: request.max_tokens ?? 2000,
    reasoning: { enabled: true }
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Critical Design Brief Analyzer',
        },
        body: JSON.stringify(fullRequest),
      });

      if (response.status === 429) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Rate limited, waiting ${delay}ms before retry...`);
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices returned');
      }

      return data.choices[0].message;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Request failed, retrying in ${delay}ms...`, error);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export async function* streamOpenRouter(
  request: Omit<OpenRouterRequest, 'model' | 'stream'>
): AsyncGenerator<string, void, unknown> {
  const fullRequest: OpenRouterRequest = {
    model: MODEL,
    ...request,
    stream: true,
    temperature: request.temperature ?? 0.8,
    max_tokens: request.max_tokens ?? 2000,
    reasoning: { enabled: true }
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Critical Design Brief Analyzer',
    },
    body: JSON.stringify(fullRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
