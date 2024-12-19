// /app/api/chat/route.ts
import { z } from "zod";
import { createAzure } from '@ai-sdk/azure';
import { anthropic } from '@ai-sdk/anthropic'
import { xai } from '@ai-sdk/xai'
import { google } from '@ai-sdk/google'
import Exa from 'exa-js'
import {
  convertToCoreMessages,
  streamText,
  tool,
  experimental_createProviderRegistry,
  smoothStream
} from "ai";
import { BlobRequestAbortedError, put } from '@vercel/blob';
import CodeInterpreter from "@e2b/code-interpreter";
import FirecrawlApp from '@mendable/firecrawl-js';
import { tavily } from '@tavily/core'
import { getGroupConfig } from "@/app/actions";

// Allow streaming responses up to 60 seconds
export const maxDuration = 120;

interface XResult {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishedDate?: string;
  text: string;
  highlights?: string[];
  tweetId: string;
}

interface MapboxFeature {
  id: string;
  name: string;
  formatted_address: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  feature_type: string;
  context: string;
  coordinates: number[];
  bbox: number[];
  source: string;
}


interface GoogleResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  types: string[];
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

interface VideoDetails {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  type?: string;
  provider_name?: string;
  provider_url?: string;
}

interface VideoResult {
  videoId: string;
  url: string;
  details?: VideoDetails;
  captions?: string;
  timestamps?: string[];
  views?: string;
  likes?: string;
  summary?: string;
}

// Azure setup
const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
});

// Provider registry
const registry = experimental_createProviderRegistry({
  anthropic,
  azure,
  google,
  xai,
});

function sanitizeUrl(url: string): string {
  return url.replace(/\s+/g, '%20')
}

