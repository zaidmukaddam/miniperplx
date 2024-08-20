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
import { useRouter } from 'next/navigation';
import remarkGfm from 'remark-gfm';
import { useChat } from 'ai/react';
import { ToolInvocation } from 'ai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { suggestQuestions, Message } from './actions';
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
  Terminal,
  ImageIcon,
  Download,
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
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const maxDuration = 60;

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState(false)
  const [isEditingQuery, setIsEditingQuery] = useState(false);

  const { isLoading, input, messages, setInput, append, handleSubmit, setMessages } = useChat({
    api: '/api/chat',
    maxToolRoundtrips: 1,
    onFinish: async (message, { finishReason }) => {
      if (finishReason === 'stop') {
        const newHistory: Message[] = [{ role: "user", content: lastSubmittedQuery, }, { role: "assistant", content: message.content }];
        const { questions } = await suggestQuestions(newHistory);
        setSuggestedQuestions(questions);
      }
      setIsAnimating(false);
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
        <div className="w-full my-2 border border-gray-200 overflow-hidden rounded-md">
          <div className="bg-gray-100 p-2 flex items-center">
            <Code className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium">Programming</span>
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
                {result.images.map((img: { format: 'png' | 'jpeg' | 'svg', data: string }, imgIndex: number) => (
                  <div key={imgIndex} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Image {imgIndex + 1}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-8 w-8"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `data:image/${img.format === 'svg' ? 'svg+xml' : img.format};base64,${img.data}`;
                          link.download = `generated-image-${imgIndex + 1}.${img.format}`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                      <Image
                        src={`data:image/${img.format === 'svg' ? 'svg+xml' : img.format};base64,${img.data}`}
                        alt={`Generated image ${imgIndex + 1}`}
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
          </Tabs>
        </div>
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

    return (
      <div>
        {!result ? (
          <div className="flex items-center justify-between w-full">
            <div
              className='flex items-center gap-2'
            >
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
        ) :
          <Accordion type="single" collapsible className="w-full mt-4 !m-0">
            <AccordionItem value={`item-${index}`} className='border-none'>
              <AccordionTrigger className="hover:no-underline py-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 ">
                    <Newspaper className="h-5 w-5 text-primary" />
                    <h2 className='text-base font-semibold'>Sources Found</h2>
                  </div>
                  {result && (
                    <Badge variant="secondary" className='mr-1 rounded-full'>{result.results.length} results</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className='pb-2'>
                {args?.query && (
                  <Badge variant="secondary" className="mb-2 text-xs sm:text-sm font-light rounded-full">
                    <SearchIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {args.query}
                  </Badge>
                )}
                {result && (
                  <div className="flex flex-row gap-4 overflow-x-scroll">
                    {result.results.map((item: any, itemIndex: number) => (
                      <Card key={itemIndex} className="flex flex-col !size-40 shadow-none !p-0 !m-0">
                        <CardHeader className="pb-2 p-1">
                          <Image
                            width={48}
                            height={48}
                            unoptimized
                            quality={100}
                            src={`https://www.google.com/s2/favicons?sz=128&domain=${new URL(item.url).hostname}`}
                            alt="Favicon"
                            className="w-5 h-5 flex-shrink-0 rounded-full"
                          />
                          <CardTitle className="text-sm font-semibold line-clamp-2">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow p-1 pb-0">
                          <p className="text-xs text-muted-foreground line-clamp-3">{item.content}</p>
                        </CardContent>
                        <div className="px-1 py-2 bg-muted rounded-b-xl">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary flex items-center"
                          >
                            ↪
                            <span className="ml-1 truncate hover:underline">{item.url}</span>
                          </a>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>}
      </div>
    );
  };

  interface CitationComponentProps {
    href: string;
    children: React.ReactNode;
    index: number;
  }

  const CitationComponent: React.FC<CitationComponentProps> = React.memo(({ href, index }) => {
    const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${new URL(href).hostname}`;

    return (
      <HoverCard key={index}>
        <HoverCardTrigger asChild>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-help text-sm text-primary py-0.5 px-1.5 m-0 bg-secondary rounded-full no-underline"
          >
            {index + 1}
          </a>
        </HoverCardTrigger>
        <HoverCardContent className="flex items-center gap-1 !p-0 !px-0.5 max-w-xs bg-card text-card-foreground !m-0 h-6 rounded-xl">
          <Image src={faviconUrl} alt="Favicon" width={16} height={16} className="w-4 h-4 flex-shrink-0 rounded-full" />
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary no-underline truncate">
            {href}
          </a>
        </HoverCardContent>
      </HoverCard>
    );
  });

  CitationComponent.displayName = "CitationComponent";

  interface MarkdownRendererProps {
    content: string;
  }

  const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content }) => {
    const citationLinks = useMemo(() => {
      return [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(([_, text, link]) => ({
        text,
        link,
      }));
    }, [content]);

    const components: Partial<Components> = useMemo(() => ({
      a: ({ href, children }) => {
        if (!href) return null;
        const index = citationLinks.findIndex((link) => link.link === href);
        return index !== -1 ? (
          <CitationComponent href={href} index={index}>
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
        remarkPlugins={[remarkGfm]}
        components={components}
        className="prose text-sm sm:text-base text-pretty text-left"
      >
        {content}
      </ReactMarkdown>
    );
  });

  MarkdownRenderer.displayName = "MarkdownRenderer";


  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, suggestedQuestions]);

  const handleExampleClick = useCallback(async (query: string) => {
    setLastSubmittedQuery(query.trim());
    setHasSubmitted(true);
    setSuggestedQuestions([]);
    setIsAnimating(true);
    await append({
      content: query.trim(),
      role: 'user'
    });
  }, [append]);

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([]);
      setLastSubmittedQuery(input.trim());
      setHasSubmitted(true);
      setIsAnimating(true);
      setSuggestedQuestions([]);
      handleSubmit(e);
    } else {
      toast.error("Please enter a search query.");
    }
  }, [input, setMessages, handleSubmit]);

  const handleSuggestedQuestionClick = useCallback(async (question: string) => {
    setMessages([]);
    setLastSubmittedQuery(question.trim());
    setHasSubmitted(true);
    setSuggestedQuestions([]);
    setIsAnimating(true);
    await append({
      content: question.trim(),
      role: 'user'
    });
  }, [append, setMessages]);

  const handleQueryEdit = useCallback(() => {
    setIsAnimating(true)
    setIsEditingQuery(true);
    setInput(lastSubmittedQuery);
  }, [lastSubmittedQuery, setInput]);

  const handleQuerySubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      setLastSubmittedQuery(input.trim());
      setIsEditingQuery(false);
      setMessages([]);
      setHasSubmitted(true);
      setIsAnimating(true);
      setSuggestedQuestions([]);
      handleSubmit(e);
    } else {
      toast.error("Please enter a search query.");
    }
  }, [input, setMessages, handleSubmit]);

  const exampleQueries = [
    "Weather in Doha",
    "What is new with Grok 2.0?",
    "Count the number of r's in strawberry",
    "Explain Claude 3.5 Sonnet"
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

  return (
    <div className="flex flex-col font-sans items-center justify-center p-2 sm:p-4 bg-background text-foreground transition-all duration-500">
      <Navbar />

      <div className={`w-full max-w-[90%] sm:max-w-2xl space-y-6 p-1 ${hasSubmitted ? 'mt-16 sm:mt-20' : 'mt-[26vh] sm:mt-[30vh]'}`}>
        {!hasSubmitted &&
          <div
            className="text-center"
          >
            <h1 className="text-4xl sm:text-6xl mb-1 text-primary font-serif">MiniPerplx</h1>
            <h2 className='text-xl sm:text-2xl font-serif text-balance text-center mb-6'>
              In search for minimalism and simplicity
            </h2>
          </div>
        }
        <AnimatePresence>
          {!hasSubmitted && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleFormSubmit} className="flex items-center space-x-2 px-2 mb-4 sm:mb-6">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    name="search"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="w-full min-h-12 py-3 px-4 bg-muted border border-input rounded-full pr-12 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 focus-visible:ring-offset-2 text-sm sm:text-base"
                    onFocus={() => setShowExamples(true)}
                    onBlur={() => setShowExamples(false)}
                  />
                  <Button
                    type="submit"
                    size={'icon'}
                    variant={'ghost'}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    disabled={input.length === 0}
                  >
                    <ArrowRight size={20} />
                  </Button>
                </div>
              </form>

              <div className={`mx-auto w-full transition-all ${showExamples ? 'visible' : 'invisible'}`}>
                <div className="bg-background p-2">
                  <div className="flex flex-col items-start space-y-2">
                    {exampleQueries.map((message, index) => (
                      <Button
                        key={index}
                        variant="link"
                        className="h-auto p-0 text-base"
                        name={message}
                        onClick={() => handleExampleClick(message)}
                      >
                        <ArrowRight size={16} className="mr-2 text-muted-foreground" />
                        {message}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <AnimatePresence>
          {hasSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              onAnimationComplete={() => setIsAnimating(false)}
            >
              <div className="flex items-center space-x-2 mb-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <User2 className="size-5 sm:size-6 text-primary flex-shrink-0" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex-grow min-w-0"
                >
                  {isEditingQuery ? (
                    <form onSubmit={handleQuerySubmit} className="flex items-center space-x-2">
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
                          setIsEditingQuery(false)
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xl sm:text-2xl font-medium font-serif truncate">
                            {lastSubmittedQuery}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{lastSubmittedQuery}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </motion.div>
                {!isEditingQuery && (<motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex-shrink-0 flex flex-row items-center gap-2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleQueryEdit}
                    className="ml-2"
                    disabled={isLoading}
                  >
                    <Edit2 size={16} />
                  </Button>
                </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 sm:space-y-6">
          {messages.map((message, index) => (
            <div key={index}>
              {message.role === 'assistant' && message.content && (
                <div className={`${suggestedQuestions.length === 0 ? '!mb-20 sm:!mb-18' : ''}`}>
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
              className="w-full max-w-xl sm:max-w-2xl !mb-20 !sm:mb-18"
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
        {hasSubmitted && !isAnimating && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-4 transform -translate-x-1/2 w-full max-w-[90%] md:max-w-2xl mt-3"
          >
            <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  name="search"
                  placeholder="Ask a new question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="w-full min-h-12 py-3 px-4 bg-muted border border-input rounded-full pr-12 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 focus-visible:ring-offset-2 text-sm sm:text-base"
                />
                <Button
                  type="submit"
                  size={'icon'}
                  variant={'ghost'}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  disabled={input.length === 0}
                >
                  <ArrowRight size={20} />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}