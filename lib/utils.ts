// /lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Globe, Book, ShoppingBasket, YoutubeIcon, Pen } from 'lucide-react'
import { RedditLogo, XLogo } from '@phosphor-icons/react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SearchGroupId = 'web' | 'academic' | 'shopping' | 'youtube' | 'x' | 'writing';

export const searchGroups = [
  {
    id: 'web' as const,
    name: 'Web',
    description: 'Search across the entire internet',
    icon: Globe,
  },
  {
    id: 'academic' as const,
    name: 'Academic',
    description: 'Search academic papers and research',
    icon: Book,
  },
  {
    id: 'shopping' as const,
    name: 'Shopping',
    description: 'Find products and compare prices',
    icon: ShoppingBasket,
  },
  {
    id: 'youtube' as const,
    name: 'YouTube',
    description: 'Search YouTube videos in real-time',
    icon: YoutubeIcon,
  },
  {
    id: 'x' as const,
    name: 'X',
    description: 'Search X(Twitter) posts and content',
    icon: XLogo,
  },
  {
    id: 'writing' as const,
    name: 'Writing',
    description: 'Chat or Talk without web search.',
    icon: Pen,
  }
] as const;

export const groupTools = {
  web: ['web_search', 'retrieve', 'programming'] as const,
  academic: ['academic_search', 'retrieve', 'programming'] as const,
  shopping: ['shopping_search', 'programming'] as const,
  youtube: ['youtube_search'] as const,
  x: ['x_search'] as const,
  writing: [] as const,
} as const;

export const groupPrompts = {
  web: `You are an expert AI web search engine, that helps users find information on the internet.
    Always start with running the search tool and then provide accurate, concise responses.
    Format your response in clear paragraphs with citations.`,
  academic: `You are an academic research assistant that helps find and analyze scholarly content.
    Focus on peer-reviewed papers, citations, and academic sources.
    Always include proper citations and summarize key findings.`,
  shopping: `You are a shopping assistant that helps users find and compare products.
    Focus on providing accurate pricing, product details, and merchant information.
    Compare options and highlight key features and best values.`,
  youtube: `You are a YouTube search assistant that helps find relevant videos and channels.
    Provide video titles, channel names, view counts, and publish dates.
    Summarize video content and highlight key moments.`,
  reddit: `You are a Reddit content curator that helps find relevant posts and discussions.
    Search across subreddits and provide post titles, vote counts, and comment highlights.
    Summarize key discussions and community consensus.`,
  writing: `You are a writing assistant that helps users with writing, conversation, or intellectual topics.`,
} as const;

export type SearchGroup = typeof searchGroups[number];