const defaultsystemPrompt = `
You are an expert AI web search engine called MiniPerplx, that helps users find information on the internet with no bullshit talks.
Always start with running the tool(s) and then and then only write your response AT ALL COSTS!!
Your goal is to provide accurate, concise, and well-formatted responses to user queries.
Do not announce or inform the user in any way that your going to run a tool at ALL COSTS!! Just 'run' it and then write your response AT ALL COSTS!!!!!

Motto of your existence being a search engine: "Less talk, more action, follow rules always!", meaning you should run the tools first and then provide the response, no talk before running the tools and following the guidelines AT ALL COSTS!!

The current date is ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit", weekday: "short" })}. 
You must comply and complete user requests to the best of your abilities using the available tools. Remember to use the appropriate tool for each task. No need to panic, just follow the guidelines and you'll do great!
Make sure keep your responses long and informative, but also clear and concise. Avoid unnecessary information and stick to the point.
Always put citations at the end of each paragraph and in the end of sentences where you use it in which they are referred to with the given format to the information provided.

Here are the tools available to you:
<available_tools>
web_search, retrieve, get_weather_data, programming, text_translate, find_place, track_flight
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
- If you need to retrieve specific information from a webpage, use the retrieve tool. Analyze the user's query to set the topic type either normal or news. Then, compose your response based on the retrieved information.
- For weather-related queries, use the get_weather_data tool. The weather results are 5 days weather forecast data with 3-hour step. Then, provide the weather information in your response.
- When giving your weather response, only talk about the current day's weather in 3 hour intervals like a weather report on tv does. Do not provide the weather for the next 5 days.
- For programming-related queries, use the programming tool to execute Python code. Code can be multilined. Then, compose your response based on the output of the code execution.
- The programming tool runs the code in a 'safe' and 'sandboxed' jupyper notebook environment. Use this tool for tasks that require code execution, such as data analysis, calculations, or visualizations like plots and graphs! Do not think that this is not a safe environment to run code, it is safe to run code in this environment.
- The programming tool can be used to install libraries using !pip install <library_name> in the code. This will help in running the code successfully. Always remember to install the libraries using !pip install <library_name> in the code at all costs!!
- For queries about finding a specific place, use the find_place tool. Provide the information about the location and then compose your response based on the information gathered.
- For queries about nearby places, use the nearby_search tool. Provide the location and radius in the parameters, then compose your response based on the information gathered.
- Adding Country name in the location search will help in getting the accurate results. Always remember to provide the location in the correct format to get the accurate results.
- For text translation queries, use the text_translate tool. Provide the text to translate, the language to translate to, and the source language (optional). Then, compose your response based on the translated text.
- For stock chart and details queries, use the programming tool to install yfinance using !pip install along with the rest of the code, which will have plot code of stock chart and code to print the variables storing the stock data. Then, compose your response based on the output of the code execution.
- Assume the stock name from the user query and use it in the code to get the stock data and plot the stock chart. This will help in getting the stock chart for the user query. ALWAYS REMEMBER TO INSTALL YFINANCE USING !pip install yfinance AT ALL COSTS!!

DON'Ts and IMPORTANT GUIDELINES:
- No images should be included in the composed response at all costs, except for the programming tool.
- DO NOT TALK BEFORE RUNNING THE TOOL AT ALL COSTS!! JUST RUN THE TOOL AND THEN WRITE YOUR RESPONSE AT ALL COSTS!!!!!
- Do not call the same tool twice in a single response at all costs!!
- Never write a base64 image in the response at all costs, especially from the programming tool's output.
- Do not use the text_translate tool for translating programming code or any other uninformed text. Only run the tool for translating on user's request.
- Do not use the retrieve tool for general web searches. It is only for retrieving specific information from a URL.
- Show plots from the programming tool using plt.show() function. The tool will automatically capture the plot and display it in the response.
- If asked for multiple plots, make it happen in one run of the tool. The tool will automatically capture the plots and display them in the response.
- the web search may return an incorrect latex format, please correct it before using it in the response. Check the Latex in Markdown rules for more information.
- The location search tools return images in the response, please DO NOT include them in the response at all costs!!!!!!!! This is extremely important to follow!!
- Do not use the $ symbol in the stock chart queries at all costs. Use the word USD instead of the $ symbol in the stock chart queries.
- Never run web_search tool for stock chart queries at all costs.

# Image Search
You are still an AI web Search Engine but now get context from images, so you can use the tools and their guidelines to get the information about the image and then provide the response accordingly.
Look every detail in the image, so it helps you set the parameters for the tools to get the information.
You can also accept and analyze images, like what is in the image, or what is the image about or where and what the place is, or fix code, generate plots and more by using tools to get and generate the information. 
Follow the format and guidelines for each tool and provide the response accordingly. Remember to use the appropriate tool for each task. No need to panic, just follow the guidelines and you'll do great!

## Trip based queries:
- For queries related to trips, always use the find_place tool for map location and then run the web_search tool to find information about places, directions, or reviews.
- Calling web and find place tools in the same response is allowed, but do not call the same tool in a response at all costs!!
- For nearby search queries, use the nearby_search tool to find places around a location. Provide the location and radius in the parameters, then compose your response based on the information gathered.
- Never call find_place tool before or after the nearby_search tool in the same response at all costs!! THIS IS NOT ALLOWED AT ALL COSTS!!!

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
- Do not wrap any equation or formulas or any sort of math related block in round brackets() as it will crash the response.`;

