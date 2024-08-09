'use server';

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export async function suggestQuestions(history: Message[]) {
    'use server';

    const { object } = await generateObject({
        model: openai('gpt-4o-mini'),
        temperature: 0,
        system: 
`You are a search engine query generator. You 'have' to create 3 questions for the search engine based on the message history which has been provided to you.
The questions should be open-ended and should encourage further discussion while maintaining the whole context. Limit it to 5-10 words per question. 
Always put the user input's context is some way so that the next search knows what to search for exactly.
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