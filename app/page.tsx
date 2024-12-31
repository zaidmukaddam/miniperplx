"use client";

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import MovingGradient from "@/components/animata/background/moving-gradient";
import {
  Search,
  Zap,
  Code,
  Cloud,
  Link,
  MapPin,
  Globe,
  Mic,
  ArrowRight,
  Github,
  LucideIcon,
  Server,
  Palette,
  Cpu,
  Menu,
  X,
  BarChart,
  CircleDot,
  ShoppingBasket
} from "lucide-react"
import NextLink from "next/link"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
  useAnimation
} from "framer-motion"
import { cn } from '@/lib/utils';
import { Tweet } from 'react-tweet'
import Image from 'next/image';
import { TweetGrid } from '@/components/ui/tweet-grid';
import { Newspaper, XLogo, YoutubeLogo } from '@phosphor-icons/react';

function BentoCard({
  title,
  icon: Icon,
  description,
  children,
  gradient,
  className,
}: {
  title: string;
  icon: React.ElementType;
  description: string;
  children?: React.ReactNode;
  gradient?: string;
  className?: string;
}) {
  return (
    <MovingGradient
      animated={false}
      className={cn("rounded-md", className)}
      gradientClassName={cn("opacity-10", gradient)}
    >
      <section className="flex h-full flex-col gap-2 p-4">
        <header>
          <div className="mb-2 flex items-center gap-2">
            <Icon size={20} className="sm:w-6 sm:h-6" />
            <p className="text-sm sm:text-md line-clamp-1 font-bold">{title}</p>
          </div>
        </header>
        <div className="flex-1 text-xs sm:text-sm font-medium text-opacity-80">{description}</div>
        {children}
      </section>
    </MovingGradient>
  );
}

const TestimonialSection: React.FC = () => {
  const tweetIds = [
    "1825543755748782500",
    "1825876424755941787",
    "1827580223606669661",
    "1825574082345136506",
    "1825973306924872143",
    "1825821083817103852"
  ];

  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted overflow-hidden">
      <div className="container flex flex-col items-center justify-center px-4 md:px-6">
        <h2 className="font-serif text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-center mb-12">
          What People Are Saying
        </h2>
        <div
          className='justify-center'
        >
          <TweetGrid tweets={tweetIds} />
        </div>

      </div>
    </section>
  );
};

function GetStarted() {
  return (
    <BentoCard
      title="Get Started"
      icon={BarChart}
      description={"Experience the power of minimalistic AI search with MiniPerplx."}
      className="col-span-full sm:col-span-1 sm:row-span-2 dark:text-neutral-950"
      gradient="from-blue-700 via-60% via-blue-600 to-cyan-600"
    >
      <div className="group relative flex cursor-pointer flex-col justify-end rounded-md bg-zinc-900 p-2 text-xl sm:text-2xl md:text-4xl tracking-tight text-gray-100">
        <div className="font-light italic">Try</div>
        <div className="-mt-1 sm:-mt-2 font-bold font-serif">MiniPerplx</div>
        <NextLink href="/search" className="absolute bottom-2 right-2">
          <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full border bg-primary transition-all duration-700 group-hover:rotate-[360deg]">
            <ArrowRight size={14} className="text-background sm:w-4 sm:h-4" />
          </div>
        </NextLink>
        <div className="absolute right-2 top-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary opacity-50 transition-all duration-700 group-hover:opacity-25" />
      </div>
    </BentoCard>
  );
}

function MinimalisticSearch() {
  return (
    <BentoCard
      title="Minimalistic Search"
      icon={Search}
      description="We strip away the clutter to focus on what matters most - delivering accurate and relevant results."
      gradient="from-red-700 via-60% via-red-600 to-rose-600"
      className="group col-span-full sm:col-span-1 dark:text-neutral-950"
    >
      <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
        <div className="flex items-center">
          <CircleDot size={12} className="text-red-400 mr-1 sm:mr-2 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Clean interface</span>
        </div>
        <div className="flex items-center">
          <CircleDot size={12} className="text-red-400 mr-1 sm:mr-2 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Focused results</span>
        </div>
        <div className="flex items-center">
          <CircleDot size={12} className="text-red-400 mr-1 sm:mr-2 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Distraction-free</span>
        </div>
      </div>
    </BentoCard>
  );
}

