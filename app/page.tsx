/* eslint-disable @next/next/no-img-element */
"use client";
import 'katex/dist/katex.min.css';

import { BorderTrail } from '@/components/core/border-trail';
import { TextShimmer } from '@/components/core/text-shimmer';
import { FlightTracker } from '@/components/flight-tracker';
import { InstallPrompt } from '@/components/InstallPrompt';
import InteractiveChart from '@/components/interactive-charts';
import { MapComponent, MapContainer } from '@/components/map-components';
import TMDBResult from '@/components/movie-info';
import MultiSearch from '@/components/multi-search';
import NearbySearchMapView from '@/components/nearby-search-map-view';
import TrendingResults from '@/components/trending-tv-movies-results';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import FormComponent from '@/components/ui/form-component';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import WeatherChart from '@/components/weather-chart';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn, SearchGroupId } from '@/lib/utils';
import { Wave } from "@foobar404/wave";
import { CurrencyDollar, Flag, RoadHorizon, SoccerBall, TennisBall, XLogo } from '@phosphor-icons/react';
import { GitHubLogoIcon, TextIcon } from '@radix-ui/react-icons';
import { ToolInvocation } from 'ai';
import { useChat } from 'ai/react';
import Autoplay from 'embla-carousel-autoplay';
import { AnimatePresence, motion } from 'framer-motion';
import { GeistMono } from 'geist/font/mono';
import {
  AlignLeft,
  ArrowRight,
  Book,
  Brain,
  Building,
  Calculator,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Cloud,
  Code,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  FileText,
  Film,
  Flame,
  Globe,
  Heart,
  ListTodo,
  Loader2,
  LucideIcon,
  MapPin,
  Moon,
  Pause,
  Plane,
  Play,
  Plus,
  Sparkles,
  Sun,
  TrendingUp,
  TrendingUpIcon,
  Tv,
  User2,
  Users,
  X,
  YoutubeIcon
} from 'lucide-react';
import Marked, { ReactRenderer } from 'marked-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import Latex from 'react-latex-next';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tweet } from 'react-tweet';
import { toast } from 'sonner';
import {
  fetchMetadata,
  generateSpeech,
  suggestQuestions
} from './actions';
import { TrendingQuery } from './api/trending/route';

export const maxDuration = 60;

interface Attachment {
    name: string;
    contentType: string;
    url: string;
    size: number;
}

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

interface AcademicResult {
    title: string;
    url: string;
    author?: string | null;
    publishedDate?: string;
    summary: string;
}

