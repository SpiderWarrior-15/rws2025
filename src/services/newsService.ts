import { NewsArticle } from '../types';

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, this would fetch from real APIs like:
      // - NewsAPI
      // - TechCrunch API
      // - Reddit API
      // - RSS feeds
      
      const articles: NewsArticle[] = mockTechNews.map((article, index) => ({
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
      
      return articles;
    } catch (error) {
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