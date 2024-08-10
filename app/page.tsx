/* eslint-disable @next/next/no-img-element */
"use client";

import
React,
{
  useRef,
  useCallback,
  useState,
  useEffect,
  useMemo
} from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from 'ai/react';
import { ToolInvocation } from 'ai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { suggestQuestions, Message } from './actions';
import {
  SearchIcon,
  ChevronDown,
  FastForward,
  Sparkles,
  ArrowRight,
  Globe,
  AlignLeft,
  Newspaper
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Speed');
  const [showExamples, setShowExamples] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newSelectedModel, setNewSelectedModel] = useState('');

  const { isLoading, input, messages, setInput, append, reload, handleSubmit, setMessages } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel === 'Speed' ? 'gpt-4o-mini' : selectedModel === 'Quality (GPT)' ? 'gpt-4o' : 'claude-3-5-sonnet-20240620',
    },
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
      toast.error("An error occurred. Please try again.");
    },
  });

  const models = [
    { name: 'Speed', description: 'High speed, but lower quality.', details: '(OpenAI/GPT-4o-mini)', icon: FastForward },
    { name: 'Quality (GPT)', description: 'Speed and quality, balanced.', details: '(OpenAI/GPT | Optimized)', icon: Sparkles },
    { name: 'Quality (Claude)', description: 'High quality generation.', details: '(Anthropic/Claude-3.5-Sonnet)', icon: Sparkles },
  ];

  const handleModelChange = (value: string) => {
    if (hasSubmitted) {
      setNewSelectedModel(value);
      setShowConfirmModal(true);
    } else {
      setSelectedModel(value);
    }
  };

  const handleConfirmModelChange = () => {
    setSelectedModel(newSelectedModel);
    setShowConfirmModal(false);
    setSuggestedQuestions([]);
    reload({
      body: {
        model: newSelectedModel === 'Speed' ? 'gpt-4o-mini' : newSelectedModel === 'Quality (GPT)' ? 'gpt-4o' : 'claude-3-5-sonnet-20240620',
      },
    });
  };

  interface ModelSelectorProps {
    selectedModel: string;
    onModelSelect: (model: string) => void;
  }

  function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center p-0 px-2 rounded-full ${selectedModel.includes('Quality') ? 'bg-purple-500 hover:bg-purple-400 !disabled:bg-purple-600 disabled:!opacity-85' : 'bg-green-500 hover:bg-green-400 disabled:!bg-green-600 disabled:!opacity-85'} text-white hover:text-white`}
            disabled={isLoading}
          >
            {selectedModel === 'Speed' && <FastForward className="w-5 h-5 mr-2" />}
            {selectedModel.includes('Quality') && <Sparkles className="w-5 h-5 mr-2" />}
            {selectedModel}
            <ChevronDown className={`w-5 h-5 ml-2 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='mr-2'>
          {models.map((model) => (
            <DropdownMenuItem
              key={model.name}
              onSelect={() => onModelSelect(model.name)}
              className="flex items-center p-2 !font-sans"
            >
              <model.icon className={`w-5 h-5 mr-3 ${model.name.includes('Quality') ? 'text-purple-500' : 'text-green-500'}`} />
              <div>
                <div className="font-semibold">{model.name}</div>
                <div className="text-sm text-gray-500">{model.description}</div>
                <div className="text-xs text-gray-400">{model.details}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const renderToolInvocation = (toolInvocation: ToolInvocation, index: number) => {
    const args = JSON.parse(JSON.stringify(toolInvocation.args));
    const result = 'result' in toolInvocation ? JSON.parse(JSON.stringify(toolInvocation.result)) : null;

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

  const CitationComponent: React.FC<CitationComponentProps> = React.memo(({ href, children, index }) => {
    const citationText = Array.isArray(children) ? children[0] : children;
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

  const exampleQueries = [
    "Meta Llama 3.1 405B",
    "Latest on Paris Olympics",
    "What is Github Models?",
    "OpenAI GPT-4o mini"
  ];

  return (
    <div className="flex flex-col font-sans items-center min-h-screen p-2 sm:p-4 bg-background text-foreground transition-all duration-500">
      <div className={`w-full max-w-[90%] sm:max-w-2xl space-y-4 sm:space-y-6 p-1 ${hasSubmitted ? 'mt-16 sm:mt-20' : 'mt-[15vh] sm:mt-[20vh]'}`}>
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
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center ${models.indexOf(model) === 0 ? 'rounded-t-md' : models.indexOf(model) === models.length - 1 ? 'rounded-b-md' : ''}`}
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
                  <ModelSelector selectedModel={selectedModel} onModelSelect={handleModelChange} />
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
                  className={`${suggestedQuestions.length === 0 ? '!mb-20 sm:!mb-18' : ''}`}
                >
                  <div
                    className='flex items-center gap-2 mb-2'
                  >
                    <Sparkles className="size-5 text-primary" />
                    <h2 className="text-base font-semibold">Answer</h2>
                  </div>
                  <div className="">
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
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className='!font-sans'>
          <DialogHeader>
            <DialogTitle>Confirm Model Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the model? This will change the quality of the responses and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
            <Button onClick={handleConfirmModelChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}