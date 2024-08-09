/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useCallback, useState, useEffect, ReactNode, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from 'ai/react';
import { ToolInvocation } from 'ai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchIcon,
  LinkIcon,
  Loader2,
  ChevronDown,
  FastForward,
  Sparkles,
  ArrowRight,
  Globe
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showToolResults, setShowToolResults] = useState<{ [key: number]: boolean }>({});
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Speed');
  const [showExamples, setShowExamples] = useState(false)

  const { isLoading, input, messages, setInput, append, handleSubmit, setMessages } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel === 'Speed' ? 'gpt-4o-mini' : selectedModel === 'Quality (GPT)' ? 'gpt-4o' : 'claude-3-5-sonnet-20240620',
    },
    maxToolRoundtrips: 1,
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("An error occurred. Please try again.");
    },
  });

  const models = [
    { name: 'Speed', description: 'High speed, but lower quality.', details: '(OpenAI/GPT-4o-mini)', icon: FastForward },
    { name: 'Quality (GPT)', description: 'Speed and quality, balanced.', details: '(OpenAI/GPT | Optimized)', icon: Sparkles },
    { name: 'Quality (Claude)', description: 'High quality generation.', details: '(Anthropic/Claude-3.5-Sonnet)', icon: Sparkles },
  ];

  const renderToolInvocation = (toolInvocation: ToolInvocation, index: number) => {
    const args = JSON.parse(JSON.stringify(toolInvocation.args));
    const result = 'result' in toolInvocation ? JSON.parse(JSON.stringify(toolInvocation.result)) : null;
  
    return (
      <Accordion type="single" collapsible className="w-full mt-4">
        <AccordionItem value={`item-${index}`}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <Globe className="h-5 w-5 text-primary" />
                <span>Web Search</span>
              </div>
              {!result && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Searching the web...</span>
                </div>
              )}
              {result && (
                <Badge variant="secondary" className='mr-1'>{result.results.length} results</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {args?.query && (
              <Badge variant="secondary" className="mb-2 text-xs sm:text-sm">
                <SearchIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {args.query}
              </Badge>
            )}
            {result && (
              <ScrollArea className="h-[300px] w-full rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  {result.results.map((item: any, itemIndex: number) => (
                    <Card key={itemIndex} className="flex flex-col h-full shadow-none">
                      <CardHeader className="pb-2">
                        {/* favicon here */}
                        <img src={`https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}`} alt="Favicon" className="w-5 h-5 flex-shrink-0 rounded-full" />
                        <CardTitle className="text-sm font-semibold line-clamp-2">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-xs text-muted-foreground line-clamp-3">{item.content}</p>
                      </CardContent>
                      <div className="px-6 py-2 bg-muted rounded-b-xl">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center"
                        >
                          ↪
                          <span className="truncate">{item.url}</span>
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  const renderCitation = (citationText: string, citationLink: string, index: number) => {
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(citationLink).hostname}`;

    return (
      <HoverCard key={index}>
        <HoverCardTrigger asChild>
          <span className="cursor-help text-primary py-0.5 px-2 m-0 bg-secondary rounded-full">
            {index + 1}
          </span>
        </HoverCardTrigger>
        <HoverCardContent className="flex items-center gap-1 !p-0 !px-0.5 max-w-xs bg-card text-card-foreground !m-0 h-6 rounded-xl">
          <img src={faviconUrl} alt="Favicon" className="w-4 h-4 flex-shrink-0 rounded-full" />
          <a href={citationLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary no-underline truncate">
            {citationLink}
          </a>
        </HoverCardContent>
      </HoverCard>
    );
  };

  const CitationComponent: React.FC<{ href: string; children: ReactNode; index: number }> = React.memo(({ href, children, index }) => {
    const citationText = Array.isArray(children) ? children[0] : children;

    return renderCitation(citationText as string, href, index);
  });

  CitationComponent.displayName = "CitationComponent";

  const MarkdownRenderer: React.FC<{ content: string }> = React.memo(({ content }) => {
    const citationLinks = useMemo(() => {
      return [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(([_, text, link]) => ({
        text,
        link,
      }));
    }, [content]); // Recompute only if content changes

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className="prose text-sm sm:text-base text-pretty text-left"
        components={{
          a: ({ href, children }) => {
            const index = citationLinks.findIndex((link: { link: string | undefined; }) => link.link === href);
            return index !== -1 ? (
              <CitationComponent href={href as string} index={index}>
                {children}
              </CitationComponent>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {children}
              </a>
            );
          },
        }}
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
  }, [messages]);

  const handleExampleClick = useCallback(async (query: string) => {
    setLastSubmittedQuery(query.trim());
    setHasSubmitted(true);
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
      handleSubmit(e);
      setHasSubmitted(true);
      setIsAnimating(true);
      setShowToolResults({});
    } else {
      toast.error("Please enter a search query.");
    }
  }, [input, setMessages, handleSubmit]);

  const exampleQueries = [
    "Best programming languages in 2024",
    "How to build a responsive website",
    "Latest trends in AI technology",
    "OpenAI GPT-4o mini"
  ];

  return (
    <div className="flex flex-col font-sans items-center min-h-screen p-2 sm:p-4 bg-background text-foreground transition-all duration-500">
      <div className={`w-full max-w-xl sm:max-w-2xl space-y-4 sm:space-y-6 p-1 ${hasSubmitted ? 'mt-16 sm:mt-20' : 'mt-[15vh] sm:mt-[20vh]'}`}>
        <motion.div
          initial={false}
          animate={hasSubmitted ? { scale: 1.2 } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl mb-4 sm:mb-8 text-primary font-serif">MiniPerplx</h1>
          {!hasSubmitted &&
            <h2 className='text-xl sm:text-2xl font-serif text-balance text-center mb-2'>
              A minimalistic AI-powered search engine that helps you find information on the internet.
            </h2>
          }
        </motion.div>

        <AnimatePresence>
          {!hasSubmitted && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative px-2 mb-4">
                <button
                  onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                  className={`flex items-center font-semibold ${models.find((model) => model.name === selectedModel)?.name.includes('Quality') ? 'text-purple-500' : 'text-green-500'} focus:outline-none focus:ring-0 `}
                >
                  {selectedModel === 'Speed' && <FastForward className="w-5 h-5 mr-2" />}
                  {(selectedModel === 'Quality (GPT)' || selectedModel === 'Quality (Claude)') && <Sparkles className="w-5 h-5 mr-2" />}
                  {selectedModel}
                  <ChevronDown className={`w-5 h-5 ml-2 transform transition-transform ${isModelSelectorOpen ? 'rotate-180' : ''}`} />
                </button>
                {isModelSelectorOpen && (
                  <div className="absolute top-full left-0 mt-2 w-fit bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {models.map((model) => (
                      <button
                        key={model.name}
                        onClick={() => {
                          setSelectedModel(model.name);
                          setIsModelSelectorOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                      >
                        <model.icon className={`w-5 h-5 mr-3 ${model.name.includes('Quality') ? 'text-purple-500' : 'text-green-500'}`} />
                        <div>
                          <div className="font-semibold flex items-center">
                            {model.name}
                            {selectedModel === model.name && (
                              <span
                                className={`ml-2 text-xs text-white px-2 py-0.5 rounded-full ${model.name.includes('Quality') ? 'bg-purple-500' : 'bg-green-500'}`}
                              >
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{model.description}</div>
                          <div className="text-xs text-gray-400">{model.details}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleFormSubmit} className="flex items-center space-x-2 px-2 mb-4 sm:mb-6">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    name="search"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="w-full min-h-12 py-3 px-4 bg-muted border border-input rounded-full pr-12 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-sm sm:text-base"
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
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-2xl font-medium font-serif"
                >
                  {lastSubmittedQuery}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Badge
                    variant="secondary"
                    className={`text-xs sm:text-sm ${selectedModel.includes('Quality') ? 'bg-purple-500 hover:bg-purple-500' : 'bg-green-500 hover:bg-green-500'} text-white`}
                  >
                    {selectedModel === 'Speed' && <FastForward className="w-4 h-4 mr-1" />}
                    {selectedModel === 'Quality (GPT)' && <Sparkles className="w-4 h-4 mr-1" />}
                    {selectedModel === 'Quality (Claude)' && <Sparkles className="w-4 h-4 mr-1" />}
                    {selectedModel}
                  </Badge>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 sm:space-y-6">
          {messages.map((message, index) => (
            <div key={index}>
              {message.role === 'assistant' && message.content && (
                <div
                  className='!mb-20 sm:!mb-18'
                >
                  <div
                    className='flex items-center gap-2 mb-2'
                  >
                    <Sparkles className="size-4 sm:size-5 text-primary" />
                    <h2 className="text-lg font-semibold">Answer</h2>
                  </div>
                  <div className="text-sm">
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
          <div ref={bottomRef} />
        </div>
      </div>

      <AnimatePresence>
        {hasSubmitted && !isAnimating && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-4 transform -translate-x-1/2 w-full max-w-[90%] sm:max-w-md md:max-w-2xl mt-3"
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
                  className="w-full min-h-12 py-3 px-4 bg-muted border border-input rounded-full pr-12 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-sm sm:text-base"
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