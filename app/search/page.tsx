/* eslint-disable @next/next/no-img-element */
"use client";

import
React,
{
    useRef,
    useCallback,
    useState,
    useEffect,
    useMemo,
    memo
} from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { track } from '@vercel/analytics';
import 'katex/dist/katex.min.css';
import { useChat } from 'ai/react';
import { ToolInvocation } from 'ai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { generateSpeech, suggestQuestions } from '../actions';
import { Wave } from "@foobar404/wave";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
    Edit2,
    Heart,
    X,
    MapPin,
    Star,
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
    Paperclip
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
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { GitHubLogoIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const maxDuration = 60;

declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

const MAX_IMAGES = 3;

interface Attachment {
    name: string;
    contentType: string;
    url: string;
    size: number;
}

export default function Home() {
    const [lastSubmittedQuery, setLastSubmittedQuery] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [isEditingMessage, setIsEditingMessage] = useState(false);
    const [editingMessageIndex, setEditingMessageIndex] = useState(-1);
    const [files, setFiles] = useState<FileList | undefined>(undefined);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { isLoading, input, messages, setInput, handleInputChange, append, handleSubmit, setMessages } = useChat({
        api: '/api/chat',
        maxToolRoundtrips: 1,
        onFinish: async (message, { finishReason }) => {
            console.log("[finish reason]:", finishReason);
            if (message.content && finishReason === 'stop' || finishReason === 'length') {
                const newHistory = [...messages, { role: "user", content: lastSubmittedQuery }, { role: "assistant", content: message.content }];
                const { questions } = await suggestQuestions(newHistory);
                setSuggestedQuestions(questions);
            }
        },
        onError: (error) => {
            console.error("Chat error:", error);
            toast.error("An error occurred.", {
                description: "We must have ran out of credits. Sponsor us on GitHub to keep this service running.",
                action: {
                    label: "Sponsor",
                    onClick: () => window.open("https://git.new/mplx", "_blank"),
                },
            });
        },
    });

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

    // Weather chart components

    interface WeatherDataPoint {
        date: string;
        minTemp: number;
        maxTemp: number;
    }

    const WeatherChart: React.FC<{ result: any }> = React.memo(({ result }) => {
        const { chartData, minTemp, maxTemp } = useMemo(() => {
            const weatherData: WeatherDataPoint[] = result.list.map((item: any) => ({
                date: new Date(item.dt * 1000).toLocaleDateString(),
                minTemp: Number((item.main.temp_min - 273.15).toFixed(1)),
                maxTemp: Number((item.main.temp_max - 273.15).toFixed(1)),
            }));

            // Group data by date and calculate min and max temperatures
            const groupedData: { [key: string]: WeatherDataPoint } = weatherData.reduce((acc, curr) => {
                if (!acc[curr.date]) {
                    acc[curr.date] = { ...curr };
                } else {
                    acc[curr.date].minTemp = Math.min(acc[curr.date].minTemp, curr.minTemp);
                    acc[curr.date].maxTemp = Math.max(acc[curr.date].maxTemp, curr.maxTemp);
                }
                return acc;
            }, {} as { [key: string]: WeatherDataPoint });

            const chartData = Object.values(groupedData);

            // Calculate overall min and max temperatures
            const minTemp = Math.min(...chartData.map(d => d.minTemp));
            const maxTemp = Math.max(...chartData.map(d => d.maxTemp));

            return { chartData, minTemp, maxTemp };
        }, [result]);

        const chartConfig: ChartConfig = useMemo(() => ({
            minTemp: {
                label: "Min Temp.",
                color: "hsl(var(--chart-1))",
            },
            maxTemp: {
                label: "Max Temp.",
                color: "hsl(var(--chart-2))",
            },
        }), []);

        return (
            <Card className="my-4 shadow-none">
                <CardHeader>
                    <CardTitle>Weather Forecast for {result.city.name}</CardTitle>
                    <CardDescription>
                        Showing min and max temperatures for the next 5 days
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis
                                    domain={[Math.floor(minTemp) - 2, Math.ceil(maxTemp) + 2]}
                                    tickFormatter={(value) => `${value}°C`}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line
                                    type="monotone"
                                    dataKey="minTemp"
                                    stroke="var(--color-minTemp)"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Min Temp."
                                />
                                <Line
                                    type="monotone"
                                    dataKey="maxTemp"
                                    stroke="var(--color-maxTemp)"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Max Temp."
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2 font-medium leading-none">
                                {result.city.name}, {result.city.country}
                            </div>
                            <div className="flex items-center gap-2 leading-none text-muted-foreground">
                                Next 5 days forecast
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        );
    });

    WeatherChart.displayName = 'WeatherChart';


    // Google Maps components

    const isValidCoordinate = (coord: number) => {
        return typeof coord === 'number' && !isNaN(coord) && isFinite(coord);
    };

    const loadGoogleMapsScript = (callback: () => void) => {
        if (window.google && window.google.maps) {
            callback();
            return;
        }

        const existingScript = document.getElementById('googleMapsScript');
        if (existingScript) {
            existingScript.remove();
        }

        window.initMap = callback;
        const script = document.createElement('script');
        script.id = 'googleMapsScript';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    };

    const MapComponent = React.memo(({ center, places }: { center: { lat: number; lng: number }, places: any[] }) => {
        const mapRef = useRef<HTMLDivElement>(null);
        const [mapError, setMapError] = useState<string | null>(null);
        const googleMapRef = useRef<google.maps.Map | null>(null);
        const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

        const memoizedCenter = useMemo(() => center, [center]);
        const memoizedPlaces = useMemo(() => places, [places]);

        const initializeMap = useCallback(async () => {
            if (mapRef.current && isValidCoordinate(memoizedCenter.lat) && isValidCoordinate(memoizedCenter.lng)) {
                const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
                const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

                if (!googleMapRef.current) {
                    googleMapRef.current = new Map(mapRef.current, {
                        center: memoizedCenter,
                        zoom: 14,
                        mapId: "347ff92e0c7225cf",
                    });
                } else {
                    googleMapRef.current.setCenter(memoizedCenter);
                }

                // Clear existing markers
                markersRef.current.forEach(marker => marker.map = null);
                markersRef.current = [];

                memoizedPlaces.forEach((place) => {
                    if (isValidCoordinate(place.location.lat) && isValidCoordinate(place.location.lng)) {
                        const marker = new AdvancedMarkerElement({
                            map: googleMapRef.current,
                            position: place.location,
                            title: place.name,
                        });
                        markersRef.current.push(marker);
                    }
                });
            } else {
                setMapError('Invalid coordinates provided');
            }
        }, [memoizedCenter, memoizedPlaces]);

        useEffect(() => {
            loadGoogleMapsScript(() => {
                try {
                    initializeMap();
                } catch (error) {
                    console.error('Error initializing map:', error);
                    setMapError('Failed to initialize Google Maps');
                }
            });

            return () => {
                // Clean up markers when component unmounts
                markersRef.current.forEach(marker => marker.map = null);
            };
        }, [initializeMap]);

        if (mapError) {
            return <div className="h-64 flex items-center justify-center bg-gray-100">{mapError}</div>;
        }

        return <div ref={mapRef} className="w-full h-64" />;
    });

    MapComponent.displayName = 'MapComponent';

    const MapSkeleton = () => (
        <Skeleton className="w-full h-64" />
    );

    const PlaceDetails = ({ place }: { place: any }) => (
        <div className="flex justify-between items-start py-2">
            <div>
                <h4 className="font-semibold">{place.name}</h4>
                <p className="text-sm text-muted-foreground max-w-[200px]" title={place.vicinity}>
                    {place.vicinity}
                </p>
            </div>
            {place.rating && (
                <Badge variant="secondary" className="flex items-center">
                    <Star className="h-3 w-3 mr-1 text-yellow-400" />
                    {place.rating} ({place.user_ratings_total})
                </Badge>
            )}
        </div>
    );

    const MapEmbed = memo(({ location, zoom = 15 }: { location: string, zoom?: number }) => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location)}&zoom=${zoom}`;

        return (
            <div className="aspect-video w-full">
                <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapUrl}
                    className='rounded-xl'
                ></iframe>
            </div>
        );
    });

    MapEmbed.displayName = 'MapEmbed';

    const FindPlaceResult = memo(({ result }: { result: any }) => {
        const place = result.candidates[0];
        const location = `${place.geometry.location.lat},${place.geometry.location.lng}`;

        return (
            <Card className="w-full my-4 overflow-hidden shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>{place.name}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MapEmbed location={location} />
                    <div className="mt-4 space-y-2">
                        <p><strong>Address:</strong> {place.formatted_address}</p>
                        {place.rating && (
                            <div className="flex items-center">
                                <strong className="mr-2">Rating:</strong>
                                <Badge variant="secondary" className="flex items-center">
                                    <Star className="h-3 w-3 mr-1 text-yellow-400" />
                                    {place.rating}
                                </Badge>
                            </div>
                        )}
                        {place.opening_hours && (
                            <p><strong>Open now:</strong> {place.opening_hours.open_now ? 'Yes' : 'No'}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    });

    FindPlaceResult.displayName = 'FindPlaceResult';

    const TextSearchResult = memo(({ result }: { result: any }) => {
        const centerLocation = result.results[0]?.geometry?.location;
        const mapLocation = centerLocation ? `${centerLocation.lat},${centerLocation.lng}` : '';

        return (
            <Card className="w-full my-4 overflow-hidden shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>Text Search Results</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {mapLocation && <MapEmbed location={mapLocation} zoom={13} />}
                    <Accordion type="single" collapsible className="w-full mt-4">
                        <AccordionItem value="place-details">
                            <AccordionTrigger>Place Details</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 max-h-64 overflow-y-auto">
                                    {result.results.map((place: any, index: number) => (
                                        <div key={index} className="flex justify-between items-start py-2 border-b last:border-b-0">
                                            <div>
                                                <h4 className="font-semibold">{place.name}</h4>
                                                <p className="text-sm text-muted-foreground max-w-[200px]" title={place.formatted_address}>
                                                    {place.formatted_address}
                                                </p>
                                            </div>
                                            {place.rating && (
                                                <Badge variant="secondary" className="flex items-center">
                                                    <Star className="h-3 w-3 mr-1 text-yellow-400" />
                                                    {place.rating} ({place.user_ratings_total})
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        );
    });

    TextSearchResult.displayName = 'TextSearchResult';

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
                <Card className="w-full my-4">
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
            <Card className="w-full my-4 shadow-none">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="w-full h-24 bg-white rounded-lg overflow-hidden">
                            <canvas ref={canvasRef} width="800" height="200" className="w-full h-full bg-neutral-100" />
                        </div>
                        <div className="flex text-left gap-3">
                            <div className="flex justify-center space-x-2">
                                <Button
                                    onClick={handlePlayPause}
                                    disabled={isGeneratingAudio}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs sm:text-sm w-24"
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
                            <div
                                className='text-sm text-neutral-800'
                            >
                                The phrase <span className='font-semibold'>{toolInvocation.args.text}</span> translates from <span className='font-semibold'>{result.detectedLanguage}</span> to <span className='font-semibold'>{toolInvocation.args.to}</span> as <span className='font-semibold'>{result.translatedText}</span>
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

    interface SearchImage {
        url: string;
        description: string;
    }

    const ImageCarousel = ({ images, onClose }: { images: SearchImage[], onClose: () => void }) => {
        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
                    >
                        <X className="h-4 w-4" />
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
                                    <p className="text-center text-sm">{image.description}</p>
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
                                    <h2 className='text-base font-semibold'>Sources Found</h2>
                                </div>
                                {result && (
                                    <Badge variant="secondary" className='rounded-full'>{result.results.length} results</Badge>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {args?.query && (
                                <Badge variant="secondary" className="mb-4 text-xs sm:text-sm font-light rounded-full">
                                    <SearchIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    {args.query}
                                </Badge>
                            )}
                            {result && (
                                <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto pb-2">
                                    {result.results.map((item: any, itemIndex: number) => (
                                        <div key={itemIndex} className="flex flex-col w-full sm:w-[280px] flex-shrink-0 bg-card border rounded-lg p-3">
                                            <div className="flex items-start gap-3 mb-2">
                                                <img
                                                    src={`https://www.google.com/s2/favicons?sz=128&domain=${new URL(item.url).hostname}`}
                                                    alt="Favicon"
                                                    className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 rounded-sm"
                                                />
                                                <div className="flex-grow min-w-0">
                                                    <h3 className="text-sm font-semibold line-clamp-2">{item.title}</h3>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.content}</p>
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
                        <div
                            className='flex items-center gap-2 cursor-pointer mb-2'
                        >
                            <ImageIcon className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold">Images</h3>
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

    const renderToolInvocation = (toolInvocation: ToolInvocation, index: number) => {
        const args = JSON.parse(JSON.stringify(toolInvocation.args));
        const result = 'result' in toolInvocation ? JSON.parse(JSON.stringify(toolInvocation.result)) : null;

        if (toolInvocation.toolName === 'nearby_search') {
            if (!result) {
                return (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-neutral-700 animate-pulse" />
                            <span className="text-neutral-700 text-lg">Searching nearby places...</span>
                        </div>
                        <div className="flex space-x-1">
                            {[0, 1, 2].map((index) => (
                                <motion.div
                                    key={index}
                                    className="w-2 h-2 bg-muted-foreground rounded-full"
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

            if (isLoading) {
                return (
                    <Card className="w-full my-4 overflow-hidden">
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent className="p-0 rounded-t-none rounded-b-xl">
                            <MapSkeleton />
                        </CardContent>
                    </Card>
                );
            }

            return (
                <Card className="w-full my-4 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span>Nearby {args.type ? args.type.charAt(0).toUpperCase() + args.type.slice(1) + 's' : 'Places'}</span>
                            {args.keyword && <Badge variant="secondary">{args.keyword}</Badge>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <MapComponent center={result.center} places={result.results} />
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="place-details">
                                <AccordionTrigger className="px-4">Place Details</AccordionTrigger>
                                <AccordionContent>
                                    <div className="px-4 space-y-4 max-h-64 overflow-y-auto">
                                        {result.results.map((place: any, placeIndex: number) => (
                                            <PlaceDetails key={placeIndex} place={place} />
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            );
        }

        if (toolInvocation.toolName === 'find_place') {
            if (!result) {
                return (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-neutral-700 animate-pulse" />
                            <span className="text-neutral-700 text-lg">Finding place...</span>
                        </div>
                        <motion.div className="flex space-x-1">
                            {[0, 1, 2].map((index) => (
                                <motion.div
                                    key={index}
                                    className="w-2 h-2 bg-muted-foreground rounded-full"
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

            return <FindPlaceResult result={result} />;
        }

        if (toolInvocation.toolName === 'text_search') {
            if (!result) {
                return (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-neutral-700 animate-pulse" />
                            <span className="text-neutral-700 text-lg">Searching places...</span>
                        </div>
                        <motion.div className="flex space-x-1">
                            {[0, 1, 2].map((index) => (
                                <motion.div
                                    key={index}
                                    className="w-2 h-2 bg-muted-foreground rounded-full"
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

            return <TextSearchResult result={result} />;
        }

        if (toolInvocation.toolName === 'get_weather_data') {
            if (!result) {
                return (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <Cloud className="h-5 w-5 text-neutral-700 animate-pulse" />
                            <span className="text-neutral-700 text-lg">Fetching weather data...</span>
                        </div>
                        <div className="flex space-x-1">
                            {[0, 1, 2].map((index) => (
                                <motion.div
                                    key={index}
                                    className="w-2 h-2 bg-muted-foreground rounded-full"
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

            if (isLoading) {
                return (
                    <Card className="my-4 shadow-none">
                        <CardHeader>
                            <CardTitle className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
                        </CardContent>
                    </Card>
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
                                    <h2 className="text-base font-semibold">Programming</h2>
                                </div>
                                {!result ? (
                                    <Badge variant="secondary" className="mr-2 rounded-full">
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        Executing
                                    </Badge>
                                ) : (
                                    <Badge className="mr-2 rounded-full">
                                        <Check className="h-3 w-3 mr-1 text-green-400" />
                                        Executed
                                    </Badge>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="w-full my-2 border border-gray-200 overflow-hidden rounded-md">
                                <div className="bg-gray-100 p-2 flex items-center">
                                    {args.icon === 'stock' && <TrendingUpIcon className="h-5 w-5 text-primary mr-2" />}
                                    {args.icon === 'default' && <Code className="h-5 w-5 text-primary mr-2" />}
                                    {args.icon === 'date' && <Calendar className="h-5 w-5 text-primary mr-2" />}
                                    {args.icon === 'calculation' && <Calculator className="h-5 w-5 text-primary mr-2" />}
                                    <span className="text-sm font-medium">{args.title}</span>
                                </div>
                                <Tabs defaultValue="code" className="w-full">
                                    <TabsList className="bg-gray-50 p-0 h-auto shadow-sm rounded-none">
                                        <TabsTrigger
                                            value="code"
                                            className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:border-b data-[state=active]:border-blue-500 rounded-none shadow-sm"
                                        >
                                            Code
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="output"
                                            className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:border-b data-[state=active]:border-blue-500 rounded-none shadow-sm"
                                        >
                                            Output
                                        </TabsTrigger>
                                        {result?.images && result.images.length > 0 && (
                                            <TabsTrigger
                                                value="images"
                                                className="px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:border-b data-[state=active]:border-blue-500 rounded-none shadow-sm"
                                            >
                                                Images
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                    <TabsContent value="code" className="p-0 m-0 rounded-none">
                                        <div className="relative">
                                            <SyntaxHighlighter
                                                language="python"
                                                style={oneLight}
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '1rem',
                                                    fontSize: '0.875rem',
                                                    borderRadius: 0,
                                                }}
                                            >
                                                {args.code}
                                            </SyntaxHighlighter>
                                            <div className="absolute top-2 right-2">
                                                <CopyButton text={args.code} />
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="output" className="p-0 m-0 rounded-none">
                                        <div className="relative bg-white p-4">
                                            {result ? (
                                                <>
                                                    <pre className="text-sm">
                                                        <code>{result.message}</code>
                                                    </pre>
                                                    <div className="absolute top-2 right-2">
                                                        <CopyButton text={result.message} />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-20">
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                                        <span className="text-gray-500 text-sm">Executing code...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                    {result?.images && result.images.length > 0 && (
                                        <TabsContent value="images" className="p-0 m-0 bg-white">
                                            <div className="space-y-4 p-4">
                                                {result.images.map((img: { format: string, url: string }, imgIndex: number) => (
                                                    <div key={imgIndex} className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-sm font-medium">Image {imgIndex + 1}</h4>
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
                                                                <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                                                                    Image upload failed or URL is empty
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </TabsContent>
                                    )}
                                </Tabs>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            );
        }

        if (toolInvocation.toolName === 'nearby_search') {
            if (!result) {
                return (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-neutral-700 animate-pulse" />
                            <span className="text-neutral-700 text-lg">Searching nearby places...</span>
                        </div>
                        <div className="flex space-x-1">
                            {[0, 1, 2].map((index) => (
                                <motion.div
                                    key={index}
                                    className="w-2 h-2 bg-muted-foreground rounded-full"
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

            const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(args.type)}&center=${result.results[0].geometry.location.lat},${result.results[0].geometry.location.lng}&zoom=14`;

            return (
                <Card className="w-full my-4 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span>Nearby {args.type.charAt(0).toUpperCase() + args.type.slice(1)}s</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="aspect-video w-full">
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={mapUrl}
                            ></iframe>
                        </div>
                        <div className="p-4 space-y-2">
                            {result.results.map((place: any, placeIndex: number) => (
                                <div key={placeIndex} className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">{place.name}</h4>
                                        <p className="text-sm text-muted-foreground">{place.vicinity}</p>
                                    </div>
                                    <Badge variant="secondary" className="flex items-center">
                                        {place.rating} ★ ({place.user_ratings_total})
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (toolInvocation.toolName === 'web_search') {
            return (
                <div>
                    {!result ? (
                        <div className="flex items-center justify-between w-full">
                            <div className='flex items-center gap-2'>
                                <Globe className="h-5 w-5 text-neutral-700 animate-spin" />
                                <span className="text-neutral-700 text-lg">Running a search...</span>
                            </div>
                            <div className="flex space-x-1">
                                {[0, 1, 2].map((index) => (
                                    <motion.div
                                        key={index}
                                        className="w-2 h-2 bg-muted-foreground rounded-full"
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
                            <Globe className="h-5 w-5 text-neutral-700 animate-pulse" />
                            <span className="text-neutral-700 text-lg">Retrieving content...</span>
                        </div>
                        <div className="flex space-x-1">
                            {[0, 1, 2].map((index) => (
                                <motion.div
                                    key={index}
                                    className="w-2 h-2 bg-muted-foreground rounded-full"
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
                        <h3 className="font-semibold">Retrieved Content</h3>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm sm:text-base">{result.results[0].title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{result.results[0].description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{result.results[0].language || 'Unknown language'}</Badge>
                            <a href={result.results[0].url} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-primary hover:underline">
                                Source
                            </a>
                        </div>
                    </div>
                    <Accordion type="single" collapsible className="w-full mt-4">
                        <AccordionItem value="content" className="border-b-0">
                            <AccordionTrigger>View Content</AccordionTrigger>
                            <AccordionContent>
                                <div className="max-h-[50vh] overflow-y-auto bg-muted p-2 sm:p-4 rounded-lg">
                                    <ReactMarkdown className="text-xs sm:text-sm">
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

        return null;
    };

    interface CitationComponentProps {
        href: string;
        children: React.ReactNode;
        index: number;
        citationText: string;
    }

    const CitationComponent: React.FC<CitationComponentProps> = React.memo(({ href, index, citationText }) => {
        const { hostname } = new URL(href);
        const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;

        return (
            <HoverCard>
                <HoverCardTrigger asChild>
                    <sup>
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-help text-sm text-primary py-0.5 px-1.5 m-0 bg-secondary rounded-full no-underline"
                        >
                            {index + 1}
                        </a>
                    </sup>
                </HoverCardTrigger>
                <HoverCardContent className="w-fit p-2 m-0">
                    <div className="flex items-center justify-between mb-1 m-0">
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center m-0 h-8 hover:no-underline">
                            <Image src={faviconUrl} alt="Favicon" width={16} height={16} className="rounded-sm mr-2" />
                            <span className="text-sm">{hostname}</span>
                        </a>
                    </div>
                    <p className="text-sm font-medium m-0">{citationText}</p>
                </HoverCardContent>
            </HoverCard>
        );
    });

    CitationComponent.displayName = "CitationComponent";

    interface MarkdownRendererProps {
        content: string;
    }

    const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content }) => {
        // Escape dollar signs that are likely to be currency
        const escapedContent = content.replace(/\$(\d+(\.\d{1,2})?)/g, '\\$$1');

        const citationLinks = useMemo(() => {
            return [...escapedContent.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(([_, text, link]) => ({
                text,
                link,
            }));
        }, [escapedContent]);

        const components: Partial<Components> = useMemo(() => ({
            a: ({ href, children }) => {
                if (!href) return null;
                const index = citationLinks.findIndex((link) => link.link === href);
                return index !== -1 ? (
                    <CitationComponent
                        href={href}
                        index={index}
                        citationText={citationLinks[index].text}
                    >
                        {children}
                    </CitationComponent>
                ) : (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {children}
                    </a>
                );
            },
        }), [citationLinks]);

        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={components}
                className="prose text-sm sm:text-base text-pretty text-left"
            >
                {escapedContent}
            </ReactMarkdown>
        );
    });

    MarkdownRenderer.displayName = "MarkdownRenderer";

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

    const handleExampleClick = useCallback(async (card: typeof suggestionCards[number]) => {
        track("search example", { query: card.text });
        setLastSubmittedQuery(card.text.trim());
        setHasSubmitted(true);
        setSuggestedQuestions([]);
        await append({
            content: card.text.trim(),
            role: 'user',
            experimental_attachments: card.attachment ? [card.attachment] : undefined,
        });
    }, [append, setLastSubmittedQuery, setHasSubmitted, setSuggestedQuestions]);

    const handleSuggestedQuestionClick = useCallback(async (question: string) => {
        setHasSubmitted(true);
        setSuggestedQuestions([]);
        setInput(question.trim());
        await append({
            content: question.trim(),
            role: 'user'
        });
    }, [setInput, append]);

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
            icon: <ImageIcon className="w-5 h-5 text-gray-400" />,
            text: "Where is this place?",
            attachment: {
                name: 'taj_mahal.jpg',
                contentType: 'image/jpeg',
                url: 'https://metwm7frkvew6tn1.public.blob.vercel-storage.com/taj-mahal.jpg',
            }
        },
        { icon: <Flame className="w-5 h-5 text-gray-400" />, text: "What's new with XAI's Grok?" },
        { icon: <Sparkles className="w-5 h-5 text-gray-400" />, text: "Latest updates on OpenAI" },
        { icon: <Sun className="w-5 h-5 text-gray-400" />, text: "Weather in Doha" },
        { icon: <Terminal className="w-5 h-5 text-gray-400" />, text: "Count the no. of r's in strawberry?" },
    ];

    const Navbar = () => (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-background">
            <Link href="/new">
                <Button
                    type="button"
                    variant={'secondary'}
                    className="rounded-full bg-secondary/80 group transition-all hover:scale-105 pointer-events-auto"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-all" />
                    <span className="text-sm ml-2 group-hover:block hidden animate-in fade-in duration-300">
                        New
                    </span>
                </Button>
            </Link>
            <div
                className='flex items-center space-x-2'
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open("https://git.new/mplx", "_blank")}
                    className="flex items-center space-x-2"
                >
                    <GitHubLogoIcon className="h-4 w-4 text-primary" />
                    <span>GitHub</span>
                </Button>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                onClick={() => window.open("https://github.com/sponsors/zaidmukaddam", "_blank")}
                                className="flex items-center space-x-2"
                            >
                                <Heart className="h-4 w-4 text-red-500" />
                                <span>Sponsor</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sponsor this project on GitHub</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );

    interface UploadingAttachment {
        file: File;
        progress: number;
    }

    interface AttachmentPreviewProps {
        attachment: Attachment | UploadingAttachment;
        onRemove: () => void;
        isUploading: boolean;
    }

    const AttachmentPreview: React.FC<AttachmentPreviewProps> = React.memo(({ attachment, onRemove, isUploading }) => {
        const formatFileSize = (bytes: number): string => {
            if (bytes < 1024) return bytes + ' bytes';
            else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            else return (bytes / 1048576).toFixed(1) + ' MB';
        };

        const isUploadingAttachment = (attachment: Attachment | UploadingAttachment): attachment is UploadingAttachment => {
            return 'progress' in attachment;
        };

        return (
            <HoverCard>
                <HoverCardTrigger asChild>
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="relative flex items-center bg-background border border-input rounded-2xl p-2 pr-8 gap-2 cursor-pointer shadow-sm !z-30"
                    >
                        {isUploading ? (
                            <div className="w-10 h-10 flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : isUploadingAttachment(attachment) ? (
                            <div className="w-10 h-10 flex items-center justify-center">
                                <div className="relative w-8 h-8">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle
                                            className="text-muted-foreground stroke-current"
                                            strokeWidth="10"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                        ></circle>
                                        <circle
                                            className="text-primary stroke-current"
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            strokeDasharray={`${attachment.progress * 251.2}, 251.2`}
                                            transform="rotate(-90 50 50)"
                                        ></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-semibold">{Math.round(attachment.progress * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <img
                                src={(attachment as Attachment).url}
                                alt={`Preview of ${attachment.name}`}
                                width={40}
                                height={40}
                                className="rounded-lg h-10 w-10 object-cover"
                            />
                        )}
                        <div className="flex-grow min-w-0">
                            {!isUploadingAttachment(attachment) && (
                                <p className="text-sm font-medium truncate">{attachment.name}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {isUploadingAttachment(attachment)
                                    ? 'Uploading...'
                                    : formatFileSize((attachment as Attachment).size)}
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            className="absolute -top-2 -right-2 p-0.5 m-0 rounded-full bg-background border border-input shadow-sm hover:bg-muted transition-colors z-20"
                        >
                            <X size={14} />
                        </motion.button>
                    </motion.div>
                </HoverCardTrigger>
                {!isUploadingAttachment(attachment) && (
                    <HoverCardContent className="w-fit p-1 bg-black border-none rounded-xl !z-40">
                        <Image
                            src={(attachment as Attachment).url}
                            alt={`Full preview of ${attachment.name}`}
                            width={300}
                            height={300}
                            objectFit="contain"
                            className="rounded-md"
                        />
                    </HoverCardContent>
                )}
            </HoverCard>
        );
    });

    AttachmentPreview.displayName = 'AttachmentPreview';

    interface FormComponentProps {
        input: string;
        setInput: (input: string) => void;
        attachments: Attachment[];
        setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
        hasSubmitted: boolean;
        setHasSubmitted: (value: boolean) => void;
        isLoading: boolean;
        handleSubmit: (event: React.FormEvent<HTMLFormElement>, options?: { experimental_attachments?: Attachment[] }) => void;
        fileInputRef: React.RefObject<HTMLInputElement>;
        inputRef: React.RefObject<HTMLInputElement>;
    }

    const FormComponent: React.FC<FormComponentProps> = ({
        input,
        setInput,
        attachments,
        setAttachments,
        hasSubmitted,
        setHasSubmitted,
        isLoading,
        handleSubmit,
        fileInputRef,
        inputRef,
    }) => {
        const [uploadingAttachments, setUploadingAttachments] = useState<UploadingAttachment[]>([]);

        const uploadFile = async (file: File): Promise<Attachment> => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            return await response.json();
        };

        const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = event.target.files;
            if (selectedFiles) {
                const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
                if (imageFiles.length > 0) {
                    if (imageFiles.length + attachments.length + uploadingAttachments.length > MAX_IMAGES) {
                        toast.error(`You can only attach up to ${MAX_IMAGES} images.`);
                        return;
                    }

                    const newUploadingAttachments = imageFiles.map(file => ({ file, progress: 0 }));
                    setUploadingAttachments(prev => [...prev, ...newUploadingAttachments]);

                    for (const file of imageFiles) {
                        try {
                            const uploadedFile = await uploadFile(file);
                            setAttachments(prev => [...prev, uploadedFile]);
                            setUploadingAttachments(prev => prev.filter(ua => ua.file !== file));
                        } catch (error) {
                            console.error("Error uploading file:", error);
                            toast.error(`Failed to upload ${file.name}`);
                            setUploadingAttachments(prev => prev.filter(ua => ua.file !== file));
                        }
                    }
                } else {
                    toast.error("Please select image files only.");
                }
            }
        };

        const removeAttachment = (index: number) => {
            setAttachments(prev => prev.filter((_, i) => i !== index));
        };

        const removeUploadingAttachment = (index: number) => {
            setUploadingAttachments(prev => prev.filter((_, i) => i !== index));
        };

        const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            setInput(e.target.value);
        }, [setInput]);

        useEffect(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, [inputRef]);

        const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            event.stopPropagation();

            if (input.trim() || attachments.length > 0) {
                setHasSubmitted(true);
                handleSubmit(event, {
                    experimental_attachments: attachments,
                });
                setAttachments([]);
                setUploadingAttachments([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                toast.error("Please enter a search query or attach an image.");
            }
        };

        return (
            <motion.form
                layout
                onSubmit={onSubmit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSubmit(e);
                    }
                }}
                className={`
                    ${hasSubmitted ? 'fixed bottom-4 left-1/2 -translate-x-1/2 max-w-[90%] sm:max-w-2xl' : 'max-w-full'}
                    ${attachments.length > 0 || uploadingAttachments.length > 0 ? 'rounded-2xl' : 'rounded-full'}
                    w-full 
                    bg-background border border-input
                    overflow-hidden mb-4
                    transition-all duration-300 ease-in-out
                    z-50
                `}
            >
                <div className={`space-y-2 ${attachments.length > 0 || uploadingAttachments.length > 0 ? 'p-2' : 'p-0'}`}>
                    <AnimatePresence initial={false}>
                        {(attachments.length > 0 || uploadingAttachments.length > 0) && (
                            <motion.div
                                key="file-previews"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-wrap gap-2 z-30 relative"
                            >
                                {uploadingAttachments.map((attachment, index) => (
                                    <AttachmentPreview
                                        key={`uploading-${index}`}
                                        attachment={attachment}
                                        onRemove={() => removeUploadingAttachment(index)}
                                        isUploading={true}
                                    />
                                ))}
                                {attachments.map((attachment, index) => (
                                    <AttachmentPreview
                                        key={attachment.url}
                                        attachment={attachment}
                                        onRemove={() => removeAttachment(index)}
                                        isUploading={false}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="relative flex items-center z-20">
                        <Input
                            ref={inputRef}
                            name="search"
                            placeholder={hasSubmitted ? "Ask a new question..." : "Ask a question..."}
                            value={input}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="w-full h-12 pl-10 pr-12 bg-muted border border-input rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-sm sm:text-base"
                        />
                        <label
                            htmlFor={hasSubmitted ? "file-upload-bottom" : "file-upload-top"}
                            className={`absolute left-3 cursor-pointer ${attachments.length + uploadingAttachments.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                            <input
                                id={hasSubmitted ? "file-upload-bottom" : "file-upload-top"}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={attachments.length + uploadingAttachments.length >= MAX_IMAGES}
                                ref={fileInputRef}
                            />
                        </label>
                        <Button
                            type="submit"
                            size="icon"
                            variant="ghost"
                            className="absolute right-2"
                            disabled={(input.trim().length === 0 && attachments.length === 0) || isLoading || uploadingAttachments.length > 0}
                        >
                            <ArrowRight size={20} />
                        </Button>
                    </div>
                </div>
            </motion.form>
        );
    };


    const SuggestionCards: React.FC = () => {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 sm:row-span-2">
                    <button
                        onClick={() => handleExampleClick(suggestionCards[0])}
                        className="bg-gray-100 rounded-xl px-2 py-4 text-left w-full sm:h-40 h-full flex flex-col items-center hover:bg-gray-200"
                    >
                        <div className="flex items-center space-x-2 text-gray-700">
                            <span>{suggestionCards[0].icon}</span>
                            <span className="text-sm font-medium">{suggestionCards[0].text}</span>
                        </div>
                        {suggestionCards[0].attachment && (
                            <div className="mt-2 rounded-lg overflow-hidden w-full">
                                <img
                                    src={suggestionCards[0].attachment.url}
                                    alt={suggestionCards[0].attachment.name}
                                    className="w-full h-auto object-cover sm:h-30 sm:object-fill"
                                />
                            </div>
                        )}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:w-[28rem]">
                    {suggestionCards.slice(1).map((card, index) => (
                        <button
                            key={index}
                            onClick={() => handleExampleClick(card)}
                            className="bg-gray-100 rounded-xl py-3 sm:py-4 px-4 sm:px-5 text-left hover:bg-gray-200"
                        >
                            <div className="flex items-center space-x-2 text-gray-700">
                                <span>{card.icon}</span>
                                <span className="text-xs sm:text-sm font-medium">{card.text}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col font-sans items-center justify-center p-2 sm:p-4 bg-background text-foreground transition-all duration-500">
            <Navbar />

            <div className={`w-full max-w-[90%] sm:max-w-2xl space-y-6 p-1 ${hasSubmitted ? 'mt-16 sm:mt-20' : 'mt-[20vh] sm:mt-[30vh]'}`}>
                {!hasSubmitted && (
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-6xl mb-1 text-gray-800 font-serif">MiniPerplx</h1>
                        <h2 className='text-xl sm:text-2xl font-serif text-balance text-center mb-6 text-gray-600'>
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
                                handleSubmit={handleSubmit}
                                isLoading={isLoading}
                                fileInputRef={fileInputRef}
                                inputRef={inputRef}
                            />
                            <SuggestionCards />
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
                                                    className="flex-grow"
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
                                                >
                                                    <X size={16} />
                                                </Button>
                                                <Button type="submit" size="sm">
                                                    <ArrowRight size={16} />
                                                </Button>
                                            </form>
                                        ) : (
                                            <div>
                                                <p className="text-xl sm:text-2xl font-medium font-serif break-words">
                                                    {message.content}
                                                </p>
                                                <div
                                                    className='flex flex-row gap-2'
                                                >
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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMessageEdit(index)}
                                            className="ml-2"
                                            disabled={isLoading}
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                            {message.role === 'assistant' && message.content && (
                                <div>
                                    <div className='flex items-center justify-between mb-2'>
                                        <div className='flex items-center gap-2'>
                                            <Sparkles className="size-5 text-primary" />
                                            <h2 className="text-base font-semibold">Answer</h2>
                                        </div>
                                        <CopyButton text={message.content} />
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
                                <h2 className="font-semibold text-base">Suggested questions</h2>
                            </div>
                            <div className="space-y-2 flex flex-col">
                                {suggestedQuestions.map((question, index) => (
                                    <Button
                                        key={index}
                                        variant="ghost"
                                        className="w-fit font-light rounded-2xl p-1 justify-start text-left h-auto py-2 px-4 bg-neutral-100 text-neutral-950 hover:bg-muted-foreground/10 whitespace-normal"
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
                    <FormComponent
                        input={input}
                        setInput={setInput}
                        attachments={attachments}
                        setAttachments={setAttachments}
                        hasSubmitted={hasSubmitted}
                        setHasSubmitted={setHasSubmitted}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        fileInputRef={fileInputRef}
                        inputRef={inputRef}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}