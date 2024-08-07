/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useCallback, useState, useEffect, ReactNode } from 'react';
import { useChat } from 'ai/react';
import { ToolInvocation } from 'ai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchIcon,
  LinkIcon,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  FastForward,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
      <Card key={index} className="mb-4 border border-muted">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
            <div className='flex items-center gap-2'>
              {result ? <Check className="h-5 w-5 text-green-500" /> : <Loader2 className="h-5 w-5 text-primary animate-spin" />}
              <span className="text-sm sm:text-base">{result ? 'Used' : 'Using'} {toolInvocation.toolName === 'web_search' ? 'Web Search' : toolInvocation.toolName}</span>
            </div>
            <Button
              onClick={() => setShowToolResults(prev => ({ ...prev, [index]: !prev[index] }))}
              className='ml-2 text-xs sm:text-sm'
              variant="secondary"
            >
              {showToolResults[index] ? 'Hide Results' : 'Show Results'}
              {showToolResults[index] ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {args?.query && (
            <Badge variant="secondary" className="mb-2 text-xs sm:text-sm">
              <SearchIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {args.query}
            </Badge>
          )}

          {showToolResults[index] && result && (
            <ScrollArea className="h-[200px] sm:h-[300px] w-full rounded-md border border-muted p-2 sm:p-4 mt-2">
              {result.results.map((item: any, itemIndex: number) => (
                <div key={itemIndex} className="mb-4 pb-4 border-b last:border-b-0">
                  <h3 className="text-sm sm:text-lg font-semibold mb-1 text-secondary-foreground">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{item.content}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center"
                  >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    <span className="truncate">{item.url}</span>
                  </a>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCitation = (citationText: string, citationLink: string, index: number) => {
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(citationLink).hostname}`;

    return (
      <HoverCard key={index}>
        <HoverCardTrigger asChild>
          <span className="cursor-help text-blue-500 hover:underline">
            {citationText}
            <sup>[{index + 1}]</sup>
          </span>
        </HoverCardTrigger>
        <HoverCardContent className="flex items-center gap-2 p-2 max-w-xs bg-card text-card-foreground">
          <img src={faviconUrl} alt="Favicon" className="w-4 h-4 flex-shrink-0" />
          <a href={citationLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate">
            {citationLink}
          </a>
        </HoverCardContent>
      </HoverCard>
    );
  };

  const renderMarkdown = (content: string) => {
    const citationRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const boldRegex = /\*\*(.*?)\*\*/g; // Bold
    const italicRegex = /\*(.*?)\*/g; // Italic
    const unorderedListRegex = /^-\s+(.*)$/gm; // Unordered list
    const orderedListRegex = /^\d+\.\s+(.*)$/gm; // Ordered list
    const headingRegex = /^(#{1,6})\s+(.*)$/gm; // Headings
    const parts: (string | ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    // Replace bold and italic
    content = content
      .replace(boldRegex, '<strong>$1</strong>')
      .replace(italicRegex, '<em>$1</em>');

    // Remove double new lines
    content = content.replace("\n\n", "")

    // Replace unordered and ordered lists
    content = content
      .replace(unorderedListRegex, '<li class="list-disc ml-6">$1</li>')
      .replace(orderedListRegex, '<li class="list-decimal ml-6">$1</li>');

    // Replace headings
    content = content.replace(headingRegex, (match, hashes, headingText) => {
      const level = hashes.length; // Determine heading level
      return `<h${level} class="text-${level === 1 ? '3xl' : level === 2 ? '2xl' : 'xl'} font-bold mb-1">${headingText}</h${level}>`;
    });

    // Add list wrapping
    const wrappedContent = content.split(/(<li.*?<\/li>)/g).map((item, index) => {
      if (item.startsWith('<li')) {
        return `<ul>${item}</ul>`;
      }
      return item;
    }).join('');

    // Parse citations and add to parts
    while ((match = citationRegex.exec(wrappedContent)) !== null) {
      // Add text before the citation
      if (match.index > lastIndex) {
        parts.push(wrappedContent.slice(lastIndex, match.index));
      }

      const citationText = match[1];
      const citationLink = match[2];
      parts.push(renderCitation(citationText, citationLink, parts.length)); // Adjusting index for key

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last citation
    if (lastIndex < wrappedContent.length) {
      parts.push(wrappedContent.slice(lastIndex));
    }

    return (
      <span>
        {parts.map((part, index) => {
          if (typeof part === 'string') {
            const lines = part.split('\n');
            return lines.map((line, lineIndex) => (
              <React.Fragment key={`${index}-${lineIndex}`}>
                <span dangerouslySetInnerHTML={{ __html: line }} />
                {lineIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ));
          }
          return <React.Fragment key={index}>{part}</React.Fragment>; // Render citations
        })}
      </span>
    );
  };


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
      <div className={`w-full max-w-xl sm:max-w-2xl space-y-4 sm:space-y-6 ${hasSubmitted ? 'mt-16 sm:mt-20' : 'mt-[15vh] sm:mt-[20vh]'}`}>
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
              <div className="relative mb-4">
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

              <form onSubmit={handleFormSubmit} className="flex items-center space-x-2 mb-4 sm:mb-6">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    name="search"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-10 py-3 px-4 bg-gray-100 rounded-full pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  />
                  <Button
                    size="icon"
                    type="submit"
                    variant="ghost"
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-transparent"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Button>
                </div>
              </form>

              <div className="flex flex-col gap-2 text-left items-start justify-start">
                {exampleQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(query)}
                    className="mb-1 hover:underline flex flex-row"
                  >
                    <ArrowRight className="w-5 h-5 mr-1" />
                    {query}
                  </button>
                ))}
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
                  className="text-lg sm:text-2xl font-medium font-serif"
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

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-4 sm:space-y-6"
          >
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {message.role === 'assistant' && message.content && (
                  <Card className="bg-card text-card-foreground border border-muted !mb-8 sm:!mb-16">
                    <CardContent className="p-3 sm:p-4">
                      <h2 className="text-lg sm:text-xl font-semibold mb-2">Answer</h2>
                      <div className="text-sm sm:text-base">
                        {renderMarkdown(message.content)}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {message.toolInvocations?.map((toolInvocation: ToolInvocation, toolIndex: number) => (
                  <motion.div
                    key={`tool-${toolIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (index + toolIndex) * 0.1 + 0.2 }}
                  >
                    {renderToolInvocation(toolInvocation, toolIndex)}
                  </motion.div>
                ))}
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </motion.div>
        </AnimatePresence>
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
                  className="w-full h-10 py-3 px-4 bg-gray-100 rounded-full pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <Button
                  size="icon"
                  type="submit"
                  variant="ghost"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-transparent"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}