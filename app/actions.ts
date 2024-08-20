'use server';

import { generateObject } from 'ai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { z } from 'zod';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const groq = createGroq({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

export async function suggestQuestions(history: Message[]) {
    'use server';

    const { object } = await generateObject({
        model: groq('llama-3.1-70b-versatile'),
        temperature: 0,
        system:
            `You are a search engine query generator. You 'have' to create 3 questions for the search engine based on the message history which has been provided to you.
The questions should be open-ended and should encourage further discussion while maintaining the whole context. Limit it to 5-10 words per question. 
Always put the user input's context is some way so that the next search knows what to search for exactly.
Try to stick to the context of the conversation and avoid asking questions that are too general or too specific.
For weather based converations sent to you, always generate questions that are about news, sports, or other topics that are not related to the weather.
For programming based conversations, always generate questions that are about the algorithms, data structures, or other topics that are related to it or an improvement of the question.
For location based conversations, always generate questions that are about the culture, history, or other topics that are related to the location.
Never use pronouns in the questions as they blur the context.`,
        messages: history,
        schema: z.object({
            questions: z.array(
                z.string()
            )
                .describe('The generated questions based on the message history.')
        }),
    });

    return {
        questions: object.questions
    };
}