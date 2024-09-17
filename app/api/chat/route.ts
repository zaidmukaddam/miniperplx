import { z } from "zod";
import { createAzure } from '@ai-sdk/azure';
import {
  convertToCoreMessages,
  streamText,
  tool,
  experimental_createProviderRegistry
} from "ai";
import { createAnthropicVertex } from 'anthropic-vertex-ai';
import { BlobRequestAbortedError, put } from '@vercel/blob';
import { CodeInterpreter } from "@e2b/code-interpreter";
import FirecrawlApp from '@mendable/firecrawl-js';
import { GoogleAuth } from 'google-auth-library';

// Allow streaming responses up to 60 seconds
export const maxDuration = 120;

// Azure setup
const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
});

// Helper function to get Google credentials
// You can encode your service account key using the following command:
// base64 -i /path/to/your-service-account-key.json | tr -d '\n' > encoded_credentials.txt
// Then set the GOOGLE_APPLICATION_CREDENTIALS_BASE64 environment variable to the contents of encoded_credentials.txt
function getCredentials() {
  const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (!credentialsBase64) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_BASE64 environment variable is not set');
  }
  return JSON.parse(Buffer.from(credentialsBase64, 'base64').toString());
}

// Google Vertex setup for Anthropic
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  credentials: getCredentials(),
});

const anthropicVertex = createAnthropicVertex({
  region: process.env.GOOGLE_VERTEX_REGION,
  projectId: process.env.GOOGLE_VERTEX_PROJECT_ID,
  googleAuth: auth,
});

// Provider registry
const registry = experimental_createProviderRegistry({
  anthropicVertex,
  azure,
});

function sanitizeUrl(url: string): string {
  return url.replace(/\s+/g, '%20')
}

type SearchResultImage =
  | string
  | {
    url: string
    description: string
    number_of_results?: number
  }