function AIPowered() {
  return (
    <BentoCard
      title="AI-Powered"
      icon={Code}
      description="Leveraging cutting-edge AI technology to understand and respond to your queries with precision."
      gradient="from-emerald-700 via-60% via-emerald-600 to-green-600"
      className="group col-span-full sm:col-span-1 dark:text-neutral-950"
    >
      <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm">Natural Language</span>
          <div className="w-1/2 bg-emerald-200 rounded-full h-1.5 sm:h-2">
            <div className="bg-emerald-500 h-1.5 sm:h-2 rounded-full" style={{ width: '90%' }}></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm">Context Understanding</span>
          <div className="w-1/2 bg-emerald-200 rounded-full h-1.5 sm:h-2">
            <div className="bg-emerald-500 h-1.5 sm:h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm">Adaptive Learning</span>
          <div className="w-1/2 bg-emerald-200 rounded-full h-1.5 sm:h-2">
            <div className="bg-emerald-500 h-1.5 sm:h-2 rounded-full" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

function LightningFast() {
  return (
    <BentoCard
      title="Lightning Fast"
      icon={Zap}
      description="Designed for speed, MiniPerplx provides instant answers to keep up with your pace of work."
      gradient="from-purple-700 via-60% via-purple-600 to-fuchsia-600"
      className="col-span-full sm:col-span-2 dark:text-neutral-950"
    />
  );
}

const AboutUsSection: React.FC = () => {
  return (
    <section id="about-us" className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 md:px-6">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center mb-8 sm:mb-12">
          About MiniPerplx
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-foreground max-w-5xl mx-auto">
          <GetStarted />
          <MinimalisticSearch />
          <AIPowered />
          <LightningFast />
        </div>
      </div>
    </section>
  );
};


const MarqueeTestimonials: React.FC = () => {
  const testimonials = [
    "Absolutely love MiniPerplx! 🚀",
    "Game-changer for my workflow. 💼",
    "Simplicity at its finest. ✨",
    "Can't imagine working without it now. 🙌",
    "MiniPerplx is a must-have tool! 🛠️",
  ];

  return (
    <div className="bg-primary py-4 overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {testimonials.concat(testimonials).map((text, index) => (
          <span key={index} className="text-white dark:text-black text-xl font-bold mx-8">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <Card className="h-full transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-primary/20 hover:-translate-y-1">
    <CardHeader>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="rounded-full p-2 inline-block"
      >
        <Icon className="w-8 h-8 text-primary" />
      </motion.div>
      <CardTitle className="text-xl sm:text-2xl mt-4">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

interface Star {
  x: number;
  y: number;
  size: number;
  name: string;
  category: string;
}

const TechConstellation: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([])
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const constellationRef = useRef<HTMLDivElement>(null)

  const techStack = [
    {
      category: "Core Technologies",
      icon: Server,
      items: ["Next.js", "React", "TypeScript", "Vercel AI SDK", "Tailwind CSS"]
    },
    {
      category: "UI & Styling",
      icon: Palette,
      items: ["shadcn/ui", "Framer Motion", "Lucide Icons"]
    },
    {
      category: "AI Services & APIs",
      icon: Cpu,
      items: ["Azure OpenAI", "Tavily AI", "e2b.dev", "OpenWeatherMap", "Google Maps API", "Firecrawl"]
    }
  ];

  useEffect(() => {
    if (constellationRef.current) {
      const { width, height } = constellationRef.current.getBoundingClientRect()
      const newStars: Star[] = []
      const centerX = width / 2
      const centerY = height / 2
      const maxRadius = Math.min(width, height) * 0.4 // 40% of the smaller dimension

      techStack.forEach((category, categoryIndex) => {
        const categoryAngle = (categoryIndex / techStack.length) * Math.PI * 2
        const categoryRadius = maxRadius * 0.8 // 80% of maxRadius for category centers

        const categoryCenterX = centerX + Math.cos(categoryAngle) * categoryRadius
        const categoryCenterY = centerY + Math.sin(categoryAngle) * categoryRadius

        category.items.forEach((item, index) => {
          const itemAngle = categoryAngle + (index / category.items.length - 0.5) * Math.PI * 0.5
          const itemRadius = Math.random() * maxRadius * 0.3 + maxRadius * 0.1 // Between 10% and 40% of maxRadius

          const x = categoryCenterX + Math.cos(itemAngle) * itemRadius
          const y = categoryCenterY + Math.sin(itemAngle) * itemRadius

          newStars.push({
            x,
            y,
            size: Math.random() * 2 + 2,
            name: item,
            category: category.category
          })
        })
      })

      setStars(newStars)
    }
  }, [])

  const getStarColor = (category: string) => {
    switch (category) {
      case "Core Technologies":
        return "#FFD700"
      case "UI & Styling":
        return "#00CED1"
      case "AI Services & APIs":
        return "#FF69B4"
      default:
        return "#FFFFFF"
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative w-full h-[600px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg overflow-hidden" ref={constellationRef}>
        <AnimatePresence>
          {stars.map((star, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <motion.div
                  className="absolute rounded-full cursor-pointer"
                  style={{
                    left: star.x,
                    top: star.y,
                    width: star.size,
                    height: star.size,
                    backgroundColor: getStarColor(star.category),
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ scale: 2, boxShadow: `0 0 10px ${getStarColor(star.category)}` }}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="border-none p-2 rounded-lg shadow-lg"
                style={{
                  backgroundColor: getStarColor(star.category),
                  color: star.category === "Core Technologies" ? "#000" : "#fff"
                }}
              >
                <div className="text-sm font-bold">{star.name}</div>
                <div className="text-xs opacity-80">{star.category}</div>
              </TooltipContent>
            </Tooltip>
          ))}
        </AnimatePresence>
        {hoveredCategory && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {stars
              .filter((star) => star.category === hoveredCategory)
              .map((star, index, filteredStars) => {
                const nextStar = filteredStars[(index + 1) % filteredStars.length]
                return (
                  <motion.line
                    key={index}
                    x1={star.x}
                    y1={star.y}
                    x2={nextStar.x}
                    y2={nextStar.y}
                    stroke={getStarColor(star.category)}
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                )
              })}
          </svg>
        )}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {techStack.map((category, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 text-white cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onMouseEnter={() => setHoveredCategory(category.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getStarColor(category.category) }} />
              <span>{category.category}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, className, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const TryButton: React.FC = () => {
  return (
    <NextLink
      href="/search"
      className={cn(
        "rounded-full bg-zinc-800 hover:bg-zinc-800/90 transition hover:scale-105 hover:rotate-3 px-6 py-3 flex gap-x-2 items-center justify-center text-white font-semibold w-fit h-fit",
        "homeBtn"
      )}
    >
      Try MiniPerplx
      <ArrowRight width={20} height={20} />
    </NextLink>
  )
}

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
      style={{ scaleX }}
    />
  )
}

const FloatingIcon: React.FC<{ Icon: LucideIcon }> = ({ Icon }) => (
  <motion.div
    className="absolute text-primary opacity-10"
    initial={{ x: `${Math.random() * 100}vw`, y: -50 }}
    animate={{
      y: '100vh',
      rotate: Math.random() * 360,
    }}
    transition={{
      duration: Math.random() * 20 + 10,
      repeat: Infinity,
      ease: "linear",
    }}
  >
    <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
  </motion.div>
)

const FloatingIcons: React.FC = () => {
  const icons = [Search, Zap, Code, Cloud, Link, MapPin, Globe, Mic, Github, XLogo, Newspaper, YoutubeLogo]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="hidden sm:block">
        {icons.map((Icon, index) => (
          <FloatingIcon key={index} Icon={Icon} />
        ))}
      </div>
      <div className="sm:hidden">
        {icons.slice(0, 4).map((Icon, index) => (
          <FloatingIcon key={index} Icon={Icon} />
        ))}
      </div>
    </div>
  )
}


const NavItem: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <NextLink
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          {children}
        </NextLink>
      </NavigationMenuLink>
    </li>
  )
}


const MobileNavItem: React.FC<{ href: string; children: React.ReactNode; onClick: () => void }> = ({ href, children, onClick }) => {
  return (
    <li>
      <NextLink
        href={href}
        className="block py-2 text-foreground hover:text-primary transition-colors"
        onClick={onClick}
      >
        {children}
      </NextLink>
    </li>
  )
}

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50])

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)


  const [mounted, setMounted] = useState<boolean>(false)
  useEffect(() => setMounted(true), [])
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  if (!mounted) return null

  const features = [
    { icon: Globe, title: "Web Search", description: "Powered by Tavily AI for comprehensive web results." },
    { icon: Code, title: "Code Interpreter", description: "Utilize e2b.dev for advanced code interpretation and execution." },
    { icon: Cloud, title: "Weather Forecast", description: "Get accurate weather information via OpenWeatherMap." },
    { icon: YoutubeLogo, title: "Youtube Search", description: "Summarize web content quickly with FireCrawl's Scrape API." },
    { icon: XLogo, title: "Search X Posts", description: "Search for posts on X.com" },
    { icon: Newspaper, title: "Research Paper Search", description: "Search for research papers on arXiv and more" },
    { icon: MapPin, title: "Location Search", description: "Find places and nearby locations using Google Maps API, Mapbox and TripAdvisior API." },
    { icon: Mic, title: "Translation & TTS", description: "Translate text and convert to speech with Elevenlabs TTS and Microsoft's Translation API." },
    { icon: ShoppingBasket, title: "Product Search", description: "Search for products on Amazon." },
  ]

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans" id='start'>
      <ScrollProgress />
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between sm:justify-center sm:gap-5 sticky top-0 bg-background/80 backdrop-blur-sm z-40">
        <NextLink className="flex items-center justify-center group" href="#start">
          <span className="font-serif font-bold text-xl group-hover:text-primary transition-colors tracking-tight">MiniPerplx</span>
        </NextLink>
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="p-4 space-y-2 grid grid-cols-2 max-w-sm w-[400px]">
                  <NavItem href="#about-us">
                    <div className="text-sm font-medium">About Us</div>
                    <p className="text-sm text-muted-foreground">Learn more about MiniPerplx and our mission.</p>
                  </NavItem>
                  <NavItem href="#features">
                    <div className="text-sm font-medium">Features</div>
                    <p className="text-sm text-muted-foreground">Discover the powerful capabilities of MiniPerplx.</p>
                  </NavItem>
                  <NavItem href="#tech-stack">
                    <div className="text-sm font-medium">Tech Stack</div>
                    <p className="text-sm text-muted-foreground">Explore the technologies powering MiniPerplx.</p>
                  </NavItem>
                  <NavItem href="#testimonials">
                    <div className="text-sm font-medium">Testimonials</div>
                    <p className="text-sm text-muted-foreground">See what others are saying about MiniPerplx.</p>
                  </NavItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NextLink href="#try-it" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Try It
                </NavigationMenuLink>
              </NextLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 bg-background border-b border-border z-30 md:hidden overflow-hidden"
          >
            <nav className="container px-4 py-4">
              <ul className="space-y-4">
                <MobileNavItem href="#about-us" onClick={() => setIsMenuOpen(false)}>About Us</MobileNavItem>
                <MobileNavItem href="#features" onClick={() => setIsMenuOpen(false)}>Features</MobileNavItem>
                <MobileNavItem href="#tech-stack" onClick={() => setIsMenuOpen(false)}>Tech Stack</MobileNavItem>
                <MobileNavItem href="#testimonials" onClick={() => setIsMenuOpen(false)}>Testimonials</MobileNavItem>
                <MobileNavItem href="#try-it" onClick={() => setIsMenuOpen(false)}>Try It</MobileNavItem>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <section className="w-full py-48 bg-gradient-to-b from-background f to-muted relative overflow-hidden">
          <FloatingIcons />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center space-y-4">
              <motion.h1
                className="font-serif font-bold text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-black dark:bg-white leading-[1.1] tracking-tight pb-2"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                Introducing MiniPerplx
              </motion.h1>
              <motion.p
                className="mx-auto max-w-[700px] text-muted-foreground dark:text-neutral-200 text-xl md:text-2xl text-balance font-serif tracking-normal"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                A minimalistic AI search engine designed to deliver answers in the simplest and most elegant way possible.✨
              </motion.p>
              <motion.div
                className="flex flex-col items-center space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <TryButton />
                </motion.div>
                <motion.div
                  className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4"
                  variants={itemVariants}
                >
                  <NextLink className="transform transition-transform hover:scale-105" href="https://www.producthunt.com/posts/miniperplx?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-miniperplx" target="_blank" rel="noopener noreferrer" passHref>
                    <Image
                      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=481378&theme=light"
                      alt="MiniPerplx - A minimalistic AI-powered search engine. | Product Hunt"
                      width={250}
                      height={54}
                      className="h-12 w-auto"
                    />
                  </NextLink>
                  <NextLink className="transform transition-transform hover:scale-105" href="https://peerlist.io/zaidmukaddam/project/miniperplx" target="_blank" rel="noopener noreferrer" passHref>
                    <Image
                      src="/Launch_SVG_Light.svg"
                      alt="Peerlist"
                      width={32}
                      height={32}
                      className="h-12 w-auto block dark:hidden"
                    />
                    <Image
                      src="/Launch_SVG_Dark.svg"
                      alt="Peerlist"
                      width={32}
                      height={32}
                      className="h-12 w-auto hidden dark:block"
                    />
                  </NextLink>
                  {/* <a href="https://theresanaiforthat.com/ai/miniperplx/?ref=featured&v=2143659" target="_blank" rel="nofollow"><img width="300" src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600" /></a> */}
                  <NextLink className="transform transition-transform hover:scale-105" href="https://theresanaiforthat.com/ai/miniperplx/?ref=featured&v=2143659" target="_blank" rel="nofollow" passHref>
                    <Image
                      src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600"
                      alt="There's an AI for that"
                      width={300}
                      height={150}
                      className="h-12 w-auto"
                    />
                  </NextLink>
                  <NextLink className="transform transition-transform hover:scale-105" href="https://www.uneed.best/tool/miniperplx" passHref>
                    <Image
                      src="https://www.uneed.best/POTD1A.png"
                      alt="Uneed Embed Badge"
                      width={300}
                      height={150}
                      className="h-12 w-auto"
                    />
                  </NextLink>
                  <NextLink className="transform transition-transform hover:scale-105" href="https://www.uneed.best/tool/miniperplx" passHref>
                    <Image
                      src="https://www.uneed.best/POTW3A.png"
                      alt="Uneed Embed Badge"
                      width={300}
                      height={150}
                      className="h-12 w-auto"
                    />
                  </NextLink>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
        <AboutUsSection />
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="font-serif text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-center mb-12">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section id="tech-stack" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted to-background overflow-hidden">
          <div className="container px-4 md:px-6">
            <h2 className="font-serif text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-center mb-12 text-balance">
              Our Tech Constellation
            </h2>
            <p className="text-center text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-serif tracking-normal">
              Explore the universe of technologies powering MiniPerplx. Hover over the stars to discover the constellations of our tech stack.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <TechConstellation />
            </motion.div>
          </div>
        </section>

        <TestimonialSection />
        <MarqueeTestimonials />

        <div className="border-b"></div>
        <section id="try-it" className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden bg-opacity-85">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <AnimatedSection>
                <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Ready to Experience MiniPerplx?
                </h2>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-serif tracking-normal">
                  Discover the power of minimalistic AI search.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.4} className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  <NextLink href="/search">
                    Try MiniPerplx
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </NextLink>
                </Button>
                <Button variant="outline" size="lg" asChild className="group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  <NextLink href="https://git.new/mplx" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    View on GitHub
                  </NextLink>
                </Button>
              </AnimatedSection>
            </div>
          </div>
          <motion.div
            className="absolute inset-0 z-0 opacity-30"
            initial={{ backgroundPosition: '0% 0%' }}
            animate={{ backgroundPosition: '100% 100%' }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M0 0h20L0 20z"/%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '20px 20px',
            }}
          />
        </section>
      </main>
      <footer className="w-full py-12 md:py-24 bg-gradient-to-t from-background to-muted relative overflow-hidden">
        <AnimatePresence>
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-neutral-500">
                MiniPerplx
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} MiniPerplx. All rights reserved.</p>
            </motion.div>
          </div>
          <div className="absolute inset-0 z-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary/10"
                style={{
                  width: Math.random() * 50 + 25,
                  height: Math.random() * 50 + 25,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </AnimatePresence>
      </footer>
    </div>
  )
}

export default LandingPage