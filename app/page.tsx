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
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import WeatherChart from '@/components/weather-chart';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn, SearchGroupId } from '@/lib/utils';
import { Wave } from "@foobar404/wave";
import { CheckCircle, CurrencyDollar, Flag, GithubLogo, Info, RoadHorizon, SoccerBall, TennisBall, XLogo } from '@phosphor-icons/react';
import { TextIcon } from '@radix-ui/react-icons';
import { ToolInvocation } from 'ai';
import { useChat } from 'ai/react';
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
    Cloud,
    Code,
    Copy,
    Download,
    Edit2,
    ExternalLink,
    FileText,
    Film,
    Globe,
    GraduationCap,
    Heart,
    Loader2,
    LucideIcon,
    MapPin,
    Moon,
    Pause,
    Plane,
    Play,
    Plus,
    Search,
    Share2,
    Sparkles,
    Sun,
    TrendingUp,
    TrendingUpIcon,
    Tv,
    User2,
    Users,
    X,
    YoutubeIcon,
    Zap
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
import InteractiveStockChart from '@/components/interactive-stock-chart';
import { CurrencyConverter } from '@/components/currency_conv';

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

const SearchLoadingState = ({
    icon: Icon,
    text,
    color
}: {
    icon: LucideIcon,
    text: string,
    color: "red" | "green" | "orange" | "violet" | "gray" | "blue"
}) => {
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

interface YouTubeCardProps {
    video: VideoResult;
    index: number;
}

const PeerlistLogo = () => {
    return (
        <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-current"
        >
            <path
                d="M8.87026 3H15.1297C18.187 3 20.7554 5.29881 21.093 8.33741L21.3037 10.2331C21.4342 11.4074 21.4342 12.5926 21.3037 13.7669L21.093 15.6626C20.7554 18.7012 18.187 21 15.1297 21H8.87026C5.81296 21 3.24458 18.7012 2.90695 15.6626L2.69632 13.7669C2.56584 12.5926 2.56584 11.4074 2.69632 10.2331L2.90695 8.33741C3.24458 5.29881 5.81296 3 8.87026 3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9 17L9 13M9 13L9 7L13 7C14.6569 7 16 8.34315 16 10V10C16 11.6569 14.6569 13 13 13L9 13Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

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

const TooltipButton = ({ href, tooltip, children }: {
    href: string;
    tooltip: string;
    children: React.ReactNode;
}) => {
    return (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-neutral-600 dark:text-neutral-400"
                >
                    {children}
                </Link>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                className="bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-800"
            >
                {tooltip}
            </TooltipContent>
        </Tooltip>
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

const IconMapping: Record<string, LucideIcon> = {
    stock: TrendingUp,
    default: Code,
    date: Calendar,
    calculation: Calculator,
    output: FileText
};

interface CollapsibleSectionProps {
    code: string;
    output?: string;
    language?: string;
    title?: string;
    icon?: string;
    status?: 'running' | 'completed';
}

function CollapsibleSection({
    code,
    output,
    language = "plaintext",
    title,
    icon,
    status,
}: CollapsibleSectionProps) {
    const [copied, setCopied] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'code' | 'output'>('code');
    const { theme } = useTheme();
    const IconComponent = icon ? IconMapping[icon] : null;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const textToCopy = activeTab === 'code' ? code : output;
        await navigator.clipboard.writeText(textToCopy || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-all duration-200 hover:shadow-sm">
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white dark:bg-neutral-900 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    {IconComponent && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                    )}
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {title}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {status && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                "w-fit flex items-center gap-1.5 px-1.5 py-0.5 text-xs",
                                status === 'running'
                                    ? "bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "bg-green-50/50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                            )}
                        >
                            {status === 'running' ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <CheckCircle className="h-3 w-3" />
                            )}
                            {status === 'running' ? "Running" : "Done"}
                        </Badge>
                    )}
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            !isExpanded && "-rotate-90"
                        )}
                    />
                </div>
            </div>

            {isExpanded && (
                <div>
                    <div className="flex border-b border-neutral-200 dark:border-neutral-800">
                        <button
                            className={cn(
                                "px-4 py-2 text-sm font-medium transition-colors",
                                activeTab === 'code'
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-neutral-600 dark:text-neutral-400"
                            )}
                            onClick={() => setActiveTab('code')}
                        >
                            Code
                        </button>
                        {output && (
                            <button
                                className={cn(
                                    "px-4 py-2 text-sm font-medium transition-colors",
                                    activeTab === 'output'
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-neutral-600 dark:text-neutral-400"
                                )}
                                onClick={() => setActiveTab('output')}
                            >
                                Output
                            </button>
                        )}
                        <div className="ml-auto pr-2 flex items-center">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className={cn(
                        "text-sm",
                        theme === "dark" ? "bg-[rgb(40,44,52)]" : "bg-[rgb(250,250,250)]"
                    )}>
                        <SyntaxHighlighter
                            language={activeTab === 'code' ? language : 'plaintext'}
                            style={theme === "dark" ? oneDark : oneLight}
                            showLineNumbers
                            customStyle={{
                                margin: 0,
                                padding: "1rem",
                                fontSize: "0.813rem",
                                background: "transparent",
                            }}
                        >
                            {activeTab === 'code' ? code : output || ''}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )}
        </div>
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

                {(video.timestamps && video.timestamps?.length > 0 || video.captions) && (
                    <div className="space-y-3">
                        <Separator />

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

const HomeContent = () => {
    const [query] = useQueryState('query', parseAsString.withDefault(''))
    const [q] = useQueryState('q', parseAsString.withDefault(''))
    const [model] = useQueryState('model', parseAsString.withDefault('grok-2-1212'))


    const initialState = useMemo(() => ({
        query: query || q,
        model: model
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

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

    const CACHE_KEY = 'trendingQueriesCache';
    const CACHE_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

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
            const cached = getTrendingQueriesFromCache();
            if (cached) {
                setTrendingQueries(cached.data);
                return;
            }

            try {
                const res = await fetch('/api/trending');
                if (!res.ok) throw new Error('Failed to fetch trending queries');
                const data = await res.json();

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
## **Scira x Vercel x xAI Collab**

Excited to annouce that Scira has partnered with Vercel and xAI to bring you the best of AI search experience.
Grok 2 models are now available for you to try out.
`
        }
    ];


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

    const renderToolInvocation = useCallback(
        (toolInvocation: ToolInvocation, index: number) => {
            const args = JSON.parse(JSON.stringify(toolInvocation.args));
            const result = 'result' in toolInvocation ? JSON.parse(JSON.stringify(toolInvocation.result)) : null;

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

                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-black pointer-events-none" />

                            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center pb-4 pt-20 bg-gradient-to-t from-white dark:from-black to-transparent">
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
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="h-full relative backdrop-blur-sm bg-background/95 dark:bg-neutral-900/95 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl p-4 flex flex-col transition-all duration-500 group-hover:border-violet-500/20">
                                                <h3 className="font-semibold text-xl tracking-tight mb-3 line-clamp-2 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-300">
                                                    {paper.title}
                                                </h3>

                                                {paper.author && (
                                                    <div className="mb-3">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 rounded-md">
                                                            <User2 className="h-3.5 w-3.5 text-violet-500" />
                                                            <span className="line-clamp-1">
                                                                {paper.author.split(';')
                                                                    .slice(0, 2)
                                                                    .join(', ') +
                                                                    (paper.author.split(';').length > 2 ? ' et al.' : '')
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {paper.publishedDate && (
                                                    <div className="mb-4">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 rounded-md">
                                                            <Calendar className="h-3.5 w-3.5 text-violet-500" />
                                                            {new Date(paper.publishedDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex-1 relative mb-4 pl-3">
                                                    <div className="absolute -left-0 top-1 bottom-1 w-[2px] rounded-full bg-gradient-to-b from-violet-500 via-violet-400 to-transparent opacity-50" />
                                                    <p className="text-sm text-muted-foreground line-clamp-4">
                                                        {paper.summary}
                                                    </p>
                                                </div>

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

            if (toolInvocation.toolName === 'currency_converter') {
                return <CurrencyConverter toolInvocation={toolInvocation} result={result} />;
            }

            if (toolInvocation.toolName === 'stock_chart') {
                return (
                    <div className="flex flex-col gap-3 w-full mt-4">
                        <Badge
                            variant="secondary"
                            className={cn(
                                "w-fit flex items-center gap-3 px-4 py-2 rounded-full transition-colors duration-200",
                                !result
                                    ? "bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "bg-green-50/50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                            )}>
                            <TrendingUpIcon className="h-4 w-4" />
                            <span className="font-medium">{args.title}</span>
                            {!result ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                        </Badge>

                        {result?.chart && (
                            <div className="w-full">
                                <InteractiveStockChart
                                    title={args.title}
                                    chart={{
                                        ...result.chart,
                                        x_scale: 'datetime'
                                    }}
                                    data={result.chart.elements}
                                />
                            </div>
                        )}
                    </div>
                );
            }

            if (toolInvocation.toolName === "code_interpreter") {
                return (
                    <div className="space-y-6">
                        <CollapsibleSection
                            code={args.code}
                            output={result?.message}
                            language="python"
                            title={args.title}
                            icon={args.icon || 'default'}
                            status={result ? 'completed' : 'running'}
                        />

                        {result?.chart && (
                            <div className="pt-1">
                                <InteractiveChart chart={result.chart} />
                            </div>
                        )}
                    </div>
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
        []
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
            return Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map(([_, text, link]) => ({ text, link }));
        }, [content]);

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
                return isValidUrl(href)
                    ? renderHoverCard(href, text)
                    : <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline">{text}</a>;
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

    const AboutContent = () => {
        return (
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 p-1">
                <section className="space-y-4 font-syne">
                    <h2 className="text-2xl font-medium mt-2">Welcome to Scira</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Scira (Formerly MiniPerplx) is an minimalistic AI-powered search engine that combines multiple data sources to provide comprehensive answers. The name &lsquo;Scira&rsquo; is derived from the Latin word &lsquo;scire&rsquo;, meaning &lsquo;to know&rsquo; - reflecting our mission to make knowledge accessible and intuitive.
                    </p>
                    <div className="flex flex-row items-center gap-2 h-8">
                        <Link
                            href="https://git.new/scira"
                            className="inline-flex h-8 items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors no-underline"
                        >
                            <GithubLogo className="h-3.5 w-3.5" />
                            <span className="font-medium">View on GitHub</span>
                        </Link>
                        <Link
                            href="https://x.com/sciraai"
                            className="inline-flex h-8 items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors no-underline"
                        >
                            <XLogo className="h-3.5 w-3.5" />
                            <span className="font-medium">Follow on X</span>
                        </Link>
                        <a
                            href="https://www.producthunt.com/posts/scira?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-scira"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:opacity-90 transition-opacity"
                        >
                            <img
                                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=776449&theme=light&t=1736847508935"
                                alt="Scira - A minimalistic open-source AI-powered search engine | Product Hunt"
                                className="h-8"
                            />
                        </a>
                    </div>
                </section>

                <Separator className="bg-neutral-200 dark:bg-neutral-800" />

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold">Core Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { icon: Search, text: "Multi-source search integration" },
                            { icon: Zap, text: "Real-time data processing" },
                            { icon: GraduationCap, text: "Academic paper analysis" },
                            { icon: Share2, text: "Social media insights" },
                            { icon: Cloud, text: "Weather and location services" },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                            >
                                <feature.icon className="h-5 w-5 text-primary" />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <Separator className="bg-neutral-200 dark:bg-neutral-800" />

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold">Technology</h3>
                    <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-primary">→</span>
                            Built with Next.js, Vercel AI SDK, and Powered by xAI&apos;s Grok 2.0
                        </div>
                    </div>
                </section>
            </div>
        );
    };
    const AboutButton = () => {
        const [isOpen, setIsOpen] = useState(false);
        const isDesktop = useMediaQuery("(min-width: 768px)");

        if (isDesktop) {
            return (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full w-8 h-8 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                        >
                            <Info className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[725px] z-[100] max-h-[80vh] overflow-y-auto">
                        <AboutContent />
                    </DialogContent>
                </Dialog>
            );
        }

        return (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-8 h-8 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                    >
                        <Info className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="z-[100]">
                    <div className="px-4 my-0 h-[75vh] overflow-y-auto">
                        <AboutContent />
                    </div>
                    <DrawerFooter className="pt-2 border-t">
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    };

    interface NavbarProps { }

    const Navbar: React.FC<NavbarProps> = () => {
        return (
            <div className="fixed top-0 left-0 right-0 z-[60] flex justify-between items-center p-4 bg-white/90 dark:bg-neutral-950/90 font-sans">
                <div className="flex items-center gap-4">
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
                </div>
                <div className='flex items-center space-x-4'>
                    <Link
                        target="_blank"
                        href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzaidmukaddam%2Fscira&env=XAI_API_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,AVIATION_STACK_API_KEY,SANDBOX_TEMPLATE_ID,TMDB_API_KEY,NEXT_PUBLIC_POSTHOG_KEY,NEXT_PUBLIC_POSTHOG_HOST,YT_ENDPOINT,EXA_API_KEY,TRIPADVISOR_API_KEY,BLOB_READ_WRITE_TOKEN,ELEVENLABS_API_KEY,AZURE_TRANSLATOR_LOCATION,AZURE_TRANSLATOR_KEY,AZURE_RESOURCE_NAME,AZURE_API_KEY,MAPBOX_ACCESS_TOKEN,NEXT_PUBLIC_MAPBOX_TOKEN,FIRECRAWL_API_KEY,TAVILY_API_KEY,OPENWEATHER_API_KEY,E2B_API_KEY,GOOGLE_MAPS_API_KEY,NEXT_PUBLIC_GOOGLE_MAPS_API_KEY&envDescription=All%20environment%20variables%20needed%20for%20application"
                        className="flex flex-row gap-2 items-center py-1.5 px-2 rounded-md text-neutral-950 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-zinc-50 dark:hover:bg-neutral-800 dark:shadow-sm shadow-none text-sm"
                    >
                        <VercelIcon size={14} />
                        <span className='hidden sm:block'>Deploy with Vercel</span>
                        <span className='sm:hidden block'>Deploy</span>
                    </Link>
                    <AboutButton />
                    <ThemeToggle />
                </div>
            </div>
        );
    };

    const SuggestionCards: React.FC<{
        trendingQueries: TrendingQuery[];
        handleExampleClick: (query: TrendingQuery) => void;
    }> = ({ trendingQueries, handleExampleClick }) => {
        const [isLoading, setIsLoading] = useState(true);
        const scrollRef = useRef<HTMLDivElement>(null);
        const [isPaused, setIsPaused] = useState(false);
        const animationFrameRef = useRef<number>();
        const lastScrollTime = useRef<number>(0);

        useEffect(() => {
            if (trendingQueries.length > 0) {
                setIsLoading(false);
            }
        }, [trendingQueries]);

        useEffect(() => {
            const animate = (timestamp: number) => {
                if (!scrollRef.current || isPaused) {
                    animationFrameRef.current = requestAnimationFrame(animate);
                    return;
                }

                if (timestamp - lastScrollTime.current > 16) {
                    const newScrollLeft = scrollRef.current.scrollLeft + 1;

                    if (newScrollLeft >= scrollRef.current.scrollWidth - scrollRef.current.clientWidth) {
                        scrollRef.current.scrollLeft = 0;
                    } else {
                        scrollRef.current.scrollLeft = newScrollLeft;
                    }

                    lastScrollTime.current = timestamp;
                }

                animationFrameRef.current = requestAnimationFrame(animate);
            };

            animationFrameRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [isPaused]);

        const getIconForCategory = (category: string) => {
            const iconMap = {
                trending: <TrendingUp className="w-3 h-3" />,
                community: <Users className="w-3 h-3" />,
                science: <Brain className="w-3 h-3" />,
                tech: <Code className="w-3 h-3" />,
                travel: <Globe className="w-3 h-3" />,
                politics: <Flag className="w-3 h-3" />,
                health: <Heart className="w-3 h-3" />,
                sports: <TennisBall className="w-3 h-3" />,
                finance: <CurrencyDollar className="w-3 h-3" />,
                football: <SoccerBall className="w-3 h-3" />,
            };
            return iconMap[category as keyof typeof iconMap] || <Sparkles className="w-3 h-3" />;
        };

        if (isLoading || trendingQueries.length === 0) {
            return (
                <div className="mt-4 relative">
                    <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

                        <div className="flex gap-2 overflow-x-auto pb-2 px-2 scroll-smooth no-scrollbar">
                            {[1, 2, 3, 4, 5, 6].map((_, index) => (
                                <div
                                    key={index}
                                    className="flex-shrink-0 h-12 w-[120px] rounded-lg bg-neutral-50/80 dark:bg-neutral-800/80 
                                                     border border-neutral-200/50 dark:border-neutral-700/50"
                                >
                                    <div className="flex items-start gap-1.5 h-full p-2">
                                        <div className="w-4 h-4 rounded-md bg-neutral-200/50 dark:bg-neutral-700/50 
                                                              animate-pulse mt-0.5" />
                                        <div className="space-y-1 flex-1">
                                            <div className="h-2.5 bg-neutral-200/50 dark:bg-neutral-700/50 rounded animate-pulse" />
                                            <div className="h-2 w-1/2 bg-neutral-200/50 dark:bg-neutral-700/50 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 relative"
            >
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

                    <div
                        ref={scrollRef}
                        className="flex gap-2 overflow-x-auto pb-2 px-2 scroll-smooth no-scrollbar"
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => setIsPaused(false)}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {Array(20).fill(trendingQueries).flat().map((query, index) => (
                            <motion.button
                                key={`${index}-${query.text}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => handleExampleClick(query)}
                                className="group flex-shrink-0 w-[120px] h-12 bg-neutral-50/80 dark:bg-neutral-800/80
                                         backdrop-blur-sm rounded-lg
                                         hover:bg-white dark:hover:bg-neutral-700/70
                                         transition-colors duration-200
                                         border border-neutral-200/50 dark:border-neutral-700/50"
                            >
                                <div className="flex items-start gap-1.5 h-full p-2">
                                    <div className="w-5 h-5 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center mt-0.5">
                                        {getIconForCategory(query.category)}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="text-xs font-medium truncate leading-tight">{query.text}</p>
                                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize">
                                            {query.category}
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>
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
            handleExampleClick={handleExampleClick}
        />
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [trendingQueries]);

    return (
        <div className="flex flex-col !font-sans items-center absolute inset-0 bg-background text-foreground transition-all duration-500">
            <Navbar />

            <div className={`w-full p-2 sm:p-4 ${hasSubmitted
                ? 'mt-20 sm:mt-16'
                : 'flex-1 flex items-center justify-center'
                }`}>
                <div className={`w-full max-w-[90%] !font-sans sm:max-w-2xl space-y-6 p-0 mx-auto transition-all duration-300`}>
                    {!hasSubmitted && (
                        <div className="text-center !font-sans">
                            <h1 className="text-2xl sm:text-4xl mb-6 text-neutral-800 dark:text-neutral-100 font-syne">
                                What do you want to search?
                            </h1>
                        </div>
                    )}
                    <AnimatePresence>
                        {!hasSubmitted && (
                            <motion.div
                                initial={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.5 }}
                                className='!mt-4'
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
                                                    <p className="text-base sm:text-xl font-medium font-sans break-words text-neutral-800 dark:text-neutral-200">
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
                            className="fixed bottom-4 left-0 right-0 w-full max-w-[90%] sm:max-w-2xl mx-auto"
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
                    <footer
                        className="flex flex-row justify-between items-center bottom-3 w-full fixed p-4 sm:p-auto"
                    >
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            © {new Date().getFullYear()} All rights reserved.
                        </div>
                        <TooltipProvider>
                            <div className="flex items-center gap-4">
                                <TooltipButton
                                    href="https://peerlist.io/zaidmukaddam"
                                    tooltip="Follow on Peerlist"
                                >
                                    <PeerlistLogo />
                                </TooltipButton>
                                <TooltipButton
                                    href="https://x.com/zaidmukaddam"
                                    tooltip="Follow on X"
                                >
                                    <XLogo className='size-5' />
                                </TooltipButton>
                            </div>
                        </TooltipProvider>
                    </footer>
                )}
            </div>
        </div>
    );
}

const LoadingFallback = () => (
    <div className="flex items-center justify-center absolute inset-0 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="flex flex-col items-center gap-6 p-8">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-neutral-200 dark:border-neutral-800" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">
                Loading...
            </p>
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