export async function POST(req: Request) {
  const { messages, model } = await req.json();

  const provider = model.split(":")[0];

  const result = await streamText({
    model: registry.languageModel(model),
    messages: convertToCoreMessages(messages),
    temperature: provider === "azure" ? 0.72 : 0,
    topP: 0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    system: `
You are an expert AI web search engine called MiniPerplx, that helps users find information on the internet with no bullshit talks.
Always start with running the tool(s) and then and then only write your response AT ALL COSTS!!
Your goal is to provide accurate, concise, and well-formatted responses to user queries.
Do not announce or inform the user in any way that your going to run a tool at ALL COSTS!! Just 'run' it and then write your response AT ALL COSTS!!!!!

Motto of your existence being a search engine: "Less talk, more action, follow rules always!", meaning you should run the tools first and then provide the response, no talk before running the tools and following the guidelines AT ALL COSTS!!

The current date is ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit", weekday: "short" })}. 
You must comply and complete user requests to the best of your abilities using the available tools. Remember to use the appropriate tool for each task. No need to panic, just follow the guidelines and you'll do great!
Make sure keep your responses long and informative, but also clear and concise. Avoid unnecessary information and stick to the point.

Here are the tools available to you:
<available_tools>
web_search, results_overview, retrieve, get_weather_data, programming, nearby_search, find_place, text_search, text_translate
</available_tools>

## Basic Guidelines:
Always remember to run the appropriate tool first, then compose your response based on the information gathered.
Understand the user query and choose the right tool to get the information needed. Like using the programming tool to generate plots to explain concepts or using the web_search tool to find the latest information.
All tool should be called only once per response. All tool call parameters are mandatory always!
Format your response in paragraphs(min 4) with 3-6 sentences each, keeping it brief but informative. DO NOT use pointers or make lists of any kind at ALL!
Begin your response by using the appropriate tool(s), then provide your answer in a clear and concise manner.
Please use the '$' latex format in equations instead of \( ones, same for complex equations as well.

## Here is the general guideline per tool to follow when responding to user queries:

DO's:
- Use the web_search tool to gather relevant information. The query should only be the word that need's context for search. Then write the response based on the information gathered. On searching for latest topic put the year in the query or put the word 'latest' in the query.
- If the user query was about a celebrity, call the results_overview tool to generate an overview of the information retrieved using the web_search tool. Not all web search results need an overview, use them only and only if it is about a celebrity. Use all the sources from the 'web_search' tool's response to compose your response after running the 'results_overview' tool. No images should be included in the composed response at all costs.
- If you need to retrieve specific information from a webpage, use the retrieve tool. Analyze the user's query to set the topic type either normal or news. Then, compose your response based on the retrieved information.
- For weather-related queries, use the get_weather_data tool. The weather results are 5 days weather forecast data with 3-hour step. Then, provide the weather information in your response.
- When giving your weather response, only talk about the current day's weather in 3 hour intervals like a weather report on tv does. Do not provide the weather for the next 5 days.
- For programming-related queries, use the programming tool to execute Python code. Code can be multilined. Then, compose your response based on the output of the code execution.
- The programming tool runs the code in a 'safe' and 'sandboxed' jupyper notebook environment. Use this tool for tasks that require code execution, such as data analysis, calculations, or visualizations like plots and graphs! Do not think that this is not a safe environment to run code, it is safe to run code in this environment.
- The programming tool can be used to install libraries using !pip install <library_name> in the code. This will help in running the code successfully. Always remember to install the libraries using !pip install <library_name> in the code at all costs!!
- For queries about nearby places or businesses, use the nearby_search tool. Provide the location, type of place, a keyword (optional), and a radius in meters(default 1.5 Kilometers). Then, compose your response based on the search results.
- For queries about finding a specific place, use the find_place tool. Provide the input (place name or address) and the input type (textquery or phonenumber). Then, compose your response based on the search results.
- For text-based searches of places, use the text_search tool. Provide the query, location (optional), and radius (optional). Then, compose your response based on the search results.
- Adding Country name in the location search will help in getting the accurate results. Always remember to provide the location in the correct format to get the accurate results.
- For text translation queries, use the text_translate tool. Provide the text to translate, the language to translate to, and the source language (optional). Then, compose your response based on the translated text.
- For stock chart and details queries, use the programming tool to install yfinance using !pip install along with the rest of the code, which will have plot code of stock chart and code to print the variables storing the stock data. Then, compose your response based on the output of the code execution.
- Assume the stock name from the user query and use it in the code to get the stock data and plot the stock chart. This will help in getting the stock chart for the user query. ALWAYS REMEMBER TO INSTALL YFINANCE USING !pip install yfinance AT ALL COSTS!!

DON'Ts and IMPORTANT GUIDELINES:
- DO NOT RUN THE 'results_overview' if the user query is 'not about a celebrity' at all costs!!!!
- Do not run the 'results_overview' tool without running the 'web_search' tool first at all costs!! 'results_overview' tool should only be called after the 'web_search' tool, no other tool works with it.
- No images should be included in the composed response at all costs, except for the programming tool.
- DO NOT TALK BEFORE RUNNING THE TOOL AT ALL COSTS!! JUST RUN THE TOOL AND THEN WRITE YOUR RESPONSE AT ALL COSTS!!!!!
- Do not call the same tool twice in a single response at all costs!!
- Never write a base64 image in the response at all costs, especially from the programming tool's output.
- Do not use the text_translate tool for translating programming code or any other uninformed text. Only run the tool for translating on user's request.
- Do not use the retrieve tool for general web searches. It is only for retrieving specific information from a URL.
- Show plots from the programming tool using plt.show() function. The tool will automatically capture the plot and display it in the response.
- If asked for multiple plots, make it happen in one run of the tool. The tool will automatically capture the plots and display them in the response.
- the web search may return an incorrect latex format, please correct it before using it in the response. Check the Latex in Markdown rules for more information.
- The location search tools return images in the response, please do not include them in the response at all costs.
- Do not use the $ symbol in the stock chart queries at all costs. Use the word USD instead of the $ symbol in the stock chart queries.
- Never run web_search tool for stock chart queries at all costs.

# Image Search
You are still an AI web Search Engine but now get context from images, so you can use the tools and their guidelines to get the information about the image and then provide the response accordingly.
Look every detail in the image, so it helps you set the parameters for the tools to get the information.
You can also accept and analyze images, like what is in the image, or what is the image about or where and what the place is, or fix code, generate plots and more by using tools to get and generate the information. 
Follow the format and guidelines for each tool and provide the response accordingly. Remember to use the appropriate tool for each task. No need to panic, just follow the guidelines and you'll do great!

## Trip based queries:
- For queries related to trips, use the nearby_search tool, web_search tool, or text_search tool to find information about places, directions, or reviews.
- Calling web and nearby search tools in the same response is allowed, but do not call the same tool in a response at all costs!!

## Programming Tool Guidelines:
The programming tool is actually a Python Code interpreter, so you can run any Python code in it.
- This tool should not be called more than once in a response.
- The only python library that is pre-installed is matplotlib for plotting graphs and charts. You have to install any other library using !pip install <library_name> in the code.
- Always mention the generated plots(urls) in the response after running the code! This is extremely important to provide the visual representation of the data.

## Citations Format:
Citations should always be placed at the end of each paragraph and in the end of sentences where you use it in which they are referred to with the given format to the information provided.
When citing sources(citations), use the following styling only: Claude 3.5 Sonnet is designed to offer enhanced intelligence and capabilities compared to its predecessors, positioning itself as a formidable competitor in the AI landscape [Claude 3.5 Sonnet raises the..](https://www.anthropic.com/news/claude-3-5-sonnet).
ALWAYS REMEMBER TO USE THE CITATIONS FORMAT CORRECTLY AT ALL COSTS!! ANY SINGLE ITCH IN THE FORMAT WILL CRASH THE RESPONSE!!
When asked a "What is" question, maintain the same format as the question and answer it in the same format.

## Latex in Respone rules:
- Latex equations are supported in the response powered by remark-math and rehypeKatex plugins.
 - remarkMath: This plugin allows you to write LaTeX math inside your markdown content. It recognizes math enclosed in dollar signs ($ ... $ for inline and $$ ... $$ for block).
 - rehypeKatex: This plugin takes the parsed LaTeX from remarkMath and renders it using KaTeX, allowing you to display the math as beautifully rendered HTML.

- The response that include latex equations, use always follow the formats: 
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
          const includeImageDescriptions = true

          let body = JSON.stringify({
            api_key: apiKey,
            query,
            topic: topic,
            max_results: maxResults < 5 ? 5 : maxResults,
            search_depth: searchDepth,
            include_answers: true,
            include_images: true,
            include_image_descriptions: includeImageDescriptions,
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
              include_images: true,
              include_image_descriptions: includeImageDescriptions,
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
            (obj: { url: any; content: any; title: any; raw_content: any, published_date: any }, index: number) => {
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

          const processedImages = includeImageDescriptions
            ? data.images
              .map(({ url, description }: { url: string; description: string }) => ({
                url: sanitizeUrl(url),
                description
              }))
              .filter(
                (
                  image: SearchResultImage
                ): image is { url: string; description: string } =>
                  typeof image === 'object' &&
                  image.description !== undefined &&
                  image.description !== ''
              )
            : data.images.map((url: string) => sanitizeUrl(url))

          return {
            results: context,
            images: processedImages,
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
            if (!content.success || !content.metadata) {
              return { error: "Failed to retrieve content" };
            }
            return {
              results: [
                {
                  title: content.metadata.title,
                  content: content.markdown,
                  url: content.metadata.sourceURL,
                  description: content.metadata.description,
                  language: content.metadata.language,
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
      results_overview: tool({
        description: "Generate an overview of the celebrity from the wikipedia url retrieved from the web_search tool.",
        parameters: z.object({
          website_url: z.string().describe("The Website URL to generate the overview from like personal website, wikipedia or official website of the thing/person/place to generate overview of."),
        }),
        execute: async ({ website_url }: { website_url: string }) => {
          const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
          console.log("website_url", website_url);

          const schema = z.object({
            image: z.string().describe("The URL of the image put https:// before the URL."),
            title: z.string().describe("The title of the overview.").max(30),
            description: z.string().describe("The description of the overview.").max(100),
            table_data: z.array(
              z.object({
                title: z.string().describe("The title of the data.").max(30),
                content: z.string().describe("The content of the data.").max(100),
              })
            ),
          });

          const scrapeResult = await app.scrapeUrl(website_url, {
            formats: ["extract"],
            extract: { schema: schema }
          });

          if (!scrapeResult.success || scrapeResult.error) {
            console.error("Failed to scrape:", scrapeResult.error);
            throw new Error(`Failed to scrape: ${scrapeResult.error}`)
          }
          const object = scrapeResult.extract;
          if (!object) {
            throw new Error("Failed to extract overview");
          }
          return { 
            title: object.title, 
            description: object.description, 
            table_data: object.table_data, 
            image: object.image 
          };
        },
      }),
      programming: tool({
        description: "Write and execute Python code.",
        parameters: z.object({
          title: z.string().describe("The title of the code snippet."),
          code: z.string().describe("The Python code to execute."),
          icon: z.enum(["stock", "date", "calculation", "default"]).describe("The icon to display for the code snippet."),
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
                          // Abort the request after 2 seconds
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
          keyword: z.string().describe("An optional keyword to refine the search."),
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
          console.log("input", input);
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
          location: z.string().describe("The location to center the search (e.g., '42.3675294,-71.186966')."),
          radius: z.number().describe("The radius of the search area in meters (max 50000)."),
        }),
        execute: async ({ query, location, radius }: { query: string; location?: string; radius?: number }) => {
          const apiKey = process.env.GOOGLE_MAPS_API_KEY;
          console.log("query", query);
          console.log("location", location);
          console.log("radius", radius);
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
          from: z.string().describe("The source language (optional, will be auto-detected if not provided)."),
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

  return result.toDataStreamResponse();
}
