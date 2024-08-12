# MiniPerplx

![MiniPerplx](/app/opengraph-image.png)

A minimalistic AI-powered search engine that helps you find information on the internet.

### Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzaidmukaddam%2Fminiperplx&env=OPENAI_API_KEY,ANTHROPIC_API_KEY,TAVILY_API_KEY,OPENWEATHER_API_KEY,E2B_API_KEY&envDescription=API%20keys%20needed%20for%20application)

To run the example locally you need to:

1. Sign up for accounts with the AI providers you want to use. OpenAI and Anthropic are required, Tavily is required for the web search feature.
2. Obtain API keys for each provider.
3. Set the required environment variables as shown in the `.env.example` file, but in a new file called `.env.local`.
4. `pnpm install` to install the required dependencies.
5. `pnpm dev` to launch the development server.

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
