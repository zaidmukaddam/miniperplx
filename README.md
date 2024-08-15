# MiniPerplx

![MiniPerplx](/app/opengraph-image.png)

A minimalistic AI-powered search engine that helps you find information on the internet.

## Features

- **AI-powered search**: Get answers to your questions using Anthropic's Models.
- **Web search**: Search the web using Tavily's API.
- **URL Specific search**: Get information from a specific URL.
- **Weather**: Get the current weather for any location using OpenWeather's API.
- **Programming**: Run code snippets in multiple languages using E2B's API.

## Built with
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Anthropic](https://www.anthropic.com/)
- [Tavily](https://tavily.com/)
- [OpenWeather](https://openweathermap.org/)
- [E2B](https://e2b.dev/)

### Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzaidmukaddam%2Fminiperplx&env=ANTHROPIC_API_KEY,GROQ_API_KEY,TAVILY_API_KEY,OPENWEATHER_API_KEY,E2B_API_KEY&envDescription=API%20keys%20needed%20for%20application)

### Local development

To run the example locally you need to:

1. Sign up for accounts with the AI providers you want to use. OpenAI and Anthropic are required, Tavily is required for the web search feature.
2. Obtain API keys for each provider.
3. Set the required environment variables as shown in the `.env.example` file, but in a new file called `.env.local`.
4. `pnpm install` to install the required dependencies.
5. `pnpm dev` to launch the development server.

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
