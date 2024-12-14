/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Clock, Globe, ImageIcon, Newspaper, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchImage = {
    url: string;
    description: string;
};

type SearchResult = {
    url: string;
    title: string;
    content: string;
    raw_content: string;
    published_date?: string;
};

type SearchQueryResult = {
    query: string;
    results: SearchResult[];
    images: SearchImage[];
};

type MultiSearchResponse = {
    searches: SearchQueryResult[];
};

type MultiSearchArgs = {
    queries: string[];
    maxResults: number[];
    topics: ("general" | "news")[];
    searchDepth: ("basic" | "advanced")[];
};

interface ResultCardProps {
    result: SearchResult;
    index: number;
}

interface GalleryProps {
    images: SearchImage[];
    onClose: () => void;
}

interface SearchResultsProps {
    searchData: SearchQueryResult;
    topicType: string;
    onImageClick: (index: number) => void;
}

const SearchQueryTab: React.FC<{ query: string; count: number; isActive: boolean }> = ({ query, count, isActive }) => (
    <div className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <span className="text-sm font-medium truncate max-w-[120px]">{query}</span>
        <Badge variant="secondary" className={isActive ? 'dark:bg-white/20 dark:text-white bg-gray-200 text-gray-700' : 'dark:bg-neutral-800 bg-gray-100'}>
            {count}
        </Badge>
    </div>
);

const ResultCard: React.FC<ResultCardProps> = ({ result, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative flex flex-col w-[280px] dark:bg-neutral-900 bg-white rounded-xl dark:border-neutral-800 border-gray-200 border overflow-hidden flex-shrink-0"
        >
            <div className="flex items-start gap-3 p-3">
                <div className="w-8 h-8 rounded-lg dark:bg-neutral-800 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <img
                        src={`https://www.google.com/s2/favicons?sz=128&domain=${new URL(result.url).hostname}`}
                        alt=""
                        className="w-5 h-5"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium dark:text-neutral-100 text-gray-900 line-clamp-2 leading-tight">
                        {result.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                        <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs dark:text-neutral-400 text-gray-500 hover:text-gray-700 dark:hover:text-neutral-300 flex items-center gap-1"
                        >
                            {new URL(result.url).hostname}
                            <ArrowUpRight className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="px-3 pb-3">
                <p className="text-sm dark:text-neutral-300 text-gray-600 line-clamp-3 leading-relaxed">
                    {result.content}
                </p>
            </div>

            {result.published_date && (
                <div className="px-3 py-2 mt-auto border-t dark:border-neutral-800 border-gray-200 dark:bg-neutral-900/50 bg-gray-50">
                    <time className="text-xs dark:text-neutral-500 text-gray-500 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(result.published_date).toLocaleDateString()}
                    </time>
                </div>
            )}
        </motion.div>
    );
};

const ImageGrid: React.FC<{ images: SearchImage[]; onImageClick: (index: number) => void }> = ({ images, onImageClick }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        {images.slice(0, 4).map((image, index) => (
            <motion.div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => onImageClick(index)}
                whileHover={{ scale: 1.02 }}
            >
                <img
                    src={image.url}
                    alt={image.description}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="absolute bottom-2 left-2 right-2 text-xs text-white line-clamp-2">
                        {image.description}
                    </p>
                </div>
                {index === 3 && images.length > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-xl font-medium text-white">+{images.length - 4}</span>
                    </div>
                )}
            </motion.div>
        ))}
    </div>
);