// Updated SearchLoadingState with new colors and states
const SearchLoadingState = ({
    icon: Icon,
    text,
    color
}: {
    icon: LucideIcon,
    text: string,
    color: "red" | "green" | "orange" | "violet" | "gray" | "blue"
}) => {
    // Map of color variants
    const colorVariants = {
        red: {
            background: "bg-red-50 dark:bg-red-950",
            border: "from-red-200 via-red-500 to-red-200 dark:from-red-400 dark:via-red-500 dark:to-red-700",
            text: "text-red-500",
            icon: "text-red-500"
        },
        green: {
            background: "bg-green-50 dark:bg-green-950",
            border: "from-green-200 via-green-500 to-green-200 dark:from-green-400 dark:via-green-500 dark:to-green-700",
            text: "text-green-500",
            icon: "text-green-500"
        },
        orange: {
            background: "bg-orange-50 dark:bg-orange-950",
            border: "from-orange-200 via-orange-500 to-orange-200 dark:from-orange-400 dark:via-orange-500 dark:to-orange-700",
            text: "text-orange-500",
            icon: "text-orange-500"
        },
        violet: {
            background: "bg-violet-50 dark:bg-violet-950",
            border: "from-violet-200 via-violet-500 to-violet-200 dark:from-violet-400 dark:via-violet-500 dark:to-violet-700",
            text: "text-violet-500",
            icon: "text-violet-500"
        },
        gray: {
            background: "bg-neutral-50 dark:bg-neutral-950",
            border: "from-neutral-200 via-neutral-500 to-neutral-200 dark:from-neutral-400 dark:via-neutral-500 dark:to-neutral-700",
            text: "text-neutral-500",
            icon: "text-neutral-500"
        },
        blue: {
            background: "bg-blue-50 dark:bg-blue-950",
            border: "from-blue-200 via-blue-500 to-blue-200 dark:from-blue-400 dark:via-blue-500 dark:to-blue-700",
            text: "text-blue-500",
            icon: "text-blue-500"
        }
    };

    const variant = colorVariants[color];

    return (
        <Card className="relative w-full h-[100px] my-4 overflow-hidden shadow-none">
            <BorderTrail
                className={cn(
                    'bg-gradient-to-l',
                    variant.border
                )}
                size={80}
            />
            <CardContent className="p-6">
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "relative h-10 w-10 rounded-full flex items-center justify-center",
                            variant.background
                        )}>
                            <BorderTrail
                                className={cn(
                                    "bg-gradient-to-l",
                                    variant.border
                                )}
                                size={40}
                            />
                            <Icon className={cn("h-5 w-5", variant.icon)} />
                        </div>
                        <div className="space-y-2">
                            <TextShimmer
                                className="text-base font-medium"
                                duration={2}
                            >
                                {text}
                            </TextShimmer>
                            <div className="flex gap-2">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"
                                        style={{
                                            width: `${Math.random() * 40 + 20}px`,
                                            animationDelay: `${i * 0.2}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Base YouTube Types
interface VideoDetails {
    title?: string;
    author_name?: string;
    author_url?: string;
    thumbnail_url?: string;
    type?: string;
    provider_name?: string;
    provider_url?: string;
    height?: number;
    width?: number;
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

interface YouTubeSearchResponse {
    results: VideoResult[];
}

// UI Component Types
interface YouTubeCardProps {
    video: VideoResult;
    index: number;
}

const VercelIcon = ({ size = 16 }: { size: number }) => {
    return (
        <svg
            height={size}
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width={size}
            style={{ color: "currentcolor" }}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 1L16 15H0L8 1Z"
                fill="currentColor"
            ></path>
        </svg>
    );
};


const XAIIcon = ({ size = 16 }: { size: number }) => {
    return (
        <svg
            height={size}
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            width={size}
            style={{ color: "currentcolor" }}
        >
            <path
                d="m3.005 8.858 8.783 12.544h3.904L6.908 8.858zM6.905 15.825 3 21.402h3.907l1.951-2.788zM16.585 2l-6.75 9.64 1.953 2.79L20.492 2zM17.292 7.965v13.437h3.2V3.395z"
                fillRule='evenodd'
                clipRule={'evenodd'}
                fill={'currentColor'}
            ></path>
        </svg>
    );
}

const YouTubeCard: React.FC<YouTubeCardProps> = ({ video, index }) => {
    const [timestampsExpanded, setTimestampsExpanded] = useState(false);
    const [transcriptExpanded, setTranscriptExpanded] = useState(false);

    if (!video) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="w-[300px] flex-shrink-0 relative rounded-xl dark:bg-neutral-800/50 bg-gray-50 overflow-hidden"
        >
            {/* Thumbnail */}
            <Link
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video block bg-neutral-200 dark:bg-neutral-700"
            >
                {video.details?.thumbnail_url ? (
                    <img
                        src={video.details.thumbnail_url}
                        alt={video.details?.title || 'Video thumbnail'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <YoutubeIcon className="h-8 w-8 text-neutral-400" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <YoutubeIcon className="h-12 w-12 text-red-500" />
                </div>
            </Link>

            <div className="p-4 flex flex-col gap-3">
                {/* Title and Channel */}
                <div className="space-y-2">
                    <Link
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium line-clamp-2 hover:text-red-500 transition-colors dark:text-neutral-100"
                    >
                        {video.details?.title || 'YouTube Video'}
                    </Link>

                    {video.details?.author_name && (
                        <Link
                            href={video.details.author_url || video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 group w-fit"
                        >
                            <div className="h-6 w-6 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
                                <User2 className="h-4 w-4 text-red-500" />
                            </div>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-red-500 transition-colors truncate">
                                {video.details.author_name}
                            </span>
                        </Link>
                    )}
                </div>

                {/* Interactive Sections */}
                {(video.timestamps && video.timestamps?.length > 0 || video.captions) && (
                    <div className="space-y-3">
                        <Separator />

                        {/* Timestamps */}
                        {video.timestamps && video.timestamps.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-medium dark:text-neutral-300">Key Moments</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setTimestampsExpanded(!timestampsExpanded)}
                                        className="h-6 px-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        {timestampsExpanded ? 'Show Less' : `Show All (${video.timestamps.length})`}
                                    </Button>
                                </div>
                                <div className={cn(
                                    "space-y-1.5 overflow-hidden transition-all duration-300",
                                    timestampsExpanded ? "max-h-[300px] overflow-y-auto" : "max-h-[72px]"
                                )}>
                                    {video.timestamps
                                        .slice(0, timestampsExpanded ? undefined : 3)
                                        .map((timestamp, i) => (
                                            <div
                                                key={i}
                                                className="text-xs dark:text-neutral-400 text-neutral-600 line-clamp-1"
                                            >
                                                {timestamp}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Transcript */}
                        {video.captions && (
                            <>
                                {video.timestamps && video.timestamps!.length > 0 && <Separator />}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-medium dark:text-neutral-300">Transcript</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                                            className="h-6 px-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        >
                                            {transcriptExpanded ? 'Hide' : 'Show'}
                                        </Button>
                                    </div>
                                    {transcriptExpanded && (
                                        <div className="text-xs dark:text-neutral-400 text-neutral-600 max-h-[200px] overflow-y-auto rounded-md bg-neutral-100 dark:bg-neutral-900 p-3">
                                            <p className="whitespace-pre-wrap">
                                                {video.captions}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const SponsorDialog = ({
    open,
    onClose
}: {
    open: boolean;
    onClose: () => void;
}) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    const handleDismiss = () => {
        localStorage.setItem('dismissedSponsor', 'true');
        onClose();
    };

    const SponsorContent = () => (
        <div className="space-y-6 px-2 ">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-20 w-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <Heart className="h-10 w-10 text-red-500 dark:text-red-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        Support MiniPerplx
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-pretty">
                        Help keep MiniPerplx running, bring in the best LLMs and be ad-free. Your support enables continuous improvements and new features.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                <Button
                    onClick={() => window.open("https://github.com/sponsors/zaidmukaddam", "_blank")}
                    className="bg-red-500 hover:bg-red-600 text-white w-full py-6 text-lg gap-2"
                >
                    <Heart className="h-5 w-5" />
                    Become a Sponsor
                </Button>

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => window.open("https://github.com/zaidmukaddam/miniperplx", "_blank")}
                        className="gap-2"
                    >
                        <GitHubLogoIcon className="h-4 w-4" />
                        GitHub
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDismiss}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Dismiss
                    </Button>
                </div>
            </div>

            <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                Your support means the world to us! ❤️
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onClose}>
                <DrawerContent className="max-h-[90vh] px-4 py-6 !z-[62] font-sans">
                    <DrawerHeader className="text-center">
                        <DrawerTitle>Support the Project</DrawerTitle>
                    </DrawerHeader>
                    <SponsorContent />
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md !z-[62] font-sans">
                <SponsorContent />
            </DialogContent>
        </Dialog>
    );
};

const HomeContent = () => {
    const [query] = useQueryState('query', parseAsString.withDefault(''))
    const [q] = useQueryState('q', parseAsString.withDefault(''))
    const [model] = useQueryState('model', parseAsString.withDefault('grok-2-1212'))

    // Memoize initial values to prevent re-calculation
    const initialState = useMemo(() => ({
        query: query || q,
        model: model
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []); // Empty dependency array as we only want this on mount

    const lastSubmittedQueryRef = useRef(initialState.query);
    const [hasSubmitted, setHasSubmitted] = useState(() => !!initialState.query);
    const [selectedModel, setSelectedModel] = useState(initialState.model);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [isEditingMessage, setIsEditingMessage] = useState(false);
    const [editingMessageIndex, setEditingMessageIndex] = useState(-1);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const initializedRef = useRef(false);
    const [selectedGroup, setSelectedGroup] = useState<SearchGroupId>('web');

    // At the top with other state declarations
    const [showSponsorDialog, setShowSponsorDialog] = useState(false);
    const [hasDismissedSponsor, setHasDismissedSponsor] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dismissedSponsor') === 'true';
        }
        return false;
    });

    const CACHE_KEY = 'trendingQueriesCache';
    const CACHE_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

    // Add this type definition
    interface TrendingQueriesCache {
        data: TrendingQuery[];
        timestamp: number;
    }

    const getTrendingQueriesFromCache = (): TrendingQueriesCache | null => {
        if (typeof window === 'undefined') return null;

        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsedCache = JSON.parse(cached) as TrendingQueriesCache;
        const now = Date.now();

        if (now - parsedCache.timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return parsedCache;
    };

    const { theme } = useTheme();

    const [openChangelog, setOpenChangelog] = useState(false);

    const [trendingQueries, setTrendingQueries] = useState<TrendingQuery[]>([]);

    const { isLoading, input, messages, setInput, append, handleSubmit, setMessages, reload, stop } = useChat({
        maxSteps: 8,
        body: {
            model: selectedModel,
            group: selectedGroup,
        },
        onFinish: async (message, { finishReason }) => {
            console.log("[finish reason]:", finishReason);
            if (message.content && finishReason === 'stop' || finishReason === 'length') {
                const newHistory = [...messages, { role: "user", content: lastSubmittedQueryRef.current }, { role: "assistant", content: message.content }];
                const { questions } = await suggestQuestions(newHistory);
                setSuggestedQuestions(questions);
            }
        },
        onError: (error) => {
            console.error("Chat error:", error.cause, error.message);
            toast.error("An error occurred.", {
                description: `Oops! An error occurred while processing your request. ${error.message}`,
            });
        },
    });

    // Add this useEffect in the HomeContent component
    useEffect(() => {
        if (!hasDismissedSponsor) {
            const timer = setTimeout(() => {
                setShowSponsorDialog(true);
            }, 30000); // Show after 30 seconds

            return () => clearTimeout(timer);
        }
    }, [hasDismissedSponsor]);

    useEffect(() => {
        if (!initializedRef.current && initialState.query && !messages.length) {
            initializedRef.current = true;
            setHasSubmitted(true);
            console.log("[initial query]:", initialState.query);
            append({
                content: initialState.query,
                role: 'user'
            });
        }
    }, [initialState.query, append, setInput, messages.length]);

    useEffect(() => {
        const fetchTrending = async () => {
            // Check cache first
            const cached = getTrendingQueriesFromCache();
            if (cached) {
                setTrendingQueries(cached.data);
                return;
            }

            try {
                const res = await fetch('/api/trending');
                if (!res.ok) throw new Error('Failed to fetch trending queries');
                const data = await res.json();

                // Store in cache
                const cacheData: TrendingQueriesCache = {
                    data,
                    timestamp: Date.now()
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

                setTrendingQueries(data);
            } catch (error) {
                console.error('Error fetching trending queries:', error);
                setTrendingQueries([]);
            }
        };

        fetchTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const ThemeToggle: React.FC = () => {
        const { theme, setTheme } = useTheme();

        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        );
    };


    const CopyButton = ({ text }: { text: string }) => {
        const [isCopied, setIsCopied] = useState(false);

        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                    if (!navigator.clipboard) {
                        return;
                    }
                    await navigator.clipboard.writeText(text);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                    toast.success("Copied to clipboard");
                }}
                className="h-8 px-2 text-xs rounded-full"
            >
                {isCopied ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <Copy className="h-4 w-4" />
                )}
            </Button>
        );
    };

    type Changelog = {
        id: string;
        images: string[];
        content: string;
        title: string;
    };

    const changelogs: Changelog[] = [
        {
            id: "1",
            title: "The Unexpected Collab",
            images: [
                "https://metwm7frkvew6tn1.public.blob.vercel-storage.com/mplx-changelogs/mplx-collab.jpeg",
            ],
            content: `
## **MiniPerplx x Vercel x xAI Collab**

Excited to annouce that MiniPerplx has partnered with Vercel and xAI to bring you the best of AI search experience.
Grok 2 models are now available for you to try out.
`
        }
    ];


    const ChangeLogs = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
        const isMobile = useMediaQuery("(max-width: 768px)");

        const ChangelogContent = () => (
            <>
                {/* Fixed Header */}
                <div className="w-full py-3 flex justify-center items-center border-b border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                        <Flame size={20} /> What&apos;s new
                    </h2>
                </div>

                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {changelogs.map((changelog) => (
                        <div key={changelog.id}>
                            {/* Carousel */}
                            <Carousel
                                opts={{
                                    align: "start",
                                    loop: true,
                                }}
                                plugins={[
                                    Autoplay({
                                        delay: 2000,
                                    }),
                                ]}
                                className="w-full bg-neutral-100 dark:bg-neutral-800"
                            >
                                <CarouselContent>
                                    {changelog.images.map((image, index) => (
                                        <CarouselItem key={index}>
                                            <Image
                                                src={image}
                                                alt={changelog.title}
                                                width={0}
                                                height={0}
                                                className="h-auto w-full object-cover"
                                                sizes="100vw"
                                            />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>

                            {/* Content Section */}
                            <div className="flex flex-col gap-2 px-4 py-2">
                                <h3 className="text-2xl font-bold text-left text-neutral-800 dark:text-neutral-100">
                                    {changelog.title}
                                </h3>
                                <div className="overflow-y-auto max-h-[50vh]">
                                    <ReactMarkdown
                                        components={{
                                            h2: ({ node, className, ...props }) => (
                                                <h2
                                                    {...props}
                                                    className={cn(
                                                        "my-2 text-lg font-medium text-neutral-800 dark:text-neutral-100",
                                                        className
                                                    )}
                                                />
                                            ),
                                            p: ({ node, className, ...props }) => (
                                                <p
                                                    {...props}
                                                    className={cn(
                                                        "mb-3 text-neutral-700 dark:text-neutral-300 leading-relaxed",
                                                        className
                                                    )}
                                                />
                                            ),
                                            a: ({ node, className, ...props }) => (
                                                <a
                                                    {...props}
                                                    className={cn(
                                                        "hover:text-blue-500 underline",
                                                        className
                                                    )}
                                                />
                                            ),
                                        }}
                                        className="text-sm text-left pr-2"
                                    >
                                        {changelog.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );

        if (isMobile) {
            return (
                <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerContent className="max-h-[100vh] z-[81] font-sans text-left">
                        <DrawerHeader className="p-0">
                            <ChangelogContent />
                        </DrawerHeader>
                    </DrawerContent>
                </Drawer>
            );
        }

        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] overflow-scroll rounded-xl border-none p-0 gap-0 font-sans bg-white dark:bg-neutral-900 z-[1000]">
                    <ChangelogContent />
                </DialogContent>
            </Dialog>
        );
    };

    const TranslationTool: React.FC<{ toolInvocation: ToolInvocation; result: any }> = ({ toolInvocation, result }) => {
        const [isPlaying, setIsPlaying] = useState(false);
        const [audioUrl, setAudioUrl] = useState<string | null>(null);
        const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
        const audioRef = useRef<HTMLAudioElement | null>(null);
        const canvasRef = useRef<HTMLCanvasElement | null>(null);
        const waveRef = useRef<Wave | null>(null);

        useEffect(() => {
          const _audioRef = audioRef.current
            return () => {
                if (_audioRef) {
                    _audioRef.pause();
                    _audioRef.src = '';
                }
            };
        }, []);

        useEffect(() => {
            if (audioUrl && audioRef.current && canvasRef.current) {
                waveRef.current = new Wave(audioRef.current, canvasRef.current);
                waveRef.current.addAnimation(new waveRef.current.animations.Lines({
                    lineColor: "rgb(203, 113, 93)",
                    lineWidth: 2,
                    mirroredY: true,
                    count: 100,
                }));
            }
        }, [audioUrl]);

        const handlePlayPause = async () => {
            if (!audioUrl && !isGeneratingAudio) {
                setIsGeneratingAudio(true);
                try {
                    const { audio } = await generateSpeech(result.translatedText, 'alloy');
                    setAudioUrl(audio);
                    setIsGeneratingAudio(false);
                } catch (error) {
                    console.error("Error generating speech:", error);
                    setIsGeneratingAudio(false);
                }
            } else if (audioRef.current) {
                if (isPlaying) {
                    audioRef.current.pause();
                } else {
                    audioRef.current.play();
                }
                setIsPlaying(!isPlaying);
            }
        };

        const handleReset = () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlaying(false);
            }
        };

        if (!result) {
            return (
                <Card className="w-full my-4 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <CardContent className="flex items-center justify-center h-24">
                        <div className="animate-pulse flex items-center">
                            <div className="h-4 w-4 bg-primary rounded-full mr-2"></div>
                            <div className="h-4 w-32 bg-primary rounded"></div>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="w-full my-4 shadow-none bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="w-full h-24 bg-neutral-100 dark:bg-neutral-700 rounded-lg overflow-hidden">
                            <canvas ref={canvasRef} width="800" height="200" className="w-full h-full" />
                        </div>
                        <div className="flex text-left gap-3 items-center justify-center text-pretty">
                            <div className="flex justify-center space-x-2">
                                <Button
                                    onClick={handlePlayPause}
                                    disabled={isGeneratingAudio}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs sm:text-sm w-24 bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                                >
                                    {isGeneratingAudio ? (
                                        "Generating..."
                                    ) : isPlaying ? (
                                        <><Pause className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Pause</>
                                    ) : (
                                        <><Play className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Play</>
                                    )}
                                </Button>
                            </div>
                            <div className='text-sm text-neutral-800 dark:text-neutral-200'>
                                The phrase <span className='font-semibold'>{toolInvocation.args.text}</span> translates from <span className='font-semibold'>{result.detectedLanguage}</span> to <span className='font-semibold'>{toolInvocation.args.to}</span> as <span className='font-semibold'>{result.translatedText}</span> in <span className='font-semibold'>{toolInvocation.args.to}</span>.
                            </div>
                        </div>
                    </div>
                </CardContent>
                {audioUrl && (
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => { setIsPlaying(false); handleReset(); }}
                    />
                )}
            </Card>
        );
    };



    interface TableData {
        title: string;
        content: string;
    }

    interface ResultsOverviewProps {
        result: {
            image: string;
            title: string;
            description: string;
            table_data: TableData[];
        };
    }

    const ResultsOverview: React.FC<ResultsOverviewProps> = React.memo(({ result }) => {
        const [showAll, setShowAll] = useState(false);

        const visibleData = useMemo(() => {
            return showAll ? result.table_data : result.table_data.slice(0, 3);
        }, [showAll, result.table_data]);

        return (
            <Card className="w-full my-4 overflow-hidden shadow-sm border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 bg-neutral-100 dark:bg-neutral-900">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                        {result.image && (
                            <div className="relative w-full sm:w-24 h-40 sm:h-24 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                                <img
                                    src={result.image}
                                    alt={result.title}
                                    className="rounded-lg w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-grow">
                            <CardTitle className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">{result.title}</CardTitle>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{result.description}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <Table>
                        <TableBody>
                            {visibleData.map((item, index) => (
                                <TableRow key={index} className="border-b border-neutral-200 dark:border-neutral-700 last:border-b-0">
                                    <TableCell className="font-medium text-neutral-700 dark:text-neutral-300 w-1/3 py-3 px-2 sm:px-4">{item.title}</TableCell>
                                    <TableCell className="text-neutral-600 dark:text-neutral-400 py-3 px-2 sm:px-4">{item.content}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {result.table_data.length > 3 && (
                        <Button
                            variant="ghost"
                            className="mt-4 w-full text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 transition-colors duration-200"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? (
                                <>
                                    <ChevronUp className="mr-2 h-4 w-4" /> Show Less
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="mr-2 h-4 w-4" /> Show More
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    });

    ResultsOverview.displayName = 'ResultsOverview';

    const renderToolInvocation = useCallback(
        (toolInvocation: ToolInvocation, index: number) => {
            const args = JSON.parse(JSON.stringify(toolInvocation.args));
            const result = 'result' in toolInvocation ? JSON.parse(JSON.stringify(toolInvocation.result)) : null;

            if (toolInvocation.toolName === 'thinking_canvas') {
                return (
                    <Card className="my-2 border border-neutral-200 dark:border-neutral-800 shadow-none rounded-xl overflow-hidden">
                        <details className="group [&>summary::-webkit-details-marker]:hidden [&>summary]:list-none" open>
                            <summary className="bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-800 cursor-pointer select-none">
                                <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center justify-center">
                                            <ListTodo className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-medium">{args.title}</CardTitle>
                                            <p className="text-xs text-neutral-500">{args.content.length} steps</p>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className="h-5 w-5 text-neutral-500 transition-transform duration-200 ease-in-out group-open:rotate-180"
                                    />
                                </CardHeader>
                            </summary>
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {args.content.map((thought: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group flex items-start gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                    >
                                        <span className="flex-shrink-0 w-5 h-5 rounded border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-[10px] font-medium text-neutral-500">
                                            {i + 1}
                                        </span>
                                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-normal group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
                                            {thought}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </details>
                    </Card>
                );
            }

            // Find place results
            if (toolInvocation.toolName === 'find_place') {
                if (!result) {
                    return <SearchLoadingState
                        icon={MapPin}
                        text="Finding locations..."
                        color="blue"
                    />;
                }

                const { features } = result;
                if (!features || features.length === 0) return null;

                return (
                    <Card className="w-full my-4 overflow-hidden bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                        {/* Map Container */}
                        <div className="relative w-full h-[60vh]">
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <Badge
                                    variant="secondary"
                                    className="bg-white/90 dark:bg-black/90 backdrop-blur-sm"
                                >
                                    {features.length} Locations Found
                                </Badge>
                            </div>

                            <MapComponent
                                center={{
                                    lat: features[0].geometry.coordinates[1],
                                    lng: features[0].geometry.coordinates[0],
                                }}
                                places={features.map((feature: any) => ({
                                    name: feature.name,
                                    location: {
                                        lat: feature.geometry.coordinates[1],
                                        lng: feature.geometry.coordinates[0],
                                    },
                                    vicinity: feature.formatted_address,
                                }))}
                                zoom={features.length > 1 ? 12 : 15}
                            />
                        </div>

                        {/* Place Details Footer */}
                        <div className="max-h-[300px] overflow-y-auto border-t border-neutral-200 dark:border-neutral-800">
                            {features.map((place: any, index: any) => {
                                const isGoogleResult = place.source === 'google';

                                return (
                                    <div
                                        key={place.id || index}
                                        className={cn(
                                            "p-4",
                                            index !== features.length - 1 && "border-b border-neutral-200 dark:border-neutral-800"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                                                {place.feature_type === 'street_address' || place.feature_type === 'street' ? (
                                                    <RoadHorizon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                ) : place.feature_type === 'locality' ? (
                                                    <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                                    {place.name}
                                                </h3>
                                                {place.formatted_address && (
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                                        {place.formatted_address}
                                                    </p>
                                                )}
                                                <Badge variant="secondary" className="mt-2">
                                                    {place.feature_type.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>

                                            <div className="flex gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const coords = `${place.geometry.coordinates[1]},${place.geometry.coordinates[0]}`;
                                                                    navigator.clipboard.writeText(coords);
                                                                    toast.success("Coordinates copied!");
                                                                }}
                                                                className="h-10 w-10"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Copy Coordinates</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const url = isGoogleResult
                                                                        ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
                                                                        : `https://www.google.com/maps/search/?api=1&query=${place.geometry.coordinates[1]},${place.geometry.coordinates[0]}`;
                                                                    window.open(url, '_blank');
                                                                }}
                                                                className="h-10 w-10"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View in Maps</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                );
            }

            if (toolInvocation.toolName === 'tmdb_search') {
                if (!result) {
                    return <SearchLoadingState
                        icon={Film}
                        text="Discovering entertainment content..."
                        color="violet"
                    />;
                }

                return <TMDBResult result={result} />;
            }

            if (toolInvocation.toolName === 'trending_movies') {
                if (!result) {
                    return <SearchLoadingState
                        icon={Film}
                        text="Loading trending movies..."
                        color="blue"
                    />;
                }
                return <TrendingResults result={result} type="movie" />;
            }

            if (toolInvocation.toolName === 'trending_tv') {
                if (!result) {
                    return <SearchLoadingState
                        icon={Tv}
                        text="Loading trending TV shows..."
                        color="blue"
                    />;
                }
                return <TrendingResults result={result} type="tv" />;
            }


            if (toolInvocation.toolName === 'x_search') {
                if (!result) {
                    return <SearchLoadingState
                        icon={XLogo}
                        text="Searching for latest news..."
                        color="gray"
                    />;
                }

                const PREVIEW_COUNT = 3;

                // Shared content component
                const FullTweetList = () => (
                    <div className="grid gap-4 p-4 sm:max-w-[500px]">
                        {result.map((post: XResult, index: number) => (
                            <motion.div
                                key={post.tweetId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Tweet id={post.tweetId} />
                            </motion.div>
                        ))}
                    </div>
                );

                return (
                    <Card className="w-full my-4 overflow-hidden shadow-none">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                                    <XLogo className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle>Latest from X</CardTitle>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {result.length} tweets found
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <div className="relative">
                            <div className="px-4 pb-2 h-72">
                                <div className="flex flex-nowrap overflow-x-auto gap-4 no-scrollbar">
                                    {result.slice(0, PREVIEW_COUNT).map((post: XResult, index: number) => (
                                        <motion.div
                                            key={post.tweetId}
                                            className="w-[min(100vw-2rem,320px)] flex-none"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <Tweet id={post.tweetId} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-black pointer-events-none" />

                            {/* Show More Buttons - Desktop Sheet */}
                            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center pb-4 pt-20 bg-gradient-to-t from-white dark:from-black to-transparent">
                                {/* Desktop Sheet */}
                                <div className="hidden sm:block">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="gap-2 bg-white dark:bg-black"
                                            >
                                                <XLogo className="h-4 w-4" />
                                                Show all {result.length} tweets
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className="w-[400px] sm:w-[600px] overflow-y-auto !p-0 !z-[70]">
                                            <SheetHeader className='!mt-5 !font-sans'>
                                                <SheetTitle className='text-center'>All Tweets</SheetTitle>
                                            </SheetHeader>
                                            <FullTweetList />
                                        </SheetContent>
                                    </Sheet>
                                </div>

                                {/* Mobile Drawer */}
                                <div className="block sm:hidden">
                                    <Drawer>
                                        <DrawerTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="gap-2 bg-white dark:bg-black"
                                            >
                                                <XLogo className="h-4 w-4" />
                                                Show all {result.length} tweets
                                            </Button>
                                        </DrawerTrigger>
                                        <DrawerContent className="max-h-[85vh] font-sans">
                                            <DrawerHeader>
                                                <DrawerTitle>All Tweets</DrawerTitle>
                                            </DrawerHeader>
                                            <div className="overflow-y-auto">
                                                <FullTweetList />
                                            </div>
                                        </DrawerContent>
                                    </Drawer>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            }

            if (toolInvocation.toolName === 'youtube_search') {
                if (!result) {
                    return <SearchLoadingState
                        icon={YoutubeIcon}
                        text="Searching YouTube videos..."
                        color="red"
                    />;
                }

                const youtubeResult = result as YouTubeSearchResponse;

                return (
                    <Accordion type="single" defaultValue="videos" collapsible className="w-full">
                        <AccordionItem value="videos" className="border-0">
                            <AccordionTrigger
                                className={cn(
                                    "w-full dark:bg-neutral-900 bg-white rounded-xl dark:border-neutral-800 border-gray-200 border px-6 py-4 hover:no-underline transition-all",
                                    "[&[data-state=open]]:rounded-b-none",
                                    "[&[data-state=open]]:border-b-0"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg dark:bg-neutral-800 bg-gray-100">
                                        <YoutubeIcon className="h-4 w-4 text-red-500" />
                                    </div>
                                    <div>
                                        <h2 className="dark:text-neutral-100 text-gray-900 font-medium text-left">
                                            YouTube Results
                                        </h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="dark:bg-neutral-800 bg-gray-100 dark:text-neutral-300 text-gray-600">
                                                {youtubeResult.results.length} videos
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="dark:bg-neutral-900 bg-white dark:border-neutral-800 border-gray-200 border border-t-0 rounded-b-xl">
                                <div className="flex overflow-x-auto gap-3 p-3 no-scrollbar">
                                    {youtubeResult.results.map((video, index) => (
                                        <YouTubeCard
                                            key={video.videoId}
                                            video={video}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );
            }

            // Academic search results continued...
            if (toolInvocation.toolName === 'academic_search') {
                if (!result) {
                    return <SearchLoadingState
                        icon={Book}
                        text="Searching academic papers..."
                        color="violet"
                    />;
                }

                return (
                    <Card className="w-full my-4 overflow-hidden">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center backdrop-blur-sm">
                                    <Book className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <CardTitle>Academic Papers</CardTitle>
                                    <p className="text-sm text-muted-foreground">Found {result.results.length} papers</p>
                                </div>
                            </div>
                        </CardHeader>
                        <div className="px-4 pb-2">
                            <div className="flex overflow-x-auto gap-4 no-scrollbar">
                                {result.results.map((paper: AcademicResult, index: number) => (
                                    <motion.div
                                        key={paper.url || index}
                                        className="w-[400px] flex-none"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <div className="h-[300px] relative group">
                                            {/* Background with gradient border */}
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            {/* Main content container */}
                                            <div className="h-full relative backdrop-blur-sm bg-background/95 dark:bg-neutral-900/95 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl p-4 flex flex-col transition-all duration-500 group-hover:border-violet-500/20">
                                                {/* Title */}
                                                <h3 className="font-semibold text-xl tracking-tight mb-3 line-clamp-2 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-300">
                                                    {paper.title}
                                                </h3>

                                                {/* Authors with better overflow handling */}
                                                {paper.author && (
                                                    <div className="mb-3">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 rounded-md">
                                                            <User2 className="h-3.5 w-3.5 text-violet-500" />
                                                            <span className="line-clamp-1">
                                                                {paper.author.split(';')
                                                                    .slice(0, 2) // Take first two authors
                                                                    .join(', ') +
                                                                    (paper.author.split(';').length > 2 ? ' et al.' : '')
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Date if available */}
                                                {paper.publishedDate && (
                                                    <div className="mb-4">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 rounded-md">
                                                            <Calendar className="h-3.5 w-3.5 text-violet-500" />
                                                            {new Date(paper.publishedDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Summary with gradient border */}
                                                <div className="flex-1 relative mb-4 pl-3">
                                                    <div className="absolute -left-0 top-1 bottom-1 w-[2px] rounded-full bg-gradient-to-b from-violet-500 via-violet-400 to-transparent opacity-50" />
                                                    <p className="text-sm text-muted-foreground line-clamp-4">
                                                        {paper.summary}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => window.open(paper.url, '_blank')}
                                                        className="flex-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 group/btn"
                                                    >
                                                        <FileText className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                                                        View Paper
                                                    </Button>

                                                    {paper.url.includes('arxiv.org') && (
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => window.open(paper.url.replace('abs', 'pdf'), '_blank')}
                                                            className="bg-neutral-100 dark:bg-neutral-800 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 group/btn"
                                                        >
                                                            <Download className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </Card>
                );
            }

            if (toolInvocation.toolName === 'nearby_search') {
                if (!result) {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-neutral-700 dark:text-neutral-300 animate-pulse" />
                                <span className="text-neutral-700 dark:text-neutral-300 text-lg">
                                    Finding nearby {args.type}...
                                </span>
                            </div>
                            <motion.div className="flex space-x-1">
                                {[0, 1, 2].map((index) => (
                                    <motion.div
                                        key={index}
                                        className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full"
                                        initial={{ opacity: 0.3 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.8,
                                            delay: index * 0.2,
                                            repeatType: "reverse",
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </div>
                    );
                }

                console.log(result);

                return (
                    <div className="my-4">
                        <NearbySearchMapView
                            center={result.center}
                            places={result.results}
                            type={args.type}
                        />
                    </div>
                );
            }

            if (toolInvocation.toolName === 'text_search') {
                if (!result) {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <div className='flex items-center gap-2'>
                                <MapPin className="h-5 w-5 text-neutral-700 dark:text-neutral-300 animate-pulse" />
                                <span className="text-neutral-700 dark:text-neutral-300 text-lg">Searching places...</span>
                            </div>
                            <motion.div className="flex space-x-1">
                                {[0, 1, 2].map((index) => (
                                    <motion.div
                                        key={index}
                                        className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full"
                                        initial={{ opacity: 0.3 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.8,
                                            delay: index * 0.2,
                                            repeatType: "reverse",
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </div>
                    );
                }

                const centerLocation = result.results[0]?.geometry?.location;
                return (
                    <MapContainer
                        title="Search Results"
                        center={centerLocation}
                        places={result.results.map((place: any) => ({
                            name: place.name,
                            location: place.geometry.location,
                            vicinity: place.formatted_address
                        }))}
                    />
                );
            }

            if (toolInvocation.toolName === 'get_weather_data') {
                if (!result) {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Cloud className="h-5 w-5 text-neutral-700 dark:text-neutral-300 animate-pulse" />
                                <span className="text-neutral-700 dark:text-neutral-300 text-lg">Fetching weather data...</span>
                            </div>
                            <div className="flex space-x-1">
                                {[0, 1, 2].map((index) => (
                                    <motion.div
                                        key={index}
                                        className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full"
                                        initial={{ opacity: 0.3 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.8,
                                            delay: index * 0.2,
                                            repeatType: "reverse",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                }
                return <WeatherChart result={result} />;
            }

            if (toolInvocation.toolName === 'programming') {
                return (
                    <Accordion type="single" collapsible className="w-full mt-4">
                        <AccordionItem value={`item-${index}`} className="border-none">
                            <AccordionTrigger className="hover:no-underline py-2">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Code className="h-5 w-5 text-primary" />
                                        <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">Programming</h2>
                                    </div>
                                    {!result ? (
                                        <Badge variant="secondary" className="mr-2 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                            Executing
                                        </Badge>
                                    ) : (
                                        <Badge className="mr-2 rounded-full bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200">
                                            <Check className="h-3 w-3 mr-1" />
                                            Executed
                                        </Badge>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="w-full my-2 border border-neutral-200 dark:border-neutral-700 overflow-hidden rounded-md">
                                    <div className="bg-neutral-100 dark:bg-neutral-800 p-2 flex items-center">
                                        {args.icon === 'stock' && <TrendingUpIcon className="h-5 w-5 text-primary mr-2" />}
                                        {args.icon === 'default' && <Code className="h-5 w-5 text-primary mr-2" />}
                                        {args.icon === 'date' && <Calendar className="h-5 w-5 text-primary mr-2" />}
                                        {args.icon === 'calculation' && <Calculator className="h-5 w-5 text-primary mr-2" />}
                                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{args.title}</span>
                                    </div>
                                    <Tabs defaultValue="code" className="w-full">
                                        <TabsList className="bg-neutral-50 dark:bg-neutral-900 p-0 h-auto shadow-sm rounded-none">
                                            <TabsTrigger
                                                value="code"
                                                className="px-4 py-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:border-b data-[state=active]:border-blue-500 rounded-none shadow-sm"
                                            >
                                                Code
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="output"
                                                className="px-4 py-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:border-b data-[state=active]:border-blue-500 rounded-none shadow-sm"
                                            >
                                                Output
                                            </TabsTrigger>
                                            {result?.images && result.images.length > 0 && (
                                                <TabsTrigger
                                                    value="images"
                                                    className="px-4 py-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:border-b data-[state=active]:border-blue-500 rounded-none shadow-sm"
                                                >
                                                    Images
                                                </TabsTrigger>
                                            )}
                                            {result?.chart && (
                                                <TabsTrigger
                                                    value="visualization"
                                                    className="px-4 py-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:border-b data-[state=active]:border-blue-500 rounded-none shadow-sm"
                                                >
                                                    Visualization
                                                </TabsTrigger>
                                            )}
                                        </TabsList>
                                        <TabsContent value="code" className="p-0 m-0 rounded-none">
                                            <div className="relative">
                                                <SyntaxHighlighter
                                                    language="python"
                                                    style={theme === "light" ? oneLight : oneDark}
                                                    customStyle={{
                                                        margin: 0,
                                                        padding: '1rem',
                                                        fontSize: '0.875rem',
                                                        borderRadius: 0,
                                                    }}
                                                >
                                                    {args.code}
                                                </SyntaxHighlighter>
                                                <style jsx>{`
                                                    @media (max-width: 640px) {
                                                        .syntax-highlighter {
                                                            font-size: 0.75rem;
                                                        }
                                                    }
                                                `}</style>
                                                <div className="absolute top-2 right-2">
                                                    <CopyButton text={args.code} />
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="output" className="p-0 m-0 rounded-none">
                                            <div className="relative bg-white dark:bg-neutral-800 p-4">
                                                {result ? (
                                                    <>
                                                        <pre className="text-sm text-neutral-800 dark:text-neutral-200">
                                                            <code>{result.message}</code>
                                                        </pre>
                                                        <div className="absolute top-2 right-2">
                                                            <CopyButton text={result.message} />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center justify-center h-20">
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="h-5 w-5 text-neutral-400 dark:text-neutral-600 animate-spin" />
                                                            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Executing code...</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                        {result?.images && result.images.length > 0 && (
                                            <TabsContent value="images" className="p-0 m-0 bg-white dark:bg-neutral-800">
                                                <div className="space-y-4 p-4">
                                                    {result.images.map((img: { format: string, url: string }, imgIndex: number) => (
                                                        <div key={imgIndex} className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Image {imgIndex + 1}</h4>
                                                                {img.url && img.url.trim() !== '' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="p-0 h-8 w-8"
                                                                        onClick={() => {
                                                                            window.open(img.url + "?download=1", '_blank');
                                                                        }}
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                                                                {img.url && img.url.trim() !== '' ? (
                                                                    <Image
                                                                        src={img.url}
                                                                        alt={`Generated image ${imgIndex + 1}`}
                                                                        layout="fill"
                                                                        objectFit="contain"
                                                                    />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500">
                                                                        Image upload failed or URL is empty
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TabsContent>
                                        )}
                                        {result?.chart && (
                                            <TabsContent value="visualization" className="p-4 m-0 bg-white dark:bg-neutral-800">
                                                <InteractiveChart
                                                    chart={{
                                                        type: result.chart.type,
                                                        title: result.chart.title,
                                                        x_label: result.chart.x_label,
                                                        y_label: result.chart.y_label,
                                                        x_unit: result.chart.x_unit,
                                                        y_unit: result.chart.y_unit,
                                                        elements: result.chart.elements
                                                    }}
                                                />
                                            </TabsContent>
                                        )}
                                    </Tabs>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );
            }

            if (toolInvocation.toolName === 'web_search') {
                return (
                    <div className="mt-4">
                        <MultiSearch result={result} args={args} />
                    </div>
                );
            }

            if (toolInvocation.toolName === 'retrieve') {
                if (!result) {
                    return (
                        <div className="border border-neutral-200 rounded-xl my-4 p-4 dark:border-neutral-800 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-900/90">
                            <div className="flex items-center gap-4">
                                <div className="relative w-10 h-10">
                                    <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-lg" />
                                    <Globe className="h-5 w-5 text-primary/70 absolute inset-0 m-auto" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-md" />
                                    <div className="space-y-1.5">
                                        <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800/50 animate-pulse rounded-md" />
                                        <div className="h-3 w-2/3 bg-neutral-100 dark:bg-neutral-800/50 animate-pulse rounded-md" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="border border-neutral-200 rounded-xl my-4 overflow-hidden dark:border-neutral-800 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-900/90">
                        <div className="p-4">
                            <div className="flex items-start gap-4">
                                <div className="relative w-10 h-10 flex-shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-lg" />
                                    <img
                                        className="h-5 w-5 absolute inset-0 m-auto"
                                        src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(result.results[0].url)}`}
                                        alt=""
                                    />
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                    <h2 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
                                        {result.results[0].title}
                                    </h2>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                        {result.results[0].description}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                            {result.results[0].language || 'Unknown'}
                                        </span>
                                        <a
                                            href={result.results[0].url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary transition-colors"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            View source
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-neutral-200 dark:border-neutral-800">
                            <details className="group">
                                <summary className="w-full px-4 py-2 cursor-pointer text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TextIcon className="h-4 w-4 text-neutral-400" />
                                        <span>View content</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                                </summary>
                                <div className="max-h-[50vh] overflow-y-auto p-4 bg-neutral-50/50 dark:bg-neutral-800/30">
                                    <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{result.results[0].content}</ReactMarkdown>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                );
            }
            if (toolInvocation.toolName === 'text_translate') {
                return <TranslationTool toolInvocation={toolInvocation} result={result} />;
            }

            if (toolInvocation.toolName === 'results_overview') {
                if (!result) {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 text-neutral-700 dark:text-neutral-300 animate-spin" />
                                <span className="text-neutral-700 dark:text-neutral-300 text-lg">Generating overview...</span>
                            </div>
                        </div>
                    );
                }

                return <ResultsOverview result={result} />;
            }

            if (toolInvocation.toolName === 'track_flight') {
                if (!result) {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Plane className="h-5 w-5 text-neutral-700 dark:text-neutral-300 animate-pulse" />
                                <span className="text-neutral-700 dark:text-neutral-300 text-lg">Tracking flight...</span>
                            </div>
                            <div className="flex space-x-1">
                                {[0, 1, 2].map((index) => (
                                    <motion.div
                                        key={index}
                                        className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full"
                                        initial={{ opacity: 0.3 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.8,
                                            delay: index * 0.2,
                                            repeatType: "reverse",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                }

                if (result.error) {
                    return (
                        <div className="text-red-500 dark:text-red-400">
                            Error tracking flight: {result.error}
                        </div>
                    );
                }

                return (
                    <div className="my-4">
                        <FlightTracker data={result} />
                    </div>
                );
            }

            return null;
        },
        [ResultsOverview, theme]
    );

    interface MarkdownRendererProps {
        content: string;
    }

    interface CitationLink {
        text: string;
        link: string;
    }

    interface LinkMetadata {
        title: string;
        description: string;
    }

    const isValidUrl = (str: string) => {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    };

    const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
        const [metadataCache, setMetadataCache] = useState<Record<string, LinkMetadata>>({});

        const citationLinks = useMemo<CitationLink[]>(() => {
            return Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map(([_, text, link]) => ({
                text,
                link,
            }));
        }, [content]);

        const inlineMathRegex = /\$([^\$]+)\$/g;
        const blockMathRegex = /\$\$([^\$]+)\$\$/g;

        const isValidLatex = (text: string): boolean => {
            // Basic validation - checks for balanced delimiters
            return !(text.includes('\\') && !text.match(/\\[a-zA-Z{}\[\]]+/));
        }

        const renderLatexString = (text: string) => {
            let parts = [];
            let lastIndex = 0;
            let match;

            // Try to match inline math first ($...$)
            while ((match = /\$([^\$]+)\$/g.exec(text.slice(lastIndex))) !== null) {
                const mathText = match[1];
                const fullMatch = match[0];
                const matchIndex = lastIndex + match.index;

                // Add text before math
                if (matchIndex > lastIndex) {
                    parts.push(text.slice(lastIndex, matchIndex));
                }

                // Only render as LaTeX if valid
                if (isValidLatex(mathText)) {
                    parts.push(<Latex key={matchIndex}>{fullMatch}</Latex>);
                } else {
                    parts.push(fullMatch);
                }

                lastIndex = matchIndex + fullMatch.length;
            }

            // Add remaining text
            if (lastIndex < text.length) {
                parts.push(text.slice(lastIndex));
            }

            return parts.length > 0 ? parts : text;
        };

        const fetchMetadataWithCache = useCallback(async (url: string) => {
            if (metadataCache[url]) {
                return metadataCache[url];
            }

            const metadata = await fetchMetadata(url);
            if (metadata) {
                setMetadataCache(prev => ({ ...prev, [url]: metadata }));
            }
            return metadata;
        }, [metadataCache]);

        interface CodeBlockProps {
            language: string | undefined;
            children: string;
        }

        const CodeBlock = React.memo(({ language, children }: CodeBlockProps) => {
            const [isCopied, setIsCopied] = useState(false);
            const { theme } = useTheme();

            const handleCopy = useCallback(async () => {
                await navigator.clipboard.writeText(children);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }, [children]);

            return (
                <div className="group my-3">
                    <div className="grid grid-rows-[auto,1fr] rounded-lg border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="px-2 py-0.5 text-xs font-medium bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 rounded-md border border-neutral-200 dark:border-neutral-700">
                                {language || 'text'}
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`
                                    px-2 py-1.5
                                    rounded-md text-xs
                                    transition-colors duration-200
                                    ${isCopied ? 'bg-green-500/10 text-green-500' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}
                                    opacity-0 group-hover:opacity-100
                                    hover:bg-neutral-200 dark:hover:bg-neutral-700
                                    flex items-center gap-1.5
                                `}
                                aria-label={isCopied ? 'Copied!' : 'Copy code'}
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className={`overflow-x-auto ${GeistMono.className}`}>
                            <SyntaxHighlighter
                                language={language || 'text'}
                                style={theme === 'dark' ? atomDark : vs}
                                showLineNumbers
                                wrapLines
                                customStyle={{
                                    margin: 0,
                                    padding: '1.5rem',
                                    fontSize: '0.875rem',
                                    background: theme === 'dark' ? '#171717' : '#ffffff',
                                    lineHeight: 1.6,
                                    borderBottomLeftRadius: '0.5rem',
                                    borderBottomRightRadius: '0.5rem',
                                }}
                                lineNumberStyle={{
                                    minWidth: '2.5em',
                                    paddingRight: '1em',
                                    color: theme === 'dark' ? '#404040' : '#94a3b8',
                                    userSelect: 'none',
                                }}
                                codeTagProps={{
                                    style: {
                                        color: theme === 'dark' ? '#e5e5e5' : '#1e293b',
                                        fontFamily: 'var(--font-mono)',
                                    }
                                }}
                            >
                                {children}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                </div>
            );
        }, (prevProps, nextProps) =>
            prevProps.children === nextProps.children &&
            prevProps.language === nextProps.language
        );

        CodeBlock.displayName = 'CodeBlock';

        const LinkPreview = ({ href }: { href: string }) => {
            const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
            const [isLoading, setIsLoading] = useState(false);

            React.useEffect(() => {
                setIsLoading(true);
                fetchMetadataWithCache(href).then((data) => {
                    setMetadata(data);
                    setIsLoading(false);
                });
            }, [href]);

            if (isLoading) {
                return (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-500 dark:text-neutral-400" />
                    </div>
                );
            }

            const domain = new URL(href).hostname;

            return (
                <div className="flex flex-col space-y-2 bg-white dark:bg-neutral-800 rounded-md shadow-md overflow-hidden">
                    <div className="flex items-center space-x-2 p-3 bg-neutral-100 dark:bg-neutral-700">
                        <Image
                            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=256`}
                            alt="Favicon"
                            width={20}
                            height={20}
                            className="rounded-sm"
                        />
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate">{domain}</span>
                    </div>
                    <div className="px-3 pb-3">
                        <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2">
                            {metadata?.title || "Untitled"}
                        </h3>
                        {metadata?.description && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                                {metadata.description}
                            </p>
                        )}
                    </div>
                </div>
            );
        };

        const renderHoverCard = (href: string, text: React.ReactNode, isCitation: boolean = false) => {
            return (
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <Link
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={isCitation ? "cursor-help text-sm text-primary py-0.5 px-1.5 m-0 bg-neutral-200 dark:bg-neutral-700 rounded-full no-underline" : "text-teal-600 dark:text-teal-400 no-underline hover:underline"}
                        >
                            {text}
                        </Link>
                    </HoverCardTrigger>
                    <HoverCardContent
                        side="top"
                        align="start"
                        className="w-80 p-0 shadow-lg"
                    >
                        <LinkPreview href={href} />
                    </HoverCardContent>
                </HoverCard>
            );
        };

        const renderer: Partial<ReactRenderer> = {
            text(text: string) {
                if (!text.includes('$')) return text;

                return (
                    <Latex
                        delimiters={[
                            { left: '$$', right: '$$', display: true },
                            { left: '$', right: '$', display: false }
                        ]}
                    >
                        {text}
                    </Latex>
                );
            },
            paragraph(children) {
                if (typeof children === 'string' && children.includes('$')) {
                    return (
                        <p className="my-4">
                            <Latex
                                delimiters={[
                                    { left: '$$', right: '$$', display: true },
                                    { left: '$', right: '$', display: false }
                                ]}
                            >
                                {children}
                            </Latex>
                        </p>
                    );
                }
                return <p className="my-4">{children}</p>;
            },
            code(children, language) {
                return <CodeBlock language={language}>{String(children)}</CodeBlock>;
            },
            link(href, text) {
                const citationIndex = citationLinks.findIndex(link => link.link === href);
                if (citationIndex !== -1) {
                    return (
                        <sup>
                            {renderHoverCard(href, citationIndex + 1, true)}
                        </sup>
                    );
                }
                return isValidUrl(href) ? renderHoverCard(href, text) : <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline">{text}</a>;
            },
            heading(children, level) {
                const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
                const className = `text-${4 - level}xl font-bold my-4 text-neutral-800 dark:text-neutral-100`;
                return <HeadingTag className={className}>{children}</HeadingTag>;
            },
            list(children, ordered) {
                const ListTag = ordered ? 'ol' : 'ul';
                return <ListTag className="list-inside list-disc my-4 pl-4 text-neutral-800 dark:text-neutral-200">{children}</ListTag>;
            },
            listItem(children) {
                return <li className="my-2 text-neutral-800 dark:text-neutral-200">{children}</li>;
            },
            blockquote(children) {
                return <blockquote className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 italic my-4 text-neutral-700 dark:text-neutral-300">{children}</blockquote>;
            },
        };

        return (
            <div className="markdown-body dark:text-neutral-200 font-sans">
                <Marked renderer={renderer}>{content}</Marked>
            </div>
        );
    };



    const lastUserMessageIndex = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                return i;
            }
        }
        return -1;
    }, [messages]);

    useEffect(() => {
        const handleScroll = () => {
            const userScrolled = window.innerHeight + window.scrollY < document.body.offsetHeight;
            if (!userScrolled && bottomRef.current && (messages.length > 0 || suggestedQuestions.length > 0)) {
                bottomRef.current.scrollIntoView({ behavior: "smooth" });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [messages, suggestedQuestions]);

    const handleExampleClick = async (card: TrendingQuery) => {
        const exampleText = card.text;
        // track("search example", { query: exampleText });
        lastSubmittedQueryRef.current = exampleText;
        setHasSubmitted(true);
        setSuggestedQuestions([]);
        await append({
            content: exampleText.trim(),
            role: 'user',
        });
    };

    const handleSuggestedQuestionClick = useCallback(async (question: string) => {
        setHasSubmitted(true);
        setSuggestedQuestions([]);

        await append({
            content: question.trim(),
            role: 'user'
        });
    }, [append]);

    const handleMessageEdit = useCallback((index: number) => {
        setIsEditingMessage(true);
        setEditingMessageIndex(index);
        setInput(messages[index].content);
    }, [messages, setInput]);

    const handleMessageUpdate = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim()) {
            const updatedMessages = [...messages];
            updatedMessages[editingMessageIndex] = { ...updatedMessages[editingMessageIndex], content: input.trim() };
            setMessages(updatedMessages);
            setIsEditingMessage(false);
            setEditingMessageIndex(-1);
            handleSubmit(e);
        } else {
            toast.error("Please enter a valid message.");
        }
    }, [input, messages, editingMessageIndex, setMessages, handleSubmit]);

    interface NavbarProps { }

    const Navbar: React.FC<NavbarProps> = () => {
        return (
            <div className="fixed top-0 left-0 right-0 z-[60] flex justify-between items-center p-4 bg-white dark:bg-neutral-950 font-sans">
                <Link href="/new">
                    <Button
                        type="button"
                        variant={'secondary'}
                        className="rounded-full bg-neutral-200 dark:bg-neutral-800 group transition-all hover:scale-105 pointer-events-auto"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-all" />
                        <span className="text-sm ml-2 group-hover:block hidden animate-in fade-in duration-300">
                            New
                        </span>
                    </Button>
                </Link>
                <div className='flex items-center space-x-4'>
                    <Link
                        target="_blank"
                        href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzaidmukaddam%2Fminiperplx&env=XAI_API_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,AVIATION_STACK_API_KEY,SANDBOX_TEMPLATE_ID,TMDB_API_KEY,NEXT_PUBLIC_POSTHOG_KEY,NEXT_PUBLIC_POSTHOG_HOST,YT_ENDPOINT,EXA_API_KEY,TRIPADVISOR_API_KEY,BLOB_READ_WRITE_TOKEN,ELEVENLABS_API_KEY,AZURE_TRANSLATOR_LOCATION,AZURE_TRANSLATOR_KEY,AZURE_RESOURCE_NAME,AZURE_API_KEY,MAPBOX_ACCESS_TOKEN,NEXT_PUBLIC_MAPBOX_TOKEN,FIRECRAWL_API_KEY,TAVILY_API_KEY,OPENWEATHER_API_KEY,E2B_API_KEY,GOOGLE_MAPS_API_KEY,NEXT_PUBLIC_GOOGLE_MAPS_API_KEY&envDescription=All%20environment%20variables%20needed%20for%20application"
                        className="flex flex-row gap-2 items-center py-1.5 px-2 rounded-md text-neutral-950 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-zinc-50 dark:hover:bg-neutral-800 dark:shadow-sm shadow-none text-sm"
                    >
                        <VercelIcon size={14} />
                        <span className='hidden sm:block'>Deploy with Vercel</span>
                        <span className='sm:hidden block'>Deploy</span>
                    </Link>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    onClick={() => window.open("https://github.com/sponsors/zaidmukaddam", "_blank")}
                                    className="flex items-center space-x-2 bg-red-100 dark:bg-red-900 shadow-none hover:bg-red-200 dark:hover:bg-red-800"
                                >
                                    <Heart className="h-4 w-4 text-red-500 dark:text-red-400" />
                                    <span className="text-red-800 dark:text-red-200">Sponsor</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                                <p>Sponsor this project on GitHub</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <ThemeToggle />
                </div>
            </div>
        );
    };

    const SuggestionCards: React.FC<{
        trendingQueries: TrendingQuery[];
    }> = ({ trendingQueries }) => {
        const [isLoading, setIsLoading] = useState(true);
        const scrollRef = useRef<HTMLDivElement>(null);
        const [isPaused, setIsPaused] = useState(false);
        const scrollIntervalRef = useRef<NodeJS.Timeout>();
        const [isTouchDevice, setIsTouchDevice] = useState(false);

        useEffect(() => {
            setIsLoading(false);
            setIsTouchDevice('ontouchstart' in window);
        }, [trendingQueries]);

        useEffect(() => {
            if (isTouchDevice) return; // Disable auto-scroll on touch devices

            const startScrolling = () => {
                if (!scrollRef.current || isPaused) return;
                scrollRef.current.scrollLeft += 1; // Reduced speed

                // Reset scroll when reaching end
                if (scrollRef.current.scrollLeft >=
                    (scrollRef.current.scrollWidth - scrollRef.current.clientWidth)) {
                    scrollRef.current.scrollLeft = 0;
                }
            };

            scrollIntervalRef.current = setInterval(startScrolling, 30);

            return () => {
                if (scrollIntervalRef.current) {
                    clearInterval(scrollIntervalRef.current);
                }
            };
        }, [isPaused, isTouchDevice]);

        if (isLoading || trendingQueries.length === 0) {
            return (
                <div className="relative mt-4 px-0">
                    {/* Overlay with Loading Text */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="backdrop-blur-sm bg-white/30 dark:bg-black/30 rounded-xl px-4 h-full py-3 shadow-lg">
                            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 h-full dark:text-neutral-300">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading trending queries</span>
                            </div>
                        </div>
                    </div>

                    {/* Background Cards */}
                    <div className="flex justify-between">
                        {[1, 2, 3].map((_, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-[140px] md:w-[220px] bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 animate-pulse"
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                    <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        const getIconForCategory = (category: string) => {
            const iconMap = {
                trending: <TrendingUp className="w-5 h-5" />,
                community: <Users className="w-5 h-5" />,
                science: <Brain className="w-5 h-5" />,
                tech: <Code className="w-5 h-5" />,
                travel: <Globe className="w-5 h-5" />,
                politics: <Flag className="w-5 h-5" />,
                health: <Heart className="w-5 h-5" />,
                sports: <TennisBall className="w-5 h-5" />,
                finance: <CurrencyDollar className="w-5 h-5" />,
                football: <SoccerBall className="w-5 h-5" />,
            };
            return iconMap[category as keyof typeof iconMap] || <Sparkles className="w-5 h-5" />;
        };

        return (
            <div className="relative">
                {/* Gradient Fades */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />

                <div
                    ref={scrollRef}
                    className="flex gap-4 mt-4 overflow-x-auto pb-4 px-4 md:px-0 relative scroll-smooth no-scrollbar"
                    onMouseEnter={() => !isTouchDevice && setIsPaused(true)}
                    onMouseLeave={() => !isTouchDevice && setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {Array(20).fill(trendingQueries).flat().map((query, index) => (
                        <button
                            key={`${index}-${query.text}`}
                            onClick={() => handleExampleClick(query)}
                            className="group flex-shrink-0 bg-neutral-50/50 dark:bg-neutral-800/50
                                   backdrop-blur-sm rounded-xl p-3.5 text-left
                                   hover:bg-neutral-100 dark:hover:bg-neutral-700/70
                                   transition-all duration-200 ease-out
                                   hover:scale-102 origin-center
                                   h-[52px] min-w-fit
                                   hover:shadow-lg
                                   border border-neutral-200/50 dark:border-neutral-700/50
                                   hover:border-neutral-300 dark:hover:border-neutral-600"
                        >

                            <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                                <span
                                    className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                                >
                                    {getIconForCategory(query.category)}
                                </span>
                                <span
                                    className="text-sm font-medium truncate max-w-[180px] group-hover:text-neutral-900 dark:group-hover:text-neutral-100"
                                >
                                    {query.text}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const handleModelChange = useCallback((newModel: string) => {
        setSelectedModel(newModel);
        setSuggestedQuestions([]);
        reload({ body: { model: newModel } });
    }, [reload]);

    const resetSuggestedQuestions = useCallback(() => {
        setSuggestedQuestions([]);
    }, []);


    const memoizedMessages = useMemo(() => messages, [messages]);

    const memoizedSuggestionCards = useMemo(() => (
        <SuggestionCards
            trendingQueries={trendingQueries}
        />
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [trendingQueries]);

    return (
        <div className="flex flex-col !font-sans items-center justify-center p-2 sm:p-4 bg-background text-foreground transition-all duration-500">
            <Navbar />

            <div className={`w-full max-w-[90%] !font-sans sm:max-w-2xl space-y-6 p-0 ${hasSubmitted ? 'mt-16 sm:mt-20' : 'mt-[20vh] sm:mt-[25vh]'}`}>
                {!hasSubmitted && (
                    <div className="text-center !font-sans">
                        <Badge
                            onClick={() => setOpenChangelog(true)}
                            className="cursor-pointer gap-1 mb-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            variant="secondary"
                        >
                            <Flame size={14} /> What&apos;s new
                        </Badge>
                        <h1 className="text-4xl sm:text-6xl mb-3 text-neutral-800 dark:text-neutral-100 font-serif">MiniPerplx</h1>
                        <div className="flex flex-row items-center gap-1 justify-center text-center mx-auto !p-0 !m-0">
                            <span className="text-base text-neutral-500 dark:text-neutral-400">
                                Powered by
                            </span>
                            <div className="flex flex-wrap gap-1 items-center justify-center">
                                <a
                                    href="https://vercel.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="no-underline"
                                >
                                    <Badge
                                        variant="secondary"
                                        className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors shadow-none"
                                    >
                                        <VercelIcon size={10} />
                                        <span className="ml-2 text-sm">Vercel</span>
                                    </Badge>
                                </a>
                                {/* span with a + */}
                                <span className="text-neutral-500 dark:text-neutral-400">+</span>
                                <a
                                    href="https://x.ai/api"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="no-underline"
                                >
                                    <Badge
                                        variant="secondary"
                                        className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors rounded-full shadow-none"
                                    >
                                        <XAIIcon size={12} />
                                        <span className="ml-2 text-sm">xAI Grok</span>
                                    </Badge>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {!hasSubmitted && (
                        <motion.div
                            initial={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <FormComponent
                                input={input}
                                setInput={setInput}
                                attachments={attachments}
                                setAttachments={setAttachments}
                                hasSubmitted={hasSubmitted}
                                setHasSubmitted={setHasSubmitted}
                                isLoading={isLoading}
                                handleSubmit={handleSubmit}
                                fileInputRef={fileInputRef}
                                inputRef={inputRef}
                                stop={stop}
                                messages={memoizedMessages}
                                append={append}
                                selectedModel={selectedModel}
                                setSelectedModel={handleModelChange}
                                resetSuggestedQuestions={resetSuggestedQuestions}
                                lastSubmittedQueryRef={lastSubmittedQueryRef}
                                selectedGroup={selectedGroup}
                                setSelectedGroup={setSelectedGroup}
                            />
                            {memoizedSuggestionCards}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-4 sm:space-y-6 mb-32">
                    {memoizedMessages.map((message, index) => (
                        <div key={index}>
                            {message.role === 'user' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex items-start space-x-2 mb-4"
                                >
                                    <User2 className="size-5 text-primary flex-shrink-0 mt-1" />
                                    <div className="flex-grow min-w-0">
                                        {isEditingMessage && editingMessageIndex === index ? (
                                            <form onSubmit={handleMessageUpdate} className="flex items-center space-x-2">
                                                <Input
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    className="flex-grow bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                                                />
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditingMessage(false)
                                                        setEditingMessageIndex(-1)
                                                        setInput('')
                                                    }}
                                                    disabled={isLoading}
                                                    className="bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                                                >
                                                    <X size={16} />
                                                </Button>
                                                <Button type="submit" size="sm" className="bg-primary text-white">
                                                    <ArrowRight size={16} />
                                                </Button>
                                            </form>
                                        ) : (
                                            <div>
                                                <p className="text-xl font-medium font-sans break-words text-neutral-800 dark:text-neutral-200">
                                                    {message.content}
                                                </p>
                                                <div className='flex flex-row gap-2'>
                                                    {message.experimental_attachments?.map((attachment, attachmentIndex) => (
                                                        <div key={attachmentIndex} className="mt-2">
                                                            {attachment.contentType!.startsWith('image/') && (
                                                                <img
                                                                    src={attachment.url}
                                                                    alt={attachment.name || `Attachment ${attachmentIndex + 1}`}
                                                                    className="max-w-full h-32 object-fill rounded-lg"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {!isEditingMessage && index === lastUserMessageIndex && (
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMessageEdit(index)}
                                                className="ml-2 text-neutral-500 dark:text-neutral-400"
                                                disabled={isLoading}
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                            {message.role === 'assistant' && message.content !== null && !message.toolInvocations && (
                                <div>
                                    <div className='flex items-center justify-between mb-2'>
                                        <div className='flex items-center gap-2'>
                                            <Sparkles className="size-5 text-primary" />
                                            <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">Answer</h2>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <CopyButton text={message.content} />
                                        </div>
                                    </div>
                                    <div>
                                        <MarkdownRenderer content={message.content} />
                                    </div>
                                </div>
                            )}
                            {message.toolInvocations?.map((toolInvocation: ToolInvocation, toolIndex: number) => (
                                <div key={`tool-${toolIndex}`}>
                                    {renderToolInvocation(toolInvocation, toolIndex)}
                                </div>
                            ))}
                        </div>
                    ))}

                    {suggestedQuestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-xl sm:max-w-2xl"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <AlignLeft className="w-5 h-5 text-primary" />
                                <h2 className="font-semibold text-base text-neutral-800 dark:text-neutral-200">Suggested questions</h2>
                            </div>
                            <div className="space-y-2 flex flex-col">
                                {suggestedQuestions.map((question, index) => (
                                    <Button
                                        key={index}
                                        variant="ghost"
                                        className="w-fit font-medium rounded-2xl p-1 justify-start text-left h-auto py-2 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 whitespace-normal"
                                        onClick={() => handleSuggestedQuestionClick(question)}
                                    >
                                        {question}
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
                <div ref={bottomRef} />
            </div>

            <AnimatePresence>
                {hasSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="fixed bottom-4 w-full max-w-[90%] sm:max-w-2xl"
                    >
                        <FormComponent
                            input={input}
                            setInput={setInput}
                            attachments={attachments}
                            setAttachments={setAttachments}
                            hasSubmitted={hasSubmitted}
                            setHasSubmitted={setHasSubmitted}
                            isLoading={isLoading}
                            handleSubmit={handleSubmit}
                            fileInputRef={fileInputRef}
                            inputRef={inputRef}
                            stop={stop}
                            messages={messages}
                            append={append}
                            selectedModel={selectedModel}
                            setSelectedModel={handleModelChange}
                            resetSuggestedQuestions={resetSuggestedQuestions}
                            lastSubmittedQueryRef={lastSubmittedQueryRef}
                            selectedGroup={selectedGroup}
                            setSelectedGroup={setSelectedGroup}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {!hasSubmitted && (
                <TooltipProvider>
                    <motion.footer
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-row justify-between items-center w-full max-w-2xl bottom-3 fixed p-4 sm:p-auto"
                    >
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            © {new Date().getFullYear()} MiniPerplx
                        </div>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger>
                                <a
                                    href="https://x.com/zaidmukaddam"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-neutral-600 dark:text-neutral-400"
                                >
                                    @zaidmukaddam
                                </a>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                sideOffset={5}
                                className="bg-neutral-800 dark:bg-neutral-900 text-neutral-100 px-3 py-2 text-xs font-medium rounded-xl shadow-lg border border-neutral-700/50"
                            >
                                <p className="flex items-center gap-1.5">
                                    <span className='flex gap-1'>Follow me on <XLogo className='size-4' /></span>
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </motion.footer>
                </TooltipProvider>
            )}
            <ChangeLogs open={openChangelog} setOpen={setOpenChangelog} />
        </div>
    );
}

const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-900 dark:to-black">
        <div className="backdrop-blur-xl bg-white/30 dark:bg-neutral-900/30 p-8 rounded-2xl border border-neutral-200/20 dark:border-neutral-700/20 shadow-xl">
            <div className="text-center space-y-6">
                <h1 className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400">
                    MiniPerplx
                </h1>
                <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
                    Loading your minimalist AI experience
                    <span className="animate-pulse">...</span>
                </p>
                <div className="relative">
                    <div className="h-1 w-32 mx-auto bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/2 animate-[loader_1s_ease-in-out_infinite] rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Home = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <HomeContent />
            <InstallPrompt />
        </Suspense>
    );
};

export default Home;