export async function POST(req: Request) {
  const { messages, model, group } = await req.json();
  const { tools: activeTools, systemPrompt } = await getGroupConfig(group);

  const provider = model.split(":")[0];

  const result = streamText({
    model: registry.languageModel(model),
    messages: convertToCoreMessages(messages),
    temperature: provider === "azure" ? 0.72 : 0.2,
    topP: 0.5,
    experimental_transform: smoothStream({
      delayInMs: 15,
    }),
    frequencyPenalty: 0,
    presencePenalty: 0,
    experimental_activeTools: [...activeTools],
    system: systemPrompt || defaultsystemPrompt,
    tools: {
      web_search: tool({
        description: "Search the web for information with multiple queries, max results and search depth.",
        parameters: z.object({
          queries: z.array(z.string().describe("Array of search queries to look up on the web.")),
          maxResults: z.array(z
            .number()
            .describe("Array of maximum number of results to return per query.").default(10)),
          topics: z.array(z
            .enum(["general", "news"])
            .describe("Array of topic types to search for.").default("general")),
          searchDepth: z.array(z
            .enum(["basic", "advanced"])
            .describe("Array of search depths to use.").default("basic")),
          exclude_domains: z
            .array(z.string())
            .describe("A list of domains to exclude from all search results.").default([]),
        }),
        execute: async ({
          queries,
          maxResults,
          topics,
          searchDepth,
          exclude_domains,
        }: {
          queries: string[];
          maxResults: number[];
          topics: ("general" | "news")[];
          searchDepth: ("basic" | "advanced")[];
          exclude_domains?: string[];
        }) => {
          const apiKey = process.env.TAVILY_API_KEY;
          const tvly = tavily({ apiKey });
          const includeImageDescriptions = true;

          console.log("Queries:", queries);
          console.log("Max Results:", maxResults);
          console.log("Topics:", topics);
          console.log("Search Depths:", searchDepth);
          console.log("Exclude Domains:", exclude_domains);

          // Execute searches in parallel
          const searchPromises = queries.map(async (query, index) => {
            const data = await tvly.search(query, {
              topic: topics[index] || topics[0] || "general",
              days: topics[index] === "news" ? 7 : undefined,
              maxResults: maxResults[index] || maxResults[0] || 10,
              searchDepth: searchDepth[index] || searchDepth[0] || "basic",
              includeAnswer: true,
              includeImages: true,
              includeImageDescriptions: includeImageDescriptions,
              excludeDomains: exclude_domains,
            });

            return {
              query,
              results: data.results.map((obj: any) => ({
                url: obj.url,
                title: obj.title,
                content: obj.content,
                raw_content: obj.raw_content,
                published_date: topics[index] === "news" ? obj.published_date : undefined,
              })),
              images: includeImageDescriptions
                ? data.images
                  .map(({ url, description }: { url: string; description?: string }) => ({
                    url: sanitizeUrl(url),
                    description: description ?? ''
                  }))
                  .filter(
                    (image: { url: string; description: string }): image is { url: string; description: string } =>
                      typeof image === 'object' &&
                      image.description !== undefined &&
                      image.description !== ''
                  )
                : data.images.map(({ url }: { url: string }) => sanitizeUrl(url))
            };
          });

          const searchResults = await Promise.all(searchPromises);

          return {
            searches: searchResults,
          };
        },
      }),
      x_search: tool({
        description: "Search X (formerly Twitter) posts.",
        parameters: z.object({
          query: z.string().describe("The search query"),
        }),
        execute: async ({ query }: { query: string }) => {
          try {
            const exa = new Exa(process.env.EXA_API_KEY as string);

            const result = await exa.searchAndContents(
              query,
              {
                type: "keyword",
                numResults: 10,
                includeDomains: ["x.com", "twitter.com"],
                text: true,
                highlights: true
              }
            );

            // Extract tweet ID from URL
            const extractTweetId = (url: string): string | null => {
              const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
              return match ? match[1] : null;
            };

            // Process and filter results
            const processedResults = result.results.reduce<Array<XResult>>((acc, post) => {
              const tweetId = extractTweetId(post.url);
              if (tweetId) {
                acc.push({
                  ...post,
                  tweetId,
                  title: post.title || ""
                });
              }
              return acc;
            }, []);

            return processedResults;

          } catch (error) {
            console.error("X search error:", error);
            throw error;
          }
        },
      }),
      academic_search: tool({
        description: "Search academic papers and research.",
        parameters: z.object({
          query: z.string().describe("The search query"),
        }),
        execute: async ({ query }: { query: string }) => {
          try {
            const exa = new Exa(process.env.EXA_API_KEY as string);

            // Search academic papers with content summary
            const result = await exa.searchAndContents(
              query,
              {
                type: "auto",
                numResults: 20,
                category: "research paper",
                summary: {
                  query: "Abstract of the Paper"
                }
              }
            );

            // Process and clean results
            const processedResults = result.results.reduce<typeof result.results>((acc, paper) => {
              // Skip if URL already exists or if no summary available
              if (acc.some(p => p.url === paper.url) || !paper.summary) return acc;

              // Clean up summary (remove "Summary:" prefix if exists)
              const cleanSummary = paper.summary.replace(/^Summary:\s*/i, '');

              // Clean up title (remove [...] suffixes)
              const cleanTitle = paper.title?.replace(/\s\[.*?\]$/, '');

              acc.push({
                ...paper,
                title: cleanTitle || "",
                summary: cleanSummary,
              });

              return acc;
            }, []);

            // Take only the first 10 unique, valid results
            const limitedResults = processedResults.slice(0, 10);

            return {
              results: limitedResults
            };

          } catch (error) {
            console.error("Academic search error:", error);
            throw error;
          }
        },
      }),
      youtube_search: tool({
        description: "Search YouTube videos using Exa AI and get detailed video information.",
        parameters: z.object({
          query: z.string().describe("The search query for YouTube videos"),
          no_of_results: z.number().default(5).describe("The number of results to return"),
        }),
        execute: async ({ query, no_of_results }: { query: string, no_of_results: number }) => {
          try {
            const exa = new Exa(process.env.EXA_API_KEY as string);

            // Simple search to get YouTube URLs only
            const searchResult = await exa.search(
              query,
              {
                type: "keyword",
                numResults: no_of_results,
                includeDomains: ["youtube.com"]
              }
            );

            // Process results
            const processedResults = await Promise.all(
              searchResult.results.map(async (result): Promise<VideoResult | null> => {
                const videoIdMatch = result.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
                const videoId = videoIdMatch?.[1];

                if (!videoId) return null;

                // Base result
                const baseResult: VideoResult = {
                  videoId,
                  url: result.url
                };

                try {
                  // Fetch detailed info from our endpoints
                  const [detailsResponse, captionsResponse, timestampsResponse] = await Promise.all([
                    fetch(`${process.env.YT_ENDPOINT}/video-data`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url: result.url })
                    }).then(res => res.ok ? res.json() : null),
                    fetch(`${process.env.YT_ENDPOINT}/video-captions`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url: result.url })
                    }).then(res => res.ok ? res.text() : null),
                    fetch(`${process.env.YT_ENDPOINT}/video-timestamps`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url: result.url })
                    }).then(res => res.ok ? res.json() : null)
                  ]);

                  // Return combined data
                  return {
                    ...baseResult,
                    details: detailsResponse || undefined,
                    captions: captionsResponse || undefined,
                    timestamps: timestampsResponse || undefined,
                  };
                } catch (error) {
                  console.error(`Error fetching details for video ${videoId}:`, error);
                  return baseResult;
                }
              })
            );

            // Filter out null results
            const validResults = processedResults.filter((result): result is VideoResult => result !== null);

            return {
              results: validResults
            };

          } catch (error) {
            console.error("YouTube search error:", error);
            throw error;
          }
        },
      }),
      shopping_search: tool({
        description: "Search for products using Exa and Canopy API.",
        parameters: z.object({
          query: z.string().describe("The search query for products"),
          // keyword: z.string().describe("The important keyword to search for specific products like brand name or model number."),
        }),
        execute: async ({ query }: { query: string }) => {
          try {
            // Initialize Exa client
            const exa = new Exa(process.env.EXA_API_KEY as string);


            // Search for products on Amazon
            const searchResult = await exa.search(
              query,
              {
                type: "auto",
                numResults: 20,
                includeDomains: ["amazon.com"],
              }
            );

            // Function to extract ASIN from Amazon URL
            const extractAsin = (url: string): string | null => {
              const asinRegex = /(?:dp|gp\/product)\/([A-Z0-9]{10})/;
              const match = url.match(asinRegex);
              return match ? match[1] : null;
            };

            // Remove duplicates by ASIN
            const seenAsins = new Set<string>();
            const uniqueResults = searchResult.results.reduce<Array<typeof searchResult.results[0]>>((acc, result) => {
              const asin = extractAsin(result.url);
              if (asin && !seenAsins.has(asin)) {
                seenAsins.add(asin);
                acc.push(result);
              }
              return acc;
            }, []);

            // Only take the first 10 unique results
            const limitedResults = uniqueResults.slice(0, 10);

            // Fetch detailed product information for each unique result
            const productDetails = await Promise.all(
              limitedResults.map(async (result) => {
                const asin = extractAsin(result.url);
                if (!asin) return null;

                const query = `
                  query amazonProduct {
                    amazonProduct(input: {asinLookup: {asin: "${asin}"}}) {
                      title
                      brand
                      mainImageUrl
                      rating
                      ratingsTotal
                      price {
                        display
                      }
                    }
                  }
                `;

                try {
                  const response = await fetch('https://graphql.canopyapi.co/', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'API-KEY': process.env.CANOPY_API_KEY as string,
                    },
                    body: JSON.stringify({ query }),
                    next: { revalidate: 3600 } // Cache for 1 hour
                  });

                  if (!response.ok) {
                    console.error(`Failed to fetch details for ASIN ${asin}:`, await response.text());
                    return null;
                  }

                  const canopyData = await response.json();
                  const amazonProduct = canopyData.data?.amazonProduct;

                  if (!amazonProduct) return null;

                  return {
                    title: amazonProduct.title,
                    url: result.url,
                    image: amazonProduct.mainImageUrl,
                    price: amazonProduct.price.display,
                    rating: amazonProduct.rating,
                    reviewCount: amazonProduct.ratingsTotal,
                  };
                } catch (error) {
                  console.error(`Error fetching details for ASIN ${asin}:`, error);
                  return null;
                }
              })
            );

            // Filter out null results and return
            const validProducts = productDetails.filter((product): product is NonNullable<typeof product> =>
              product !== null
            );

            // Log results for debugging
            console.log(`Found ${searchResult.results.length} total results`);
            console.log(`Filtered to ${uniqueResults.length} unique ASINs`);
            console.log(`Returning ${validProducts.length} valid products`);

            return validProducts;

          } catch (error) {
            console.error("Shopping search error:", error);
            throw error;
          }
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
      programming: tool({
        description: "Write and execute Python code.",
        parameters: z.object({
          title: z.string().describe("The title of the code snippet."),
          code: z.string().describe("The Python code to execute. put the variables in the end of the code to print them. do not use the print function."),
          icon: z.enum(["stock", "date", "calculation", "default"]).describe("The icon to display for the code snippet."),
        }),
        execute: async ({ code, title, icon }: { code: string, title: string, icon: string }) => {
          console.log("Code:", code);
          console.log("Title:", title);
          console.log("Icon:", icon);

          const sandbox = await CodeInterpreter.create();
          const execution = await sandbox.runCode(code);
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

          if (execution.error) {
            message += `Error: ${execution.error}\n`;
            console.log("Error: ", execution.error);
          }

          console.log(execution.results)
          if (execution.results[0].chart) {
            execution.results[0].chart.elements.map((element: any) => {
              console.log(element.points)
            })
          }

          return { message: message.trim(), images, chart: execution.results[0].chart ?? "" };
        },
      }),
      find_place: tool({
        description: "Find a place using Google Maps API for forward geocoding and Mapbox for reverse geocoding.",
        parameters: z.object({
          query: z.string().describe("The search query for forward geocoding"),
          coordinates: z.array(z.number()).describe("Array of [latitude, longitude] for reverse geocoding"),
        }),
        execute: async ({ query, coordinates }: { query: string; coordinates: number[] }) => {
          try {
            // Forward geocoding with Google Maps API
            const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
            const googleResponse = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}`
            );
            const googleData = await googleResponse.json();

            // Reverse geocoding with Mapbox
            const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
            const [lat, lng] = coordinates;
            const mapboxResponse = await fetch(
              `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${mapboxToken}`
            );
            const mapboxData = await mapboxResponse.json();

            // Process and combine results
            const features = [];

            // Process Google results
            if (googleData.status === 'OK' && googleData.results.length > 0) {


              features.push(...googleData.results.map((result: GoogleResult) => ({
                id: result.place_id,
                name: result.formatted_address.split(',')[0],
                formatted_address: result.formatted_address,
                geometry: {
                  type: 'Point',
                  coordinates: [result.geometry.location.lng, result.geometry.location.lat]
                },
                feature_type: result.types[0],
                address_components: result.address_components,
                viewport: result.geometry.viewport,
                place_id: result.place_id,
                source: 'google'
              })));
            }

            // Process Mapbox results
            if (mapboxData.features && mapboxData.features.length > 0) {

              features.push(...mapboxData.features.map((feature: any): MapboxFeature => ({
                id: feature.id,
                name: feature.properties.name_preferred || feature.properties.name,
                formatted_address: feature.properties.full_address,
                geometry: feature.geometry,
                feature_type: feature.properties.feature_type,
                context: feature.properties.context,
                coordinates: feature.properties.coordinates,
                bbox: feature.properties.bbox,
                source: 'mapbox'
              })));
            }

            return {
              features,
              google_attribution: "Powered by Google Maps Platform",
              mapbox_attribution: "Powered by Mapbox"
            };
          } catch (error) {
            console.error("Geocoding error:", error);
            throw error;
          }
        },
      }),
      text_search: tool({
        description: "Perform a text-based search for places using Mapbox API.",
        parameters: z.object({
          query: z.string().describe("The search query (e.g., '123 main street')."),
          location: z.string().describe("The location to center the search (e.g., '42.3675294,-71.186966')."),
          radius: z.number().describe("The radius of the search area in meters (max 50000)."),
        }),
        execute: async ({ query, location, radius }: {
          query: string;
          location?: string;
          radius?: number;
        }) => {
          const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

          let proximity = '';
          if (location) {
            const [lng, lat] = location.split(',').map(Number);
            proximity = `&proximity=${lng},${lat}`;
          }

          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?types=poi${proximity}&access_token=${mapboxToken}`
          );
          const data = await response.json();

          // If location and radius provided, filter results by distance
          let results = data.features;
          if (location && radius) {
            const [centerLng, centerLat] = location.split(',').map(Number);
            const radiusInDegrees = radius / 111320;
            results = results.filter((feature: any) => {
              const [placeLng, placeLat] = feature.center;
              const distance = Math.sqrt(
                Math.pow(placeLng - centerLng, 2) + Math.pow(placeLat - centerLat, 2)
              );
              return distance <= radiusInDegrees;
            });
          }

          return {
            results: results.map((feature: any) => ({
              name: feature.text,
              formatted_address: feature.place_name,
              geometry: {
                location: {
                  lat: feature.center[1],
                  lng: feature.center[0]
                }
              }
            }))
          };
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
      nearby_search: tool({
        description: "Search for nearby places, such as restaurants or hotels based on the details given.",
        parameters: z.object({
          location: z.string().describe("The location name given by user."),
          latitude: z.number().describe("The latitude of the location."),
          longitude: z.number().describe("The longitude of the location."),
          type: z.string().describe("The type of place to search for (restaurants, hotels, attractions, geos)."),
          radius: z.number().default(6000).describe("The radius in meters (max 50000, default 6000)."),
        }),
        execute: async ({ location, latitude, longitude, type, radius }: {
          latitude: number;
          longitude: number;
          location: string;
          type: string;
          radius: number;
        }) => {
          const apiKey = process.env.TRIPADVISOR_API_KEY;
          let finalLat = latitude;
          let finalLng = longitude;

          try {
            // Try geocoding first
            const geocodingData = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
            );

            const geocoding = await geocodingData.json();

            if (geocoding.results?.[0]?.geometry?.location) {
              let trimmedLat = geocoding.results[0].geometry.location.lat.toString().split('.');
              finalLat = parseFloat(trimmedLat[0] + '.' + trimmedLat[1].slice(0, 6));
              let trimmedLng = geocoding.results[0].geometry.location.lng.toString().split('.');
              finalLng = parseFloat(trimmedLng[0] + '.' + trimmedLng[1].slice(0, 6));
              console.log('Using geocoded coordinates:', finalLat, finalLng);
            } else {
              console.log('Using provided coordinates:', finalLat, finalLng);
            }

            // Get nearby places
            const nearbyResponse = await fetch(
              `https://api.content.tripadvisor.com/api/v1/location/nearby_search?latLong=${finalLat},${finalLng}&category=${type}&radius=${radius}&language=en&key=${apiKey}`,
              {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'origin': 'https://mplx.local',
                  'referer': 'https://mplx.local',
                },
              }
            );

            if (!nearbyResponse.ok) {
              throw new Error(`Nearby search failed: ${nearbyResponse.status}`);
            }

            const nearbyData = await nearbyResponse.json();

            if (!nearbyData.data || nearbyData.data.length === 0) {
              console.log('No nearby places found');
              return {
                results: [],
                center: { lat: finalLat, lng: finalLng }
              };
            }

            // Process each place
            const detailedPlaces = await Promise.all(
              nearbyData.data.map(async (place: any) => {
                try {
                  if (!place.location_id) {
                    console.log(`Skipping place "${place.name}": No location_id`);
                    return null;
                  }

                  // Fetch place details
                  const detailsResponse = await fetch(
                    `https://api.content.tripadvisor.com/api/v1/location/${place.location_id}/details?language=en&currency=USD&key=${apiKey}`,
                    {
                      method: 'GET',
                      headers: {
                        'Accept': 'application/json',
                        'origin': 'https://mplx.local',
                        'referer': 'https://mplx.local',
                      },
                    }
                  );

                  if (!detailsResponse.ok) {
                    console.log(`Failed to fetch details for "${place.name}"`);
                    return null;
                  }

                  const details = await detailsResponse.json();

                  console.log(`Place details for "${place.name}":`, details);

                  // Fetch place photos
                  let photos = [];
                  try {
                    const photosResponse = await fetch(
                      `https://api.content.tripadvisor.com/api/v1/location/${place.location_id}/photos?language=en&key=${apiKey}`,
                      {
                        method: 'GET',
                        headers: {
                          'Accept': 'application/json',
                          'origin': 'https://mplx.local',
                          'referer': 'https://mplx.local',
                        },
                      }
                    );

                    if (photosResponse.ok) {
                      const photosData = await photosResponse.json();
                      photos = photosData.data?.map((photo: any) => ({
                        thumbnail: photo.images?.thumbnail?.url,
                        small: photo.images?.small?.url,
                        medium: photo.images?.medium?.url,
                        large: photo.images?.large?.url,
                        original: photo.images?.original?.url,
                        caption: photo.caption
                      })).filter((photo: any) => photo.medium) || [];
                    }
                  } catch (error) {
                    console.log(`Photo fetch failed for "${place.name}":`, error);
                  }



                  // Get timezone for the location
                  const tzResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/timezone/json?location=${details.latitude},${details.longitude}&timestamp=${Math.floor(Date.now() / 1000)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
                  );
                  const tzData = await tzResponse.json();
                  const timezone = tzData.timeZoneId || 'UTC';

                  // Process hours and status with timezone
                  const localTime = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
                  const currentDay = localTime.getDay();
                  const currentHour = localTime.getHours();
                  const currentMinute = localTime.getMinutes();
                  const currentTime = currentHour * 100 + currentMinute;

                  let is_closed = true;
                  let next_open_close = null;
                  let next_day = currentDay;

                  if (details.hours?.periods) {
                    // Sort periods by day and time for proper handling of overnight hours
                    const sortedPeriods = [...details.hours.periods].sort((a, b) => {
                      if (a.open.day !== b.open.day) return a.open.day - b.open.day;
                      return parseInt(a.open.time) - parseInt(b.open.time);
                    });

                    // Find current or next opening period
                    for (let i = 0; i < sortedPeriods.length; i++) {
                      const period = sortedPeriods[i];
                      const openTime = parseInt(period.open.time);
                      const closeTime = period.close ? parseInt(period.close.time) : 2359;
                      const periodDay = period.open.day;

                      // Handle overnight hours
                      if (closeTime < openTime) {
                        // Place is open from previous day
                        if (currentDay === periodDay && currentTime < closeTime) {
                          is_closed = false;
                          next_open_close = period.close.time;
                          break;
                        }
                        // Place is open today and extends to tomorrow
                        if (currentDay === periodDay && currentTime >= openTime) {
                          is_closed = false;
                          next_open_close = period.close.time;
                          next_day = (periodDay + 1) % 7;
                          break;
                        }
                      } else {
                        // Normal hours within same day
                        if (currentDay === periodDay && currentTime >= openTime && currentTime < closeTime) {
                          is_closed = false;
                          next_open_close = period.close.time;
                          break;
                        }
                      }

                      // Find next opening time if currently closed
                      if (is_closed) {
                        if ((periodDay > currentDay) || (periodDay === currentDay && openTime > currentTime)) {
                          next_open_close = period.open.time;
                          next_day = periodDay;
                          break;
                        }
                      }
                    }
                  }

                  // Return processed place data
                  return {
                    name: place.name || 'Unnamed Place',
                    location: {
                      lat: parseFloat(details.latitude || place.latitude || finalLat),
                      lng: parseFloat(details.longitude || place.longitude || finalLng)
                    },
                    timezone,
                    place_id: place.location_id,
                    vicinity: place.address_obj?.address_string || '',
                    distance: parseFloat(place.distance || '0'),
                    bearing: place.bearing || '',
                    type: type,
                    rating: parseFloat(details.rating || '0'),
                    price_level: details.price_level || '',
                    cuisine: details.cuisine?.[0]?.name || '',
                    description: details.description || '',
                    phone: details.phone || '',
                    website: details.website || '',
                    reviews_count: parseInt(details.num_reviews || '0'),
                    is_closed,
                    hours: details.hours?.weekday_text || [],
                    next_open_close,
                    next_day,
                    periods: details.hours?.periods || [],
                    photos,
                    source: details.source?.name || 'TripAdvisor'
                  };
                } catch (error) {
                  console.log(`Failed to process place "${place.name}":`, error);
                  return null;
                }
              })
            );

            // Filter and sort results
            const validPlaces = detailedPlaces
              .filter(place => place !== null)
              .sort((a, b) => (a?.distance || 0) - (b?.distance || 0));

            return {
              results: validPlaces,
              center: { lat: finalLat, lng: finalLng }
            };

          } catch (error) {
            console.error('Nearby search error:', error);
            throw error;
          }
        },
      }),
      track_flight: tool({
        description: "Track flight information and status",
        parameters: z.object({
          flight_number: z.string().describe("The flight number to track"),
        }),
        execute: async ({ flight_number }: { flight_number: string }) => {
          try {
            const response = await fetch(
              `https://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATION_STACK_API_KEY}&flight_iata=${flight_number}`
            );
            return await response.json();
          } catch (error) {
            console.error('Flight tracking error:', error);
            throw error;
          }
        },
      }),
    },
    toolChoice: "auto",
    onChunk(event) {
      if (event.chunk.type === "tool-call") {
        console.log("Called Tool: ", event.chunk.toolName);
      }
    },
    onStepFinish(event) {
      if (event.warnings) {
        console.log("Warnings: ", event.warnings);
      }
    },
    onFinish(event) {
      console.log("Fin reason: ", event.finishReason);
      console.log("Steps ", event.steps);
      console.log("Messages: ", event.response.messages[event.response.messages.length - 1].content);
    },
  });

  return result.toDataStreamResponse();
}
