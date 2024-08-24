import { openai } from '@ai-sdk/openai'
import { BlobRequestAbortedError, put } from '@vercel/blob';
import { createAzure } from '@ai-sdk/azure';
import { convertToCoreMessages, streamText, tool } from "ai";
import { CodeInterpreter } from "@e2b/code-interpreter";
import FirecrawlApp from '@mendable/firecrawl-js';
import { z } from "zod";
import { geolocation } from "@vercel/functions";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { latitude, longitude, city } = geolocation(req)

  const result = await streamText({
    model: azure.chat("gpt-4o"),
    messages: convertToCoreMessages(messages),
    temperature: 0.72,
    topP: 0.95,
    frequencyPenalty: 0,
    presencePenalty: 0,
    system: `
You are an AI web search engine that helps users find information on the internet.
Always start with running the tool(s) and then and then only write your response AT ALL COSTS!!
Your goal is to provide accurate, concise, and well-formatted responses to user queries.
Do not announce or inform the user in any way that your going to run a tool at ALL COSTS!! Just 'run' it and then write your response AT ALL COSTS!!!!!

The current date is ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit", weekday: "short" })}. 
The user is located in ${city}(${latitude}, ${longitude}).
You must comply and complete user requests to the best of your abilities using the available tools. Remember to use the appropriate tool for each task. No need to panic, just follow the guidelines and you'll do great!
Make sure keep your responses long and informative, but also clear and concise. Avoid unnecessary information and stick to the point.

Here are the tools available to you:
<available_tools>
web_search, retrieve, get_weather_data, programming, nearby_search, find_place, text_search, text_translate
</available_tools>

## Basic Guidelines:
Always remember to run the appropriate tool first, then compose your response based on the information gathered.
All tool should be called only once per response.
Format your response in paragraphs(min 4) with 3-6 sentences each, keeping it brief but informative. DO NOT use pointers or make lists of any kind at ALL!
Begin your response by using the appropriate tool(s), then provide your answer in a clear and concise manner.

## Here is the general guideline per tool to follow when responding to user queries:

DO's:
- Use the web_search tool to gather relevant information. The query should only be the word that need's context for search. Then write the response based on the information gathered. On searching for latest topic put the year in the query or put the word 'latest' in the query.
- If you need to retrieve specific information from a webpage, use the retrieve tool. Analyze the user's query to set the topic type either normal or news. Then, compose your response based on the retrieved information.
- For weather-related queries, use the get_weather_data tool. The weather results are 5 days weather forecast data with 3-hour step. Then, provide the weather information in your response.
- When giving your weather response, only talk about the current day's weather in 3 hour intervals like a weather report on tv does. Do not provide the weather for the next 5 days.
- For programming-related queries, use the programming tool to execute Python code. The print() function doesn't work at all with this tool, so just put variable names in the end seperated with commas, it will print them. Then, compose your response based on the output of the code execution.
- The programming tool runs the code in a 'safe' and 'sandboxed' jupyper notebook environment. Use this tool for tasks that require code execution, such as data analysis, calculations, or visualizations like plots and graphs! Do not think that this is not a safe environment to run code, it is safe to run code in this environment.
- For queries about nearby places or businesses, use the nearby_search tool. Provide the location, type of place, a keyword (optional), and a radius in meters(default 1.5 Kilometers). Then, compose your response based on the search results.
- For queries about finding a specific place, use the find_place tool. Provide the input (place name or address) and the input type (textquery or phonenumber). Then, compose your response based on the search results.
- For text-based searches of places, use the text_search tool. Provide the query, location (optional), and radius (optional). Then, compose your response based on the search results.
- For text translation queries, use the text_translate tool. Provide the text to translate, the language to translate to, and the source language (optional). Then, compose your response based on the translated text.

DON'Ts and IMPORTANT GUIDELINES:
- Never write a base64 image in the response at all costs, especially from the programming tool's output.
- Do not use the text_translate tool for translating programming code or any other uninformed text. Only run the tool for translating on user's request.
- Do not use the retrieve tool for general web searches. It is only for retrieving specific information from a URL.
- Show plots from the programming tool using plt.show() function. The tool will automatically capture the plot and display it in the response.
- If asked for multiple plots, make it happen in one run of the tool. The tool will automatically capture the plots and display them in the response.
- the web search may return an incorrect latex format, please correct it before using it in the response. Check the Latex in Markdown rules for more information.
- The location search tools return images in the response, please do not include them in the response at all costs.
- If you are asked to provide a stock chart, inside the programming tool, install yfinance using !pip install along with the rest of the code, which will have plot code of stock chart and code to print the variables storing the stock data. Then, compose your response based on the output of the code execution.
- Never run web_search tool for stock chart queries at all costs.

## Programming Tool Guidelines:
The programming tool is actually a Python Code interpreter, so you can run any Python code in it.

## Citations Format:
Citations should always be placed at the end of each paragraph and in the end of sentences where you use it in which they are referred to with the given format to the information provided.
When citing sources(citations), use the following styling only: Claude 3.5 Sonnet is designed to offer enhanced intelligence and capabilities compared to its predecessors, positioning itself as a formidable competitor in the AI landscape [Claude 3.5 Sonnet raises the..](https://www.anthropic.com/news/claude-3-5-sonnet).
ALWAYS REMEMBER TO USE THE CITATIONS FORMAT CORRECTLY AT ALL COSTS!! ANY SINGLE ITCH IN THE FORMAT WILL CRASH THE RESPONSE!!
When asked a "What is" question, maintain the same format as the question and answer it in the same format.

## Latex in Respone rules:
- Latex equations are supported in the response!!
- The response that include latex equations, use always follow the formats: 
  - $<equation>$ for inline equations 
  - $$<equation>$$ for block equations 
  - \[ \] for math blocks. 
- Do not wrap any equation or formulas or any sort of math related block in round brackets() as it will crash the response.`,
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
          topic: z
            .enum(["general", "news"])
            .describe("The topic type to search for. Default is general."),
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
          topic,
          searchDepth,
          exclude_domains,
        }: {
          query: string;
          maxResults: number;
          topic: "general" | "news";
          searchDepth: "basic" | "advanced";
          exclude_domains?: string[];
        }) => {
          const apiKey = process.env.TAVILY_API_KEY;

          let body = JSON.stringify({
            api_key: apiKey,
            query,
            topic: topic,
            max_results: maxResults < 5 ? 5 : maxResults,
            search_depth: searchDepth,
            include_answers: true,
            exclude_domains: exclude_domains,
          });

          if (topic === "news") {
            body = JSON.stringify({
              api_key: apiKey,
              query,
              topic: topic,
              days: 7,
              max_results: maxResults < 5 ? 5 : maxResults,
              search_depth: searchDepth,
              include_answers: true,
              exclude_domains: exclude_domains,
            });
          }

          const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body,
          });

          const data = await response.json();

          let context = data.results.map(
            (obj: { url: any; content: any; title: any; raw_content: any, published_date: any }) => {
              if (topic === "news") {
                return {
                  url: obj.url,
                  title: obj.title,
                  content: obj.content,
                  raw_content: obj.raw_content,
                  published_date: obj.published_date,
                };
              }
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
        description: "Retrieve the information from a URL using Firecrawl.",
        parameters: z.object({
          url: z.string().describe("The URL to retrieve the information from."),
        }),
        execute: async ({ url }: { url: string }) => {
          const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
          try {
            const content = await app.scrapeUrl(url);
            if (!content.data) {
              return { error: "Failed to retrieve content" };
            }
            return {
              results: [
                {
                  title: content.data.metadata.title,
                  content: content.data.markdown,
                  url: content.data.metadata.sourceURL,
                  description: content.data.metadata.description,
                  language: content.data.metadata.language,
                },
              ],
            };
          } catch (error) {
            console.error("Firecrawl API error:", error);
            return { error: "Failed to retrieve content" };
          }
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
          let message = "";
          let images = [];

          if (execution.results.length > 0) {
            for (const result of execution.results) {
              if (result.isMainResult) {
                message += `${result.text}\n`;
              } else {
                message += `${result.text}\n`;
              }
              if (result.formats().length > 0) {
                const formats = result.formats();
                for (let format of formats) {
                  if (format === "png" || format === "jpeg" || format === "svg") {
                    const imageData = result[format];
                    if (imageData && typeof imageData === 'string') {
                      const abortController = new AbortController();
                      try {
                        const blobPromise = put(`mplx/image-${Date.now()}.${format}`, Buffer.from(imageData, 'base64'),
                        {
                          access: 'public',
                          abortSignal: abortController.signal,
                        });

                        const timeout = setTimeout(() => {
                          // Abort the request after 10 seconds
                          abortController.abort();
                        }, 2000);

                        const blob = await blobPromise;

                        clearTimeout(timeout);
                        console.info('Blob put request completed', blob.url);
                        
                        images.push({ format, url: blob.url });
                      } catch (error) {
                        if (error instanceof BlobRequestAbortedError) {
                          console.info('Canceled put request due to timeout');
                        } else {
                          console.error("Error saving image to Vercel Blob:", error);
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          if (execution.logs.stdout.length > 0 || execution.logs.stderr.length > 0) {
            if (execution.logs.stdout.length > 0) {
              message += `${execution.logs.stdout.join("\n")}\n`;
            }
            if (execution.logs.stderr.length > 0) {
              message += `${execution.logs.stderr.join("\n")}\n`;
            }
          }

          sandbox.close();
          return { message: message.trim(), images };
        },
      }),
      nearby_search: tool({
        description: "Search for nearby places using Google Maps API.",
        parameters: z.object({
          location: z.string().describe("The location to search near (e.g., 'New York City' or '1600 Amphitheatre Parkway, Mountain View, CA')."),
          type: z.string().describe("The type of place to search for (e.g., restaurant, cafe, park)."),
          keyword: z.string().optional().describe("An optional keyword to refine the search."),
          radius: z.number().default(3000).describe("The radius of the search area in meters (max 50000, default 3000)."),
        }),
        execute: async ({ location, type, keyword, radius }: { location: string; type: string; keyword?: string; radius: number }) => {
          const apiKey = process.env.GOOGLE_MAPS_API_KEY;

          // First, use the Geocoding API to get the coordinates
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
          const geocodeResponse = await fetch(geocodeUrl);
          const geocodeData = await geocodeResponse.json();

          if (geocodeData.status !== "OK" || !geocodeData.results[0]) {
            throw new Error("Failed to geocode the location");
          }

          const { lat, lng } = geocodeData.results[0].geometry.location;

          // perform the nearby search
          let searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;

          if (keyword) {
            searchUrl += `&keyword=${encodeURIComponent(keyword)}`;
          }

          const searchResponse = await fetch(searchUrl);
          const searchData = await searchResponse.json();

          return {
            results: searchData.results.slice(0, 5).map((place: any) => ({
              name: place.name,
              vicinity: place.vicinity,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              place_id: place.place_id,
              location: place.geometry.location,
            })),
            center: { lat, lng },
            formatted_address: geocodeData.results[0].formatted_address,
          };
        },
      }),
      find_place: tool({
        description: "Find a specific place using Google Maps API.",
        parameters: z.object({
          input: z.string().describe("The place to search for (e.g., 'Museum of Contemporary Art Australia')."),
          inputtype: z.enum(["textquery", "phonenumber"]).describe("The type of input (textquery or phonenumber)."),
        }),
        execute: async ({ input, inputtype }: { input: string; inputtype: "textquery" | "phonenumber" }) => {
          const apiKey = process.env.GOOGLE_MAPS_API_KEY;
          const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=formatted_address,name,rating,opening_hours,geometry&input=${encodeURIComponent(input)}&inputtype=${inputtype}&key=${apiKey}`;

          const response = await fetch(url);
          const data = await response.json();

          return data;
        },
      }),
      text_search: tool({
        description: "Perform a text-based search for places using Google Maps API.",
        parameters: z.object({
          query: z.string().describe("The search query (e.g., '123 main street')."),
          location: z.string().optional().describe("The location to center the search (e.g., '42.3675294,-71.186966')."),
          radius: z.number().optional().describe("The radius of the search area in meters (max 50000)."),
        }),
        execute: async ({ query, location, radius }: { query: string; location?: string; radius?: number }) => {
          const apiKey = process.env.GOOGLE_MAPS_API_KEY;
          let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

          if (location) {
            url += `&location=${encodeURIComponent(location)}`;
          }
          if (radius) {
            url += `&radius=${radius}`;
          }

          const response = await fetch(url);
          const data = await response.json();

          return data;
        },
      }),
      text_translate: tool({
        description: "Translate text from one language to another using Microsoft Translator.",
        parameters: z.object({
          text: z.string().describe("The text to translate."),
          to: z.string().describe("The language to translate to (e.g., 'fr' for French)."),
          from: z.string().optional().describe("The source language (optional, will be auto-detected if not provided)."),
        }),
        execute: async ({ text, to, from }: { text: string; to: string; from?: string }) => {
          const key = process.env.AZURE_TRANSLATOR_KEY;
          const endpoint = "https://api.cognitive.microsofttranslator.com";
          const location = process.env.AZURE_TRANSLATOR_LOCATION;
      
          const url = `${endpoint}/translate?api-version=3.0&to=${to}${from ? `&from=${from}` : ''}`;
      
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': key!,
              'Ocp-Apim-Subscription-Region': location!,
              'Content-type': 'application/json',
            },
            body: JSON.stringify([{ text }]),
          });
      
          const data = await response.json();
          return {
            translatedText: data[0].translations[0].text,
            detectedLanguage: data[0].detectedLanguage?.language,
          };
        },
      }),
    },
    toolChoice: "auto",
  });

  return result.toAIStreamResponse();
}
