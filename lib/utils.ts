// /lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Globe, Book, YoutubeIcon, Pen } from 'lucide-react'
import { Brain, XLogo } from '@phosphor-icons/react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SearchGroupId = 'web' | 'academic'  | 'youtube' | 'x';

export const searchGroups = [
  {
    id: 'web' as const,
    name: 'Web',
    description: 'Search across the entire internet',
    icon: Globe,
  },
  {
    id: 'x' as const,
    name: 'X',
    description: 'Search X(Twitter) posts and content',
    icon: XLogo,
  },
  {
    id: 'academic' as const,
    name: 'Academic',
    description: 'Search academic papers and research',
    icon: Book,
  },
  {
    id: 'youtube' as const,
    name: 'YouTube',
    description: 'Search YouTube videos in real-time',
    icon: YoutubeIcon,
  },
] as const;

export type SearchGroup = typeof searchGroups[number];
