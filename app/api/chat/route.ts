import { anthropic } from "@ai-sdk/anthropic";
import { openai } from '@ai-sdk/openai'
import { convertToCoreMessages, streamText, tool } from "ai";
import { CodeInterpreter } from "@e2b/code-interpreter";
import { z } from "zod";
import { geolocation } from "@vercel/functions";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, model } = await req.json();
  const { latitude, longitude, city } = geolocation(req)

  let ansmodel;

  if (model === "claude-3-5-sonnet-20240620") {
    ansmodel = anthropic(model);
  } else {
    ansmodel = openai(model);
  }

  const result = await streamText({
    model: ansmodel,
    messages: convertToCoreMessages(messages),
    temperature: 0,
    maxTokens: 800,
    system: `
You are an AI web search engine that helps users find information on the internet.
Always start with running the tool(s) and then and then only write your response AT ALL COSTS!!
Your goal is to provide accurate, concise, and well-formatted responses to user queries.
Do not announce or inform the user in any way that your going to run a tool at ALL COSTS!! Just 'run' it and then write your response AT ALL COSTS!!!!!

The current date is ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit", weekday: "short" })}. 
The user is located in ${city}(${latitude}, ${longitude}).

Here are the tools available to you:
<available_tools>
web_search, retrieve, get_weather_data, programming
</available_tools>

Here is the general guideline per tool to follow when responding to user queries:
- Use the web_search tool to gather relevant information. The query should only be the word that need's context for search. Then write the response based on the information gathered. On searching for latest topic put the year in the query or put the word 'latest' in the query.
- If you need to retrieve specific information from a webpage, use the retrieve tool. Then, compose your response based on the retrieved information.
- For weather-related queries, use the get_weather_data tool. Then, provide the weather information in your response.
- For programming-related queries, use the programming tool to execute Python code. The print() function doesn't work at all with this tool, so just put variable names in the end seperated with commas, it will print them. Then, compose your response based on the output of the code execution.

Always remember to run the appropriate tool first, then compose your response based on the information gathered.
All tool should be called only once per response.

Citations should be placed at the end of each paragraph and in the end of sentences where you use it in which they are referred to with the given format to the information provided.
When citing sources(citations), use the following styling only: Claude 3.5 Sonnet is designed to offer enhanced intelligence and capabilities compared to its predecessors, positioning itself as a formidable competitor in the AI landscape [Claude 3.5 Sonnet raises the..](https://www.anthropic.com/news/claude-3-5-sonnet).
ALWAYS REMEMBER TO USE THE CITATIONS FORMAT CORRECTLY AT ALL COSTS!! ANY SINGLE ITCH IN THE FORMAT WILL CRASH THE RESPONSE!!
When asked a "What is" question, maintain the same format as the question and answer it in the same format.

DO NOT write any kind of html sort of tags(<></>) or lists in the response at ALL COSTS!! NOT EVEN AN ENCLOSING TAGS FOR THE RESPONSE AT ALL COSTS!!

Format your response in paragraphs(min 4) with 3-6 sentences each, keeping it brief but informative. DO NOT use pointers or make lists of any kind at ALL!
Begin your response by using the appropriate tool(s), then provide your answer in a clear and concise manner.
Never respond to user before running any tool like 
- saying 'Certainly! Let me blah blah blah' 
- or 'To provide you with the best answer, I will blah blah blah' 
- or that 'Based on search results, I think blah blah blah' at ALL COSTS!!
Just run the tool and provide the answer.`,
    tools: {
      web_search: tool({
        description:
          "Search the web for information with the given query, max results and search depth.",
        parameters: z.object({
          query: z.string().describe("The search query to look up on the web."),
          maxResults: z
            .number()
            .describe(
              "The maximum number of results to return. Default to be used is 10.",
            ),
          searchDepth: z
            .enum(["basic", "advanced"])
            .describe(
              "The search depth to use for the search. Default is basic.",
            ),
          exclude_domains: z
            .array(z.string())
            .optional()
            .describe(
              "A list of domains to specifically exclude from the search results. Default is None, which doesn't exclude any domains.",
            ),
        }),
        execute: async ({
          query,
          maxResults,
          searchDepth,
          exclude_domains,
        }: {
          query: string;
          maxResults: number;
          searchDepth: "basic" | "advanced";
          exclude_domains?: string[];
        }) => {
          const apiKey = process.env.TAVILY_API_KEY;
          const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              api_key: apiKey,
              query,
              max_results: maxResults < 5 ? 5 : maxResults,
              search_depth: searchDepth,
              include_answers: true,
              exclude_domains: exclude_domains,
            }),
          });

          const data = await response.json();

          let context = data.results.map(
            (obj: { url: any; content: any; title: any; raw_content: any }) => {
              return {
                url: obj.url,
                title: obj.title,
                content: obj.content,
                raw_content: obj.raw_content,
              };
            },
          );

          return {
            results: context,
          };
        },
      }),
      retrieve: tool({
        description: "Retrieve the information from a URL.",
        parameters: z.object({
          url: z.string().describe("The URL to retrieve the information from."),
        }),
        execute: async ({ url }: { url: string }) => {
          let hasError = false;

          let results;
          try {
            const response = await fetch(`https://r.jina.ai/${url}`, {
              method: "GET",
              headers: {
                Accept: "application/json",
                "X-With-Generated-Alt": "true",
              },
            });
            const json = await response.json();
            if (!json.data || json.data.length === 0) {
              hasError = true;
            } else {
              // Limit the content to 5000 characters
              if (json.data.content.length > 5000) {
                json.data.content = json.data.content.slice(0, 5000);
              }
              results = {
                results: [
                  {
                    title: json.data.title,
                    content: json.data.content,
                    url: json.data.url,
                  },
                ],
                query: "",
                images: [],
              };
            }
          } catch (error) {
            hasError = true;
            console.error("Retrieve API error:", error);
          }

          if (hasError || !results) {
            return results;
          }

          return results;
        },
      }),
      get_weather_data: tool({
        description: "Get the weather data for the given coordinates.",
        parameters: z.object({
          lat: z.number().describe("The latitude of the location."),
          lon: z.number().describe("The longitude of the location."),
        }),
        execute: async ({ lat, lon }: { lat: number; lon: number }) => {
          const apiKey = process.env.OPENWEATHER_API_KEY;
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`,
          );
          const data = await response.json();
          return data;
        },
      }),
      programming: tool({
        description: "Write and execute Python code.",
        parameters: z.object({
          code: z.string().describe("The Python code to execute."),
        }),
        execute: async ({ code }: { code: string }) => {
          const sandbox = await CodeInterpreter.create();
          const execution = await sandbox.notebook.execCell(code);
          if (execution.results.length > 0) {
            let message: string = "";
            for (const result of execution.results) {
              if (result.isMainResult) {
                message += `${result.text}\n`;
              } else {
                message += `${result.text}\n`;
              }
              if (result.formats().length > 0) {
                message += `It has following formats: ${result.formats()}\n`;
              }
            }

            sandbox.close();
            return message;
          }

          if (
            execution.logs.stdout.length > 0 ||
            execution.logs.stderr.length > 0
          ) {
            let message = "";
            if (execution.logs.stdout.length > 0) {
              message += `${execution.logs.stdout.join("\n")}\n`;
            }
            if (execution.logs.stderr.length > 0) {
              message += `${execution.logs.stderr.join("\n")}\n`;
            }

            sandbox.close();
            return message;
          }

          sandbox.close();
          return "There was no output of the execution.";
        },
      }),
    },
    toolChoice: "auto",
  });

  return result.toAIStreamResponse();
}
