import { anthropic } from '@ai-sdk/anthropic'
import { convertToCoreMessages, streamText, tool } from "ai";
import { CodeInterpreter } from '@e2b/code-interpreter'
import { z } from "zod";
import { geolocation } from '@vercel/functions'

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, model } = await req.json();
  const { latitude, longitude, city } = geolocation(req)

  const ansmodel = anthropic(model);

  const result = await streamText({
    model: ansmodel,
    messages: convertToCoreMessages(messages),
    temperature: 0,
    maxTokens: 800,
    system:
      "You are an AI web search engine that helps users find information on the internet.\n" +
      "Always start with running the tool(s) and then and then only write your response AT ALL COSTS!!\n" +
      "Never write a response without running the tool(s) first!\n" +
      "Do not announce or inform the user in any way that your going to run a tool at ALL COSTS!! Just `run` it and then write your response AT ALL COSTS!!!!!." +
      "Tool Usage Instructions:\n" +
      "The user is located in " + city + " at latitude " + latitude + " and longitude " + longitude + "." +
      "Use this geolocation data for weather tool, when the user doesn't provide a specific location." +
      "You use the 'web_search' tool to search for information on the internet before saying anyting to the user." +
      "Incomplete details or any other said words before the search tool result in a bad response." +
      "Always call the 'web_search' tool to get the information, no need to do a chain of thought or say anything else, go straight to the point." +
      "Once you have found the information, you provide the user with the information you found in brief like a news paper detail." +
      "The detail should be 3-5 paragraphs in 10-12 sentences and put citations using the markdown link format like this always: [source text](link to the site) in the end of each paragraph!" + 
      "Citations will the render in the client side, so please make sure you format them correctly!" +
      "Never use pointers, unless asked to." +
      "Do not start the responses with newline characters, always start with the first sentence." +
      "When the user asks about a Stock, you should 'always' first gather news about it with web search tool, then show the chart and then write your response. Follow these steps in this order only!" +
      "Never use the retrieve tool for general search. Always use it when the user provides an url! " +
      "For weather related questions, use get_weather_data tool and write your response. No need to call any other tool. DO NOT put citation to OpenWeatherMaps API EVER!" + 
      "Use the 'programming' tool to execute Python code for cases like calculating, sorting, etc. that require computation. " + 
      "The environment is like a jupyter notebook so don't write print statements at all costs!, just write variables in the end.\n\n" +
      "The current date is: " +
      new Date()
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          weekday: "short",
        })
        .replace(/(\w+), (\w+) (\d+), (\d+)/, "$4-$2-$3 ($1)") +
      "." +
      "Rules for the response:\n" +
      "Use a story telling format in your response, like a news article ALWAYS! This is for all tools except programming!" +
      "Never start with 'based on the search results,...' EVER! Always start with the information you found like an article!" +
      "Never use the heading format in your response!." +
      "Do not use print statements in the code execution tool, just the variables." +
      "Don't say things like 'Okay I am going to perform some action.' OR 'Certainly! To count the number of 'r's in the word 'strawberry', we can use a simple Python code. Let's use the programming tool to execute this task.' The user's DO NOT LIKE TO WAIT! REMEMBER THE THING ABOUT PRINT STATEMENTS! NEVER WRITE 'EM!" +
      "IMPORTANT!!!: Refrain from saying things like that mention that your going to perform a certain action, example: 'Certainly! I'll search for information about <something> using the web search tool.'",
    tools: {
      web_search: tool({
        description: 'Search the web for information with the given query, max results and search depth.',
        parameters: z.object({
          query: z.string()
            .describe('The search query to look up on the web.'),
          maxResults: z.number()
            .describe('The maximum number of results to return. Default to be used is 10.'),
          searchDepth:
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
      }),
      retrieve: tool({
        description: 'Retrieve the information from a URL.',
        parameters: z.object({
          url: z.string().describe('The URL to retrieve the information from.')
        }),
        execute: async ({ url }: { url: string }) => {
          let hasError = false

          let results;
          try {
            const response = await fetch(`https://r.jina.ai/${url}`, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'X-With-Generated-Alt': 'true'
              }
            })
            const json = await response.json()
            if (!json.data || json.data.length === 0) {
              hasError = true
            } else {
              // Limit the content to 5000 characters
              if (json.data.content.length > 5000) {
                json.data.content = json.data.content.slice(0, 5000)
              }
              results = {
                results: [
                  {
                    title: json.data.title,
                    content: json.data.content,
                    url: json.data.url
                  }
                ],
                query: '',
                images: []
              }
            }
          } catch (error) {
            hasError = true
            console.error('Retrieve API error:', error)
          }

          if (hasError || !results) {
            return results
          }

          return results
        }
      }),
      get_weather_data: tool({
        description: "Get the weather data for the given coordinates.",
        parameters: z.object({
          lat: z.number().describe('The latitude of the location.'),
          lon: z.number().describe('The longitude of the location.')
        }),
        execute: async ({ lat, lon }: { lat: number, lon: number }) => {
          const apiKey = process.env.OPENWEATHER_API_KEY
          const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
          const data = await response.json()
          return data
        }
      }),
      stock_chart_ui: tool({
        description: 'Display the stock chart for the given stock symbol after web search.',
        parameters: z.object({
          symbol: z.string().describe('The stock symbol to display the chart for.')
        }),
      }),
      programming: tool({
        description: 'Write and execute Python code.',
        parameters: z.object({
          code: z.string().describe('The Python code to execute.')
        }),
        execute: async ({ code }: { code: string }) => {
          const sandbox = await CodeInterpreter.create()
          const execution = await sandbox.notebook.execCell(code)
          if (execution.results.length > 0) {
            let message: string = '';
            for (const result of execution.results) {
              if (result.isMainResult) {
                message += `${result.text}\n`
              } else {
                message += `${result.text}\n`
              }
              if (result.formats().length > 0) {
                message += `It has following formats: ${result.formats()}\n`
              }
            }

            return message
          }

          if (
            execution.logs.stdout.length > 0 ||
            execution.logs.stderr.length > 0
          ) {
            let message = ''
            if (execution.logs.stdout.length > 0) {
              message += `${execution.logs.stdout.join('\n')}\n`
            }
            if (execution.logs.stderr.length > 0) {
              message += `${execution.logs.stderr.join('\n')}\n`
            }

            return message
          }

          return 'There was no output of the execution.'
        }
      }),
    },
  });

  return result.toAIStreamResponse();
}
