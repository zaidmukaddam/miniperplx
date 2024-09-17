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
- **Maps**: Get the location of any place using Google Maps API.
- **Results Overview**: Get a quick overview of the results from different providers.
- **Translation**: Translate text to different languages using Microsoft's Translator API.

## Built with
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Tavily](https://tavily.com/)
- [OpenWeather](https://openweathermap.org/)
- [E2B](https://e2b.dev/)
- [Google Maps](https://developers.google.com/maps)

## LLM used
- [OpenAI's GPT 4o mini](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/)
- [Anthropic's Claude 3.5 Sonnet](https://www.anthropic.com/news/claude-3-5-sonnet/)
- [OpenAI's o1-mini](https://openai.com/index/openai-o1-mini-advancing-cost-efficient-reasoning/) powered by [OpenRouter](https://openrouter.ai/models/openai/o1-mini)

### Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzaidmukaddam%2Fminiperplx&env=OPENAI_API_KEY,ANTHROPIC_API_KEY,GROQ_API_KEY,TAVILY_API_KEY,OPENWEATHER_API_KEY,E2B_API_KEY&envDescription=API%20keys%20needed%20for%20application)

### Local development

To run the example locally you need to:

1. Sign up for accounts with the AI providers you want to use. OpenAI and Anthropic are required, Tavily is required for the web search feature.
2. Obtain API keys for each provider.
3. Set the required environment variables as shown in the `.env.example` file, but in a new file called `.env.local`.
4. `pnpm install` to install the required dependencies.
5. `pnpm dev` to launch the development server.

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
