// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/*
	 * Serverside Environment variables, not available on the client.
	 * Will throw if you access these variables on the client.
	 */
	server: {
		GROQ_API_KEY: z.string().min(1),
		TAVILY_API_KEY: z.string().min(1),
		OPENWEATHER_API_KEY: z.string().min(1),
		GOOGLE_MAPS_API_KEY: z.string().min(1),
	},
	/*
	 * Environment variables available on the client (and server).
	 *
	 * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
	 */
	client: {
		NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),
	},
	/*
	 * Due to how Next.js bundles environment variables on Edge and Client,
	 * we need to manually destructure them to make sure all are included in bundle.
	 *
	 * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
	 */
	runtimeEnv: {
		GROQ_API_KEY: process.env.GROQ_API_KEY,
		TAVILY_API_KEY: process.env.TAVILY_API_KEY,
		OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
		GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
		NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
});
