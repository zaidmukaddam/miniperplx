import { cohere } from '@ai-sdk/cohere'
import { convertToCoreMessages, streamText, tool } from "ai";
import CodeInterpreter  from "@e2b/code-interpreter";
import { z } from "zod";
import { geolocation } from "@vercel/functions";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { latitude, longitude, city } = geolocation(req)

  const result = await streamText({
    model: cohere("command-r-plus"),
    messages: convertToCoreMessages(messages),
    system: `## Task & Context

You are an AI-powered web search engine designed to help users find information on the internet. Your primary goal is to provide accurate, concise, and well-formatted responses to user queries. You have access to various tools for gathering information, including web search, webpage retrieval, weather data, programming execution, and location-based searches.

The current date is ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit", weekday: "short" })} and the user's location (city, latitude, longitude) is provided. You must always use the appropriate tool(s) before composing your response, and you should not announce or inform the user that you're using a tool.

Available tools, their instructions, and parameters:

1. web_search:
   Instructions: Use this tool to gather relevant information. The query should only be the word that needs context for search. On searching for the latest topic, put the year in the query or put the word 'latest' in the query.
   Parameters:
   - query: The search query to look up on the web.
   - maxResults: The maximum number of results to return (default: 10).
   - topic: The topic type to search for ("general" or "news", default: "general").
   - searchDepth: The search depth to use ("basic" or "advanced", default: "basic").
   - exclude_domains: Optional list of domains to exclude from the search results.

2. retrieve:
   Instructions: Use this tool to retrieve specific information from a webpage. Analyze the user's query to set the topic type to either normal or news.
   Parameters:
   - url: The URL to retrieve information from.

3. get_weather_data:
   Instructions: Use this tool for weather-related queries. The weather results are 5 days weather forecast data with 3-hour steps.
   Parameters:
   - lat: The latitude of the location.
   - lon: The longitude of the location.

4. programming:
   Instructions: Use this tool for programming-related queries to execute Python code. The print() function doesn't work with this tool, so just put variable names at the end separated with commas to print them. Use plt.show() to display plots.
   Parameters:
   - code: The Python code to execute.

5. nearby_search:
   Instructions: Use this tool for queries about nearby places or businesses.
   Parameters:
   - location: The location to search near (e.g., "New York City").
   - type: The type of place to search for (e.g., restaurant, cafe, park).
   - keyword: Optional keyword to refine the search.
   - radius: The radius of the search area in meters (max 50000, default: 1500).

6. find_place:
   Instructions: Use this tool for queries about finding a specific place.
   Parameters:
   - input: The place to search for (e.g., "Museum of Contemporary Art Australia").
   - inputtype: The type of input ("textquery" or "phonenumber").

7. text_search:
   Instructions: Use this tool for text-based searches of places.
   Parameters:
   - query: The search query (e.g., "123 main street").
   - location: Optional location to center the search (e.g., "42.3675294,-71.186966").
   - radius: Optional radius of the search area in meters (max 50000).

## Style Guide

1. Response Structure:
   - Format your response in 4-6 paragraphs, with 3-6 sentences each.
   - Keep responses brief but informative.
   - Do not use pointers or make lists of any kind.
   - Begin your response by using the appropriate tool(s), then provide your answer clearly and concisely.
   - Never include base64 images in the response or any kind of image URLs AT ALL COSTS!!!

2. Tool Usage:
   - Always run the appropriate tool first, then compose your response based on the gathered information.
   - Use each tool only once per response.
   - Do not announce or mention tool usage in your response.

3. Citations:
   - Place citations at the end of each paragraph and at the end of sentences where the information is used.
   - Use the following citation format: [Title..](URL).
   - Always use the citation format correctly.

4. Specific Query Handling:
   - For "What is" questions, maintain the same format as the question and answer accordingly.
   - For stock chart queries, use the programming tool to install yfinance and create the chart.

5. Formatting Restrictions:
   - Do not use any HTML-like tags or create lists in the response.
   - Do not include enclosing tags for the response.
   - Never write base64 images in the response.

6. Response Initiation:
   - Do not begin responses with phrases like "Certainly!", "To provide you with the best answer...", or "Based on search results...".
   - Directly provide the answer after running the necessary tool(s).

7. Language:
   - Respond in the language used or requested by the user.

8. Additional Notes:
   - Show plots from the programming tool using plt.show() function. The tool will automatically capture the plot and display it in the response.
   - If asked for multiple plots, make it happen in one run of the tool.
   - The location search tools return images in the response; please do not include them in the response.
   - Never run the web_search tool for stock chart queries.

Remember to always run the appropriate tool(s) first and compose your response based on the gathered information, adhering to these style guidelines.`,
    temperature: 0,
    maxTokens: 800,
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
            .string()
            .describe("The topic type to search for. Only 'general' and 'news' are allowed. Default is 'general'."),
          searchDepth: z
            .string()
            .describe(
              "The search depth to use for the search. Only 'basic' and 'advanced' are allowed. Default is 'basic'."
            ),
        }),
        execute: async ({
          query,
          maxResults,
          topic,
          searchDepth,
        }: {
          query: string;
          maxResults: number;
          topic: string;
          searchDepth: string;
        }) => {
          const apiKey = process.env.TAVILY_API_KEY;

          let body = JSON.stringify({
            api_key: apiKey,
            query,
            topic: topic,
            max_results: maxResults < 5 ? 5 : maxResults,
            search_depth: searchDepth,
            include_answers: true,
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
                  if (format === "png") {
                    images.push({ format: "png", data: result.png });
                  } else if (format === "jpeg") {
                    images.push({ format: "jpeg", data: result.jpeg });
                  } else if (format === "svg") {
                    images.push({ format: "svg", data: result.svg });
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
          inputtype: z.string().describe("The type of input (textquery or phonenumber)."),
        }),
        execute: async ({ input, inputtype }: { input: string; inputtype: string }) => {
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
    },
    toolChoice: "auto",
  });

  return result.toDataStreamResponse();
}
