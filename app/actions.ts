'use server';

import { OpenAI, AzureOpenAI } from 'openai';
import { generateObject } from 'ai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { z } from 'zod';

const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function suggestQuestions(history: any[]) {
  'use server';

  const { object } = await generateObject({
    model: groq('llama-3.1-70b-versatile'),
    temperature: 0,
    system:
      `You are a search engine query generator. You 'have' to create only '3' questions for the search engine based on the message history which has been provided to you.
The questions should be open-ended and should encourage further discussion while maintaining the whole context. Limit it to 5-10 words per question. 
Always put the user input's context is some way so that the next search knows what to search for exactly.
Try to stick to the context of the conversation and avoid asking questions that are too general or too specific.
For weather based converations sent to you, always generate questions that are about news, sports, or other topics that are not related to the weather.
For programming based conversations, always generate questions that are about the algorithms, data structures, or other topics that are related to it or an improvement of the question.
For location based conversations, always generate questions that are about the culture, history, or other topics that are related to the location.
For the translation based conversations, always generate questions that may continue the conversation or ask for more information or translations.
Never use pronouns in the questions as they blur the context.`,
    messages: history,
    schema: z.object({
      questions: z.array(z.string()).describe('The generated questions based on the message history.')
    }),
  });

  return {
    questions: object.questions
  };
}

export async function generateSpeech(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = "alloy") {
  if (process.env.OPENAI_PROVIDER === 'azure') {
    if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_API_URL) {
      throw new Error('Azure OpenAI API key and URL are required.');
    }
    const url = process.env.AZURE_OPENAI_API_URL!;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': process.env.AZURE_OPENAI_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "tts",
        input: text,
        voice: voice
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return {
      audio: `data:audio/mp3;base64,${base64Audio}`,
    };
  } else if (process.env.OPENAI_PROVIDER === 'openai') {
    const openai = new OpenAI();

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return {
      audio: `data:audio/mp3;base64,${base64Audio}`,
    };
  } else {
    const openai = new OpenAI();

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    const arrayBuffer = await response.arrayBuffer();

    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return {
      audio: `data:audio/mp3;base64,${base64Audio}`,
    };
  }
}