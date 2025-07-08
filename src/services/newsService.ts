import { NewsArticle } from '../types';
import toast from 'react-hot-toast';

// Mock news data - in production, this would fetch from real APIs
const mockTechNews = [
  {
    title: "iPhone 16 vs Samsung Galaxy S24: The Ultimate Comparison",
    content: "Apple's latest iPhone 16 brings significant improvements in camera technology and battery life, while Samsung's Galaxy S24 continues to lead in display quality and customization options. Both devices feature advanced AI capabilities, but they approach artificial intelligence differently...",
    excerpt: "Comprehensive comparison of the latest flagship smartphones from Apple and Samsung, covering performance, camera, battery, and AI features.",
    category: "tech" as const,
    tags: ["iPhone", "Samsung", "Smartphone", "Comparison"],
    source: "TechCrunch",
    imageUrl: "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg"
  },
  {
    title: "ChatGPT-5 Rumored to Launch with Revolutionary Multimodal Capabilities",
    content: "OpenAI is reportedly working on ChatGPT-5, which could feature unprecedented multimodal capabilities including advanced video understanding, real-time voice conversations, and enhanced reasoning abilities. Industry insiders suggest the new model could be 100x more powerful than GPT-4...",
    excerpt: "Latest rumors and leaks about OpenAI's next-generation language model and its potential impact on AI industry.",
    category: "ai" as const,
    tags: ["ChatGPT", "OpenAI", "AI", "Machine Learning"],
    source: "The Verge",
    imageUrl: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg"
  },
  {
    title: "Microsoft Windows 12 Leaked: AI-First Operating System",
    content: "Screenshots and documentation allegedly from Microsoft's internal testing reveal Windows 12 as a completely AI-integrated operating system. The new OS features an AI assistant built into every application, intelligent file management, and predictive user interface adaptations...",
    excerpt: "Exclusive leak reveals Microsoft's plans for an AI-centric Windows 12 with revolutionary user experience improvements.",
    category: "tech" as const,
    tags: ["Windows", "Microsoft", "Operating System", "AI"],
    source: "Windows Central",
    imageUrl: "https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg"
  },
  {
    title: "Tesla's New Neural Network Chip Outperforms NVIDIA H100",
    content: "Tesla has unveiled its latest custom silicon designed specifically for AI training and inference in autonomous vehicles. The new chip, codenamed 'Dojo 2.0', reportedly delivers 3x better performance per watt compared to NVIDIA's flagship H100 GPU while consuming significantly less power...",
    excerpt: "Tesla's breakthrough in AI chip technology could revolutionize both autonomous driving and data center computing.",
    category: "ai" as const,
    tags: ["Tesla", "AI Chip", "Neural Network", "Autonomous Driving"],
    source: "Electrek",
    imageUrl: "https://images.pexels.com/photos/35967/mini-cooper-auto-model-vehicle.jpg"
  },
  {
    title: "Google Pixel 9 Pro: Revolutionary Camera AI Changes Photography Forever",
    content: "Google's Pixel 9 Pro introduces 'Magic Eraser 2.0' and 'Best Take AI' that can seamlessly remove objects, replace backgrounds, and even generate missing parts of photos using advanced machine learning. The camera can now understand context and automatically enhance photos based on the scene...",
    excerpt: "Google's latest smartphone camera technology uses AI to transform mobile photography with unprecedented editing capabilities.",
    category: "smartphone" as const,
    tags: ["Google Pixel", "Camera AI", "Photography", "Mobile"],
    source: "Android Authority",
    imageUrl: "https://images.pexels.com/photos/1038628/pexels-photo-1038628.jpeg"
  },
  {
    title: "Meta's Llama 3 Now Powers Real-Time Translation in 200+ Languages",
    content: "Meta has released a major update to its Llama 3 language model, now capable of real-time translation across more than 200 languages with near-human accuracy. The model can maintain context, cultural nuances, and even translate idioms correctly across different language families...",
    excerpt: "Meta's breakthrough in multilingual AI could eliminate language barriers in global communication and commerce.",
    category: "ai" as const,
    tags: ["Meta", "Llama 3", "Translation", "Multilingual AI"],
    source: "Meta AI Blog",
    imageUrl: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg"
  },
  {
    title: "Apple Vision Pro 2: Revolutionary Mixed Reality with Neural Interface",
    content: "Apple's second-generation Vision Pro introduces groundbreaking neural interface technology that can read basic brain signals for hands-free control. The device features 8K per eye displays, advanced spatial computing, and seamless integration with the Apple ecosystem...",
    excerpt: "Apple's next-generation mixed reality headset promises to revolutionize human-computer interaction with neural interface technology.",
    category: "tech" as const,
    tags: ["Apple", "Vision Pro", "Mixed Reality", "Neural Interface"],
    source: "Apple Insider",
    imageUrl: "https://images.pexels.com/photos/123335/pexels-photo-123335.jpeg"
  },
  {
    title: "Quantum Computing Breakthrough: IBM's 1000-Qubit Processor",
    content: "IBM has achieved a major milestone in quantum computing with their new 1000-qubit processor, capable of solving complex problems that would take classical computers millions of years. This breakthrough could revolutionize cryptography, drug discovery, and financial modeling...",
    excerpt: "IBM's quantum computing advancement brings us closer to practical quantum applications in various industries.",
    category: "tech" as const,
    tags: ["IBM", "Quantum Computing", "Processor", "Technology"],
    source: "IBM Research",
    imageUrl: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg"
  },
  {
    title: "Samsung Galaxy AI: Personal Assistant That Learns Your Habits",
    content: "Samsung's new Galaxy AI goes beyond traditional voice assistants by learning user habits, predicting needs, and proactively suggesting actions. The AI can manage your schedule, optimize device performance, and even predict when you'll need certain apps or information...",
    excerpt: "Samsung's advanced AI technology creates a truly personalized smartphone experience that adapts to individual user patterns.",
    category: "smartphone" as const,
    tags: ["Samsung", "Galaxy AI", "Personal Assistant", "Machine Learning"],
    source: "Samsung Newsroom",
    imageUrl: "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg"
  },
  {
    title: "OpenAI Announces GPT-5: Multimodal AI with Video Generation",
    content: "OpenAI's GPT-5 introduces unprecedented multimodal capabilities including real-time video generation, advanced reasoning, and the ability to understand and create content across text, images, audio, and video formats simultaneously...",
    excerpt: "GPT-5 represents a significant leap forward in AI capabilities with true multimodal understanding and generation.",
    category: "ai" as const,
    tags: ["OpenAI", "GPT-5", "Multimodal AI", "Video Generation"],
    source: "OpenAI Blog",
    imageUrl: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg"
  }
];

