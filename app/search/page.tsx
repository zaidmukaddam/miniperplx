/* eslint-disable @next/next/no-img-element */
"use client";
import 'katex/dist/katex.min.css';

import
React,
{
    useRef,
    useCallback,
    useState,
    useEffect,
    useMemo,
    Suspense
} from 'react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from 'next-themes';
import Marked, { ReactRenderer } from 'marked-react';
import { track } from '@vercel/analytics';
import { useSearchParams } from 'next/navigation';
import { useChat } from 'ai/react';
import { ToolInvocation } from 'ai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    fetchMetadata,
    generateSpeech,
    suggestQuestions
} from '../actions';
import { Wave } from "@foobar404/wave";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    SearchIcon,
    Sparkles,
    ArrowRight,
    Globe,
    AlignLeft,
    Newspaper,
    Copy,
    Cloud,
    Code,
    Check,
    Loader2,
    User2,
    Heart,
    X,
    MapPin,
    Plus,
    Download,
    Flame,
    Sun,
    Terminal,
    Pause,
    Play,
    TrendingUpIcon,
    Calendar,
    Calculator,
    ImageIcon,
    ChevronDown,
    Edit2,
    ChevronUp,
    Moon
} from 'lucide-react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { GitHubLogoIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import Autoplay from 'embla-carousel-autoplay';
import FormComponent from '@/components/ui/form-component';
import WeatherChart from '@/components/weather-chart';
import InteractiveChart from '@/components/interactive-charts';
import NearbySearchMapView from '@/components/nearby-search-map-view';
import { MapComponent, MapContainer, MapSkeleton } from '@/components/map-components';

export const maxDuration = 60;

interface Attachment {
    name: string;
    contentType: string;
    url: string;
    size: number;
}

interface SearchImage {
    url: string;
    description: string;
}

