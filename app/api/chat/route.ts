import { openai } from "@ai-sdk/openai";
import { anthropic } from '@ai-sdk/anthropic'
import { convertToCoreMessages, streamText } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, model } = await req.json();

  let ansmodel;

  if (model === "claude-3-5-sonnet-20240620") {
    ansmodel = anthropic("claude-3-5-sonnet-20240620")
  } else {
    ansmodel = openai(model)
  }

  const result = await streamText({
    model: ansmodel,
    messages: convertToCoreMessages(messages),
    system:
      "You are an AI web search engine that helps users find information on the internet." +
      "You use the 'web_search' tool to search for information on the internet." +
      "Always call the 'web_search' tool to get the information, no need to do a chain of thought or say anything else, go straight to the point." +
      "Once you have found the information, you provide the user with the information you found in brief like a news paper detail." +
      "The detail should be 3-5 paragraphs in 10-12 sentences, some time pointers, each with citations in the [Text](link) format always!" +
      "Citations can be inline of the text like this: Hey there! [Google](https://google.com) is a search engine." +
      "The current date is: " +
      new Date()
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          weekday: "short",
        })
        .replace(/(\w+), (\w+) (\d+), (\d+)/, "$4-$2-$3 ($1)") +
      "Never use the heading format in your response!." +
      "Refrain from saying things like 'Certainly! I'll search for information about OpenAI GPT-4o mini using the web search tool.'",
    tools: {
      web_search: {
        description: 'Search the web for information with the given query, max results and search depth.',
        parameters: z.object({
          query: z.string()
            .describe('The search query to look up on the web.'),
          maxResults: z.number()
            .describe('The maximum number of results to return. Default to be used is 10.'),
          searchDepth: // use basic | advanced 
            z.enum(['basic', 'advanced'])
              .describe('The search depth to use for the search. Default is basic.')
        }),
        execute: async ({ query, maxResults, searchDepth }: { query: string, maxResults: number, searchDepth: 'basic' | 'advanced' }) => {
          const apiKey = process.env.TAVILY_API_KEY
          const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              api_key: apiKey,
              query,
              max_results: maxResults < 5 ? 5 : maxResults,
              search_depth: searchDepth,
              include_images: true,
              include_answers: true
            })
          })

          const data = await response.json()

          let context = data.results.map((obj: { url: any; content: any; title: any; raw_content: any; }) => {
            return {
              url: obj.url,
              title: obj.title,
              content: obj.content,
              raw_content: obj.raw_content
            }
          })

          return {
            results: context
          }
        }
      },
    },
    onFinish: async (event) => {
      console.log(event.text);
    }
  });

  return result.toAIStreamResponse();
}