const SearchResults: React.FC<SearchResultsProps> = ({ searchData, topicType, onImageClick }) => (
    <div className="space-y-6">
        <Accordion type="single" defaultValue="web-results" collapsible>
            <AccordionItem value="web-results" className="border-0">
                <AccordionTrigger 
                    className={cn(
                        "w-full dark:bg-neutral-900 bg-white rounded-xl dark:border-neutral-800 border-gray-200 border px-6 py-4 hover:no-underline transition-all",
                        "[&[data-state=open]]:rounded-b-none",
                        "[&[data-state=open]]:border-b-0"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg dark:bg-neutral-800 bg-gray-100">
                            <Globe className="h-4 w-4 dark:text-neutral-400 text-gray-500" />
                        </div>
                        <div>
                            <h2 className="dark:text-neutral-100 text-gray-900 font-medium text-left">
                                Results for {searchData.query}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="dark:bg-neutral-800 bg-gray-100 dark:text-neutral-300 text-gray-600">
                                    {topicType}
                                </Badge>
                                <span className="text-xs dark:text-neutral-500 text-gray-500">
                                    {searchData.results.length} results
                                </span>
                            </div>
                        </div>
                    </div>
                </AccordionTrigger>

                <AccordionContent className="dark:bg-neutral-900 bg-white dark:border-neutral-800 border-gray-200 border border-t-0 rounded-b-xl">
                    <div className="flex overflow-x-auto gap-3 p-3 no-scrollbar">
                        {searchData.results.map((result, index) => (
                            <ResultCard key={index} result={result} index={index} />
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* Original Image Results Section */}
        {searchData.images.length > 0 && (
            <div className="dark:bg-neutral-900 bg-white rounded-xl dark:border-neutral-800 border-gray-200 border">
                <div className="p-4 border-b dark:border-neutral-800 border-gray-200">
                    <div className="flex items-center gap-3">
                        <ImageIcon className="h-5 w-5 dark:text-neutral-400 text-gray-500" />
                        <h3 className="dark:text-neutral-100 text-gray-900 font-medium">Related Images</h3>
                    </div>
                </div>
                <ImageGrid images={searchData.images} onImageClick={onImageClick} />
            </div>
        )}
    </div>
);

const MultiSearch: React.FC<{ result: MultiSearchResponse | null; args: MultiSearchArgs }> = ({ result, args }) => {
    const [activeTab, setActiveTab] = useState("0");
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [selectedSearch, setSelectedSearch] = useState(0);
    const [selectedImage, setSelectedImage] = useState(0);

    // Replace the current loading state in MultiSearch component with this:
    if (!result) {
        return (
            <div className="flex items-center justify-between w-full dark:bg-neutral-900 bg-white rounded-xl dark:border-neutral-800 border-gray-200 border p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg dark:bg-neutral-800 bg-gray-100">
                        <Globe className="h-5 w-5 dark:text-neutral-400 text-gray-500 animate-spin" />
                    </div>
                    <div className="flex flex-col">
                        <span className="dark:text-neutral-100 text-gray-900 font-medium">
                            Running searches...
                        </span>
                        <span className="text-sm dark:text-neutral-500 text-gray-500">
                            Processing {args.queries.length} queries
                        </span>
                    </div>
                </div>
                <motion.div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 dark:text-neutral-400 text-gray-500" />
                    <div className="flex gap-1">
                        {[0, 1, 2].map((index) => (
                            <motion.div
                                key={index}
                                className="w-2 h-2 rounded-full dark:bg-neutral-700 bg-gray-300"
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
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="relative w-full">
                    <div className="w-full overflow-y-scroll">
                        <TabsList className="inline-flex h-auto gap-2 dark:bg-inherit bg-white p-0 m-0">
                            {result.searches.map((search, index) => (
                                <TabsTrigger
                                    key={index}
                                    value={index.toString()}
                                    className="flex-shrink-0 px-3 py-2 rounded-xl !shadow-none border transition-all data-[state=active]:dark:bg-neutral-800 data-[state=active]:border-neutral-400 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200"
                                >
                                    <SearchQueryTab
                                        query={search.query}
                                        count={search.results.length}
                                        isActive={activeTab === index.toString()}
                                    />
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </div>

                <AnimatePresence>
                    {result.searches.map((search, index) => (
                        <TabsContent key={index} value={index.toString()}>
                            <SearchResults
                                searchData={search}
                                topicType={args.topics[index] || args.topics[0]}
                                onImageClick={(imageIndex) => {
                                    setSelectedSearch(index);
                                    setSelectedImage(imageIndex);
                                    setGalleryOpen(true);
                                }}
                            />
                        </TabsContent>
                    ))}
                </AnimatePresence>
            </Tabs>

            {galleryOpen && result.searches[selectedSearch].images && (
                <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
                    <DialogTitle className='sr-only'>Image Gallery</DialogTitle>
                    <DialogContent className="max-w-3xl max-h-[85vh] p-0 dark:bg-neutral-900 bg-white dark:border-neutral-800 border-gray-200 !font-sans">
                        <div className="relative w-full h-full">
                            <div className="absolute right-3 top-3 z-50 flex items-center gap-2">
                                <span className="px-2 py-1 rounded-md dark:bg-neutral-800 bg-gray-100 text-xs dark:text-neutral-300 text-gray-600">
                                    {selectedImage + 1} / {result.searches[selectedSearch].images.length}
                                </span>
                                <button
                                    onClick={() => setGalleryOpen(false)}
                                    className="p-1.5 rounded-md dark:bg-neutral-800 bg-gray-100 dark:text-neutral-400 text-gray-500 hover:text-gray-700 dark:hover:text-neutral-200"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="relative w-full h-full">
                                <img
                                    src={result.searches[selectedSearch].images[selectedImage].url}
                                    alt={result.searches[selectedSearch].images[selectedImage].description}
                                    className="max-h-[70vh] object-contain rounded-md mx-auto p-4"
                                />
                                {result.searches[selectedSearch].images[selectedImage].description && (
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-md">
                                        <p className="text-xs text-white text-center bg-black/50 p-1 rounded">
                                            {result.searches[selectedSearch].images[selectedImage].description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="absolute inset-y-0 left-0 flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 ml-2 dark:bg-neutral-800 bg-gray-100 dark:hover:bg-neutral-700 hover:bg-gray-200"
                                    onClick={() => setSelectedImage(prev =>
                                        prev === 0 ? result.searches[selectedSearch].images.length - 1 : prev - 1
                                    )}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="absolute inset-y-0 right-0 flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 mr-2 dark:bg-neutral-800 bg-gray-100 dark:hover:bg-neutral-700 hover:bg-gray-200"
                                    onClick={() => setSelectedImage(prev =>
                                        prev === result.searches[selectedSearch].images.length - 1 ? 0 : prev + 1
                                    )}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default MultiSearch;