const ImageCarousel = ({ images, onClose }: { images: SearchImage[], onClose: () => void }) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 bg-white dark:bg-neutral-900">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
                >
                    <X className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
                    <span className="sr-only">Close</span>
                </button>
                <Carousel className="w-full h-full">
                    <CarouselContent>
                        {images.map((image, index) => (
                            <CarouselItem key={index} className="flex flex-col items-center justify-center p-4">
                                <img
                                    src={image.url}
                                    alt={image.description}
                                    className="max-w-full max-h-[70vh] object-contain mb-4"
                                />
                                <p className="text-center text-sm text-neutral-800 dark:text-neutral-200">{image.description}</p>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                </Carousel>
            </DialogContent>
        </Dialog>
    );
};


const WebSearchResults = ({ result, args }: { result: any, args: any }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <div>
            <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className="hover:no-underline py-2">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Newspaper className="h-5 w-5 text-primary" />
                                <h2 className='text-base font-semibold text-neutral-800 dark:text-neutral-200'>Sources Found</h2>
                            </div>
                            {result && (
                                <Badge variant="secondary" className='rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'>{result.results.length} results</Badge>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {args?.query && (
                            <Badge variant="secondary" className="mb-4 text-xs sm:text-sm font-light rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                                <SearchIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                {args.query}
                            </Badge>
                        )}
                        {result && (
                            <div className="flex flex-row gap-4 overflow-x-auto pb-2">
                                {result.results.map((item: any, itemIndex: number) => (
                                    <div key={itemIndex} className="flex flex-col w-[280px] flex-shrink-0 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
                                        <div className="flex items-start gap-3 mb-2">
                                            <img
                                                src={`https://www.google.com/s2/favicons?sz=128&domain=${new URL(item.url).hostname}`}
                                                alt="Favicon"
                                                className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 rounded-sm"
                                            />
                                            <div className="flex-grow min-w-0">
                                                <h3 className="text-sm font-semibold line-clamp-2 text-neutral-800 dark:text-neutral-200">{item.title}</h3>
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1">{item.content}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary truncate hover:underline"
                                        >
                                            {item.url}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            {result && result.images && result.images.length > 0 && (
                <div className="mt-4">
                    <div className='flex items-center gap-2 cursor-pointer mb-2'>
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">Images</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {result.images.slice(0, 4).map((image: SearchImage, itemIndex: number) => (
                            <div
                                key={itemIndex}
                                className="relative aspect-square cursor-pointer overflow-hidden rounded-md"
                                onClick={() => handleImageClick(itemIndex)}
                            >
                                <img
                                    src={image.url}
                                    alt={image.description}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                />
                                {itemIndex === 3 && result.images.length > 4 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                        <PlusCircledIcon className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {openDialog && result.images && (
                <ImageCarousel
                    images={result.images}
                    onClose={handleCloseDialog}
                />
            )}
        </div>
    );
};

const HomeContent = () => {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('query') || '';
    const initialModel = searchParams.get('model') || 'azure:gpt4o-mini';

    const lastSubmittedQueryRef = useRef(initialQuery);
    const [hasSubmitted, setHasSubmitted] = useState(!!initialQuery);
    const [selectedModel, setSelectedModel] = useState(initialModel);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [isEditingMessage, setIsEditingMessage] = useState(false);
    const [editingMessageIndex, setEditingMessageIndex] = useState(-1);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const { theme } = useTheme();

    const [openChangelog, setOpenChangelog] = useState(false);

    const { isLoading, input, messages, setInput, handleInputChange, append, handleSubmit, setMessages, reload, stop } = useChat({
        maxSteps: 10,
        body: {
            model: selectedModel,
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
                description: "We must have ran out of credits. Sponsor us on GitHub to keep this service running.",
                action: {
                    label: "Sponsor",
                    onClick: () => window.open("https://git.new/mplx", "_blank"),
                },
            });
        },
    });

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
            title: "Dark mode is here!",
            images: [
                "https://metwm7frkvew6tn1.public.blob.vercel-storage.com/mplx-changelogs/mplx-dark-mode-promo.png",
                "https://metwm7frkvew6tn1.public.blob.vercel-storage.com/mplx-changelogs/mplx-new-input-bar-promo.png",
                "https://metwm7frkvew6tn1.public.blob.vercel-storage.com/mplx-changelogs/mplx-gpt-4o-back-Lwzx44RD4XofYLAmrEsLD3Fngnn33K.png"
            ],
            content:
                `## **Dark Mode**

The most requested feature is finally here! You can now toggle between light and dark mode. Default is set to your system preference.

## **New Input Bar Design**

The input bar has been redesigned to make it more focused, user-friendly and accessible. The model selection dropdown has been moved to the bottom left corner inside the input bar.

## **GPT-4o is back!**

GPT-4o has been re-enabled! You can use it by selecting the model from the dropdown.`,
        }
    ];

    const ChangeLogs: React.FC<{ open: boolean; setOpen: (open: boolean) => void }> = ({ open, setOpen }) => {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="no-scrollbar max-h-[80vh] overflow-y-auto rounded-xl border-none p-0 gap-0 font-sans bg-white dark:bg-neutral-900">
                    <div className="w-full py-3 flex justify-center items-center border-b border-neutral-200 dark:border-neutral-700">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                            <Flame size={20} /> What&apos;s new
                        </h2>
                    </div>
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {changelogs.map((changelog) => (
                            <div key={changelog.id}>
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
                                <div className="flex flex-col gap-2 px-4 py-2">
                                    <h3 className="text-2xl font-medium font-serif text-neutral-800 dark:text-neutral-100">{changelog.title}</h3>
                                    <ReactMarkdown
                                        components={{
                                            h2: ({ node, className, ...props }) => <h2 {...props} className={cn(className, "my-1 text-neutral-800 dark:text-neutral-100")} />,
                                            p: ({ node, className, ...props }) => <p {...props} className={cn(className, "mb-2 text-neutral-700 dark:text-neutral-300")} />,
                                        }}
                                        className="text-sm"
                                    >
                                        {changelog.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                    </div>
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
            return () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = '';
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

            if (toolInvocation.toolName === 'find_place') {
                if (!result) {
                    return (
                        <div key={index}>
                            <MapSkeleton />
                            <p>Loading place information...</p>
                        </div>
                    );
                }

                const place = result.features[0];
                if (!place) return null;

                return (
                    <div key={index}>
                        <MapComponent
                            center={{
                                lat: place.geometry.coordinates[1],
                                lng: place.geometry.coordinates[0],
                            }}
                            places={[
                                {
                                    name: place.name,
                                    location: {
                                        lat: place.geometry.coordinates[1],
                                        lng: place.geometry.coordinates[0],
                                    },
                                    vicinity: place.formatted_address,
                                },
                            ]}
                            zoom={15}
                        />
                    </div>
                );
            }

            if (toolInvocation.toolName === 'nearby_search') {
                if (!result) {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-neutral-700 dark:text-neutral-300 animate-pulse" />
                                <span className="text-neutral-700 dark:text-neutral-300 text-lg">
                                    Finding nearby {args.type}s...
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
                                                    type={result.chart.type as 'bar' | 'line'}
                                                    title={result.chart.title}
                                                    xLabel={result.chart.x_label}
                                                    yLabel={result.chart.y_label}
                                                    xUnit={result.chart.x_unit}
                                                    yUnit={result.chart.y_unit}
                                                    elements={result.chart.elements}
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
                    <div>
                        {!result ? (
                            <div className="flex items-center justify-between w-full">
                                <div className='flex items-center gap-2'>
                                    <Globe className="h-5 w-5 text-neutral-700 dark:text-neutral-300 animate-spin" />
                                    <span className="text-neutral-700 dark:text-neutral-300 text-lg">Running a search...</span>
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
                        ) : (
                            <WebSearchResults result={result} args={args} />
                        )}
                    </div>
                );
            }

            if (toolInvocation.toolName === 'retrieve') {
                if (!result) {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-neutral-700 dark:text-neutral-300 animate-pulse" />
                                <span className="text-neutral-700 dark:text-neutral-300 text-lg">Retrieving content...</span>
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

                return (
                    <div className="w-full my-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Retrieved Content</h3>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm sm:text-base text-neutral-800 dark:text-neutral-200">{result.results[0].title}</h4>
                            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">{result.results[0].description}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">{result.results[0].language || 'Unknown language'}</Badge>
                                <a href={result.results[0].url} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-primary hover:underline">
                                    Source
                                </a>
                            </div>
                        </div>
                        <Accordion type="single" collapsible className="w-full mt-4">
                            <AccordionItem value="content" className="border-b-0">
                                <AccordionTrigger className="text-neutral-800 dark:text-neutral-200">View Content</AccordionTrigger>
                                <AccordionContent>
                                    <div className="max-h-[50vh] overflow-y-auto bg-neutral-100 dark:bg-neutral-800 p-2 sm:p-4 rounded-lg">
                                        <ReactMarkdown className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">
                                            {result.results[0].content}
                                        </ReactMarkdown>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
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

        const CodeBlock = ({ language, children }: { language: string | undefined; children: string }) => {
            const [isCopied, setIsCopied] = useState(false);

            const handleCopy = async () => {
                await navigator.clipboard.writeText(children);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            };

            return (
                <div className="relative group">
                    <SyntaxHighlighter
                        language={language || 'text'}
                        style={oneDark}
                        showLineNumbers
                        wrapLines
                        customStyle={{
                            margin: 0,
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                        }}
                    >
                        {children}
                    </SyntaxHighlighter>
                    <Button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-2 bg-neutral-700 dark:bg-neutral-600 bg-opacity-80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        variant="ghost"
                        size="sm"
                    >
                        {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-neutral-200" />}
                    </Button>
                </div>
            );
        };

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
            paragraph(children) {
                return <p className="my-4 text-neutral-800 dark:text-neutral-200">{children}</p>;
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
            <div className="markdown-body dark:text-neutral-200">
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
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, suggestedQuestions]);

    const handleExampleClick = async (card: typeof suggestionCards[number]) => {
        const exampleText = card.text;
        track("search example", { query: exampleText });
        lastSubmittedQueryRef.current = exampleText;
        setHasSubmitted(true);
        setSuggestedQuestions([]);
        console.log('exampleText', exampleText);
        console.log('lastSubmittedQuery', lastSubmittedQueryRef.current);

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

    const suggestionCards = [
        {
            icon: <User2 className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />,
            text: "Shah Rukh Khan",
        },
        {
            icon: <Sun className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />,
            text: "Weather in Doha",
        },
        {
            icon: <Terminal className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />,
            text: "Count the no. of r's in strawberry?",
        },
    ];

    interface NavbarProps { }

    const Navbar: React.FC<NavbarProps> = () => {
        return (
            <div className="fixed top-0 left-0 right-0 z-[60] flex justify-between items-center p-4 bg-white dark:bg-neutral-950">
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
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open("https://git.new/mplx", "_blank")}
                        className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 shadow-none"
                    >
                        <GitHubLogoIcon className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                        <span className="text-neutral-800 dark:text-neutral-200">GitHub</span>
                    </Button>
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

    const SuggestionCards: React.FC<{ selectedModel: string }> = ({ selectedModel }) => {
        return (
            <div className="flex gap-3 mt-4">
                <div className="flex flex-grow sm:flex-row sm:mx-auto w-full gap-2 sm:gap-[21px]">
                    {suggestionCards.map((card, index) => (
                        <button
                            key={index}
                            onClick={() => handleExampleClick(card)}
                            className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-2 sm:p-4 text-left  hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
                        >
                            <div className="flex items-center space-x-2 text-neutral-700 dark:text-neutral-300">
                                <span>{card.icon}</span>
                                <span className="text-xs sm:text-sm font-medium">
                                    {card.text}
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


    // const memoizedMessages = useMemo(() => messages, [messages]);

    return (
        <div className="flex flex-col font-sans items-center justify-center p-2 sm:p-4 bg-background text-foreground transition-all duration-500">
            <Navbar />

            <div className={`w-full max-w-[90%] sm:max-w-2xl space-y-6 p-0 ${hasSubmitted ? 'mt-16 sm:mt-20' : 'mt-[20vh] sm:mt-[25vh]'}`}>
                {!hasSubmitted && (
                    <div className="text-center">
                        <Badge
                            onClick={() => setOpenChangelog(true)}
                            className="cursor-pointer gap-1 mb-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            variant="secondary"
                        >
                            <Flame size={14} /> What&apos;s new
                        </Badge>
                        <h1 className="text-4xl sm:text-6xl mb-1 text-neutral-800 dark:text-neutral-100 font-serif">MiniPerplx</h1>
                        <h2 className='text-xl sm:text-2xl font-serif text-balance text-center mb-6 text-neutral-600 dark:text-neutral-400'>
                            In search for minimalism and simplicity
                        </h2>
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
                                messages={messages}
                                append={append}
                                selectedModel={selectedModel}
                                setSelectedModel={handleModelChange}
                                resetSuggestedQuestions={resetSuggestedQuestions}
                                lastSubmittedQueryRef={lastSubmittedQueryRef}
                            />
                            <SuggestionCards selectedModel={selectedModel} />
                        </motion.div>
                    )}
                </AnimatePresence>


                <div className="space-y-4 sm:space-y-6 mb-32">
                    {messages.map((message, index) => (
                        <div key={index}>
                            {message.role === 'user' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex items-start space-x-2 mb-4"
                                >
                                    <User2 className="size-5 sm:size-6 text-primary flex-shrink-0 mt-1" />
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
                                                <p className="text-xl sm:text-2xl font-medium font-serif break-words text-neutral-800 dark:text-neutral-200">
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
                            {message.role === 'assistant' && message.content && (
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
                                        className="w-fit font-light rounded-2xl p-1 justify-start text-left h-auto py-2 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 whitespace-normal"
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
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <ChangeLogs open={openChangelog} setOpen={setOpenChangelog} />
        </div>
    );
}

const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-6xl mb-1 text-neutral-800 dark:text-neutral-100 font-serif animate-pulse">
                MiniPerplx
            </h1>
            <p className="text-xl sm:text-2xl font-serif text-neutral-600 dark:text-neutral-400 animate-pulse">
                Loading your minimalist AI experience...
            </p>
            <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
        </div>
    </div>
);

const Home = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <HomeContent />
        </Suspense>
    );
};

export default Home;