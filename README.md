# MiniPerplx

![MiniPerplx](/app/opengraph-image.png)

A minimalistic AI-powered search engine that helps you find information on the internet.

## ProductHunt Launch

Upvote MiniPerplx on ProductHunt to show your support!

<a href="https://www.producthunt.com/posts/miniperplx?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-miniperplx" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=481378&theme=light" alt="MiniPerplx - A&#0032;minimalistic&#0032;AI&#0045;powered&#0032;search&#0032;engine&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

## Features

- **AI-powered search**: Get answers to your questions using Anthropic's Models.
- **Web search**: Search the web using Tavily's API.
- **URL Specific search**: Get information from a specific URL.
- **Weather**: Get the current weather for any location using OpenWeather's API.
- **Programming**: Run code snippets in multiple languages using E2B's API.
- **Maps**: Get the location of any place using Google Maps API, Mapbox API, and TripAdvisor API.
- **Translation**: Translate text to different languages using Microsoft's Translator API.
- **YouTube Search**: Search for videos on YouTube and get timestamps and transcripts.
- **Academic Search**: Search for academic papers.
- **Product Search**: Search for products on Amazon.
- **X Posts Search**: Search for posts on X.com.
- **Flight Tracker**: Track flights using AviationStack's API.
- **Trending Movies and TV Shows**: Get information about trending movies and TV shows.
- **Movie or TV Show Search**: Get information about any movie or TV show.

## LLM used
- [xAI's Grok](https://x.ai/grok)

## Built with
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Tavily](https://tavily.com/)
- [OpenWeather](https://openweathermap.org/)
- [E2B](https://e2b.dev/)
- [Google Maps](https://developers.google.com/maps)
- [Mapbox](https://www.mapbox.com/)
- [TripAdvisor](https://www.tripadvisor.com/)
- [Microsoft Translator](https://www.microsoft.com/en-us/translator)
- [Exa.AI](https://exa.ai/)
- [AviationStack](https://aviationstack.com/)

### Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzaidmukaddam%2Fminiperplx&env=XAI_API_KEY,GROQ_API_KEY,TAVILY_API_KEY,OPENWEATHER_API_KEY,E2B_API_KEY&envDescription=API%20keys%20needed%20for%20application)

## Set MiniPerplx as your default search engine

1. **Open the Chrome browser settings**:
   - Click on the three vertical dots in the upper right corner of the browser.
   - Select "Settings" from the dropdown menu.

2. **Go to the search engine settings**:
   - In the left sidebar, click on "Search engine."
   - Then select "Manage search engines and site search."

3. **Add a new search engine**:
   - Click on "Add" next to "Site search."

4. **Set the search engine name**:
   - Enter `MiniPerplx` in the "Search engine" field.

5. **Set the search engine URL**:
   - Enter `https://mplx.run?q=%s` in the "URL with %s in place of query" field.

6. **Set the search engine shortcut**:
   - Enter `mp` in the "Shortcut" field.

7. **Set Default**:
   - Click on the three dots next to the search engine you just added.
   - Select "Make default" from the dropdown menu.

After completing these steps, you should be able to use MiniPerplx as your default search engine in Chrome.

### Local development

To run the example locally you need to:

1. Sign up for accounts with the AI providers you want to use. OpenAI and Anthropic are required, Tavily is required for the web search feature.
2. Obtain API keys for each provider.
3. Set the required environment variables as shown in the `.env.example` file, but in a new file called `.env.local`.
4. `pnpm install` to install the required dependencies.
5. `pnpm dev` to launch the development server.

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