export class NewsService {
  private static instance: NewsService;
  private newsCache: NewsArticle[] = [];
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  private constructor() {}

  public static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  public async fetchLatestNews(): Promise<NewsArticle[]> {
    // Check if we need to refresh cache
    if (this.lastFetch && Date.now() - this.lastFetch.getTime() < this.CACHE_DURATION) {
      return this.newsCache;
    }

    try {
      // Show loading toast
      toast.loading('Generating fresh tech news...', { id: 'news-generation' });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Shuffle articles and pick 3-6 randomly
      const shuffledNews = [...mockTechNews].sort(() => Math.random() - 0.5);
      const selectedNews = shuffledNews.slice(0, Math.floor(Math.random() * 4) + 3);
      
      const articles: NewsArticle[] = selectedNews.map((article, index) => ({
        id: `auto_${Date.now()}_${index}`,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        author: 'AI News Bot',
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        category: article.category,
        isPublished: true,
        views: Math.floor(Math.random() * 1000) + 100,
        tags: article.tags,
        source: article.source,
        imageUrl: article.imageUrl,
        isAutoGenerated: true
      }));

      this.newsCache = articles;
      this.lastFetch = new Date();
      
      // Dismiss loading toast and show success
      toast.dismiss('news-generation');
      toast.success(`Generated ${articles.length} fresh tech articles!`);
      
      return articles;
    } catch (error) {
      toast.dismiss('news-generation');
      console.error('Failed to fetch news:', error);
      return [];
    }
  }

  public async generateNewsUpdate(): Promise<NewsArticle[]> {
    // This would integrate with real news APIs in production
    return this.fetchLatestNews();
  }

  public clearCache(): void {
    this.newsCache = [];
    this.lastFetch = null;
  }
}

export const newsService = NewsService.getInstance();
