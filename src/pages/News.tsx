import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Newspaper, Clock, User, Eye, Zap, RefreshCw, Sparkles, Tag, ExternalLink } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useRealtime } from '../contexts/RealtimeContext';
import { newsService } from '../services/newsService';
import { format } from 'date-fns';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category: 'tech' | 'ai' | 'smartphone' | 'general';
  isPublished: boolean;
  views: number;
}

export const News: React.FC = () => {
  const { user } = useAuth();
  const { broadcastUpdate } = useRealtime();
  const [articles, setArticles] = useLocalStorage<NewsArticle[]>('rws-news', []);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const [lastAutoUpdate, setLastAutoUpdate] = useLocalStorage<string>('rws-last-auto-update', '');
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'general' as const,
    tags: [] as string[],
    source: '',
    imageUrl: ''
  });

  const isAdmin = user?.accountType === 'admin';

  const categories = [
    { id: 'all', name: 'All News' },
    { id: 'tech', name: 'Technology' },
    { id: 'ai', name: 'Artificial Intelligence' },
    { id: 'smartphone', name: 'Smartphones' },
    { id: 'general', name: 'General' }
  ];

  const handleAddArticle = () => {
    if (!newArticle.title || !newArticle.content || !user) return;

    const article: NewsArticle = {
      id: Date.now().toString(),
      ...newArticle,
      author: user.username,
      publishedAt: new Date().toISOString(),
      isPublished: true,
      views: 0
    };

    const updatedArticles = [article, ...articles];
    setArticles(updatedArticles);
    broadcastUpdate('news_added', article);
    
    setNewArticle({ title: '', content: '', excerpt: '', category: 'general' });
    setIsAddingNew(false);
  };

  const handleEditArticle = (article: NewsArticle) => {
    if (editingArticle?.id === article.id) {
      const updatedArticle = {
        ...article,
        ...newArticle,
        updatedAt: new Date().toISOString()
      };
      
      const updatedArticles = articles.map(a => 
        a.id === article.id ? updatedArticle : a
      );
      setArticles(updatedArticles);
      broadcastUpdate('news_updated', updatedArticle);
      
      setEditingArticle(null);
      setNewArticle({ title: '', content: '', excerpt: '', category: 'general' });
    } else {
      setEditingArticle(article);
      setNewArticle({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category
      });
    }
  };

  const handleDeleteArticle = (id: string) => {
    const updatedArticles = articles.filter(article => article.id !== id);
    setArticles(updatedArticles);
    broadcastUpdate('news_deleted', { id });
  };
  
  const handleGenerateNews = async () => {
    setIsGeneratingNews(true);
    try {
      const newArticles = await newsService.fetchLatestNews();
      
      // Filter out articles that already exist
      const existingTitles = new Set(articles.map(a => a.title.toLowerCase()));
      const uniqueArticles = newArticles.filter(article => 
        !existingTitles.has(article.title.toLowerCase())
      );
      
      if (uniqueArticles.length > 0) {
        const updatedArticles = [...uniqueArticles, ...articles];
        setArticles(updatedArticles);
        setLastAutoUpdate(new Date().toISOString());
        broadcastUpdate('auto_news_generated', { count: uniqueArticles.length });
        
        // Show success message
        alert(`Generated ${uniqueArticles.length} new tech articles!`);
      } else {
        alert('No new articles available at this time.');
      }
    } catch (error) {
      console.error('Failed to generate news:', error);
      alert('Failed to generate news. Please try again later.');
    } finally {
      setIsGeneratingNews(false);
    }
  };
  
  const handleLiveUpdate = async () => {
    await handleGenerateNews();
  };

  const toggleArticleExpansion = (articleId: string) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          return (
            <li key={index} className="ml-4">
              {trimmedLine.substring(1).trim()}
            </li>
          );
        }
        return trimmedLine ? (
          <p key={index} className="mb-2">
            {trimmedLine}
          </p>
        ) : (
          <br key={index} />
        );
      });
  };

  const handleViewArticle = (article: NewsArticle) => {
    const updatedArticle = { ...article, views: article.views + 1 };
    const updatedArticles = articles.map(a => 
      a.id === article.id ? updatedArticle : a
    );
    setArticles(updatedArticles);
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const sortedArticles = filteredArticles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-blue-500/30 mb-6">
            <Newspaper className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-400">Latest Updates</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Warriors News
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Stay updated with the latest in technology, AI, and smartphone innovations
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/10 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-blue-500/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Add Article Button - Admin Only */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <AnimatedButton
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddingNew(true)}
            >
              Add News Article
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              icon={Zap}
              onClick={handleGenerateNews}
              disabled={isGeneratingNews}
              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30"
            >
              {isGeneratingNews ? 'Generating...' : 'AI Generate Articles'}
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              icon={RefreshCw}
              onClick={handleLiveUpdate}
              disabled={isGeneratingNews}
              className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-green-500/30"
            >
              Live Update
            </AnimatedButton>
          </motion.div>
        )}

        {/* Add/Edit Article Form */}
        {isAdmin && (isAddingNew || editingArticle) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <GlassCard className="p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                {editingArticle ? 'Edit Article' : 'Add New Article'}
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      placeholder="Enter article title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newArticle.category}
                      onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                    >
                      <option value="general">General</option>
                      <option value="tech">Technology</option>
                      <option value="ai">Artificial Intelligence</option>
                      <option value="smartphone">Smartphones</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={newArticle.excerpt}
                    onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white resize-none"
                    rows={2}
                    placeholder="Brief description of the article..."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Source
                    </label>
                    <input
                      type="text"
                      value={newArticle.source}
                      onChange={(e) => setNewArticle({ ...newArticle, source: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      placeholder="News source (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={newArticle.imageUrl}
                      onChange={(e) => setNewArticle({ ...newArticle, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white resize-none"
                    rows={8}
                    placeholder="Write your article content here..."
                  />
                </div>
                <div className="flex space-x-4">
                  <AnimatedButton
                    variant="primary"
                    onClick={editingArticle ? () => handleEditArticle(editingArticle) : handleAddArticle}
                  >
                    {editingArticle ? 'Update Article' : 'Publish Article'}
                  </AnimatedButton>
                  <AnimatedButton
                    variant="ghost"
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingArticle(null);
                      setNewArticle({ title: '', content: '', excerpt: '', category: 'general', tags: [], source: '', imageUrl: '' });
                    }}
                  >
                    Cancel
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Auto-Update Status */}
        {lastAutoUpdate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-md border border-green-500/30">
              <Sparkles className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-400">
                Last auto-update: {format(new Date(lastAutoUpdate), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
          </motion.div>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <GlassCard className="p-6 h-full flex flex-col">
                {/* Article Image */}
                {article.imageUrl && (
                  <div className="mb-4 -mx-6 -mt-6">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      article.category === 'tech' ? 'bg-blue-500/20 text-blue-400' :
                      article.category === 'ai' ? 'bg-purple-500/20 text-purple-400' :
                      article.category === 'smartphone' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {article.category.toUpperCase()}
                    </span>
                    {article.isAutoGenerated && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        <Zap className="w-3 h-3 inline mr-1" />
                        AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500 text-xs">
                    <Eye className="w-3 h-3" />
                    <span>{article.views}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2">
                  {article.title}
                </h3>

                <div className="text-gray-600 dark:text-gray-400 mb-4 flex-1">
                  {expandedArticles.has(article.id) ? (
                    <div className="prose prose-sm max-w-none">
                      {formatContent(article.content)}
                    </div>
                  ) : (
                    <p className="line-clamp-3">{article.excerpt}</p>
                  )}
                </div>
                
                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/10 text-gray-400 border border-white/20"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                    {article.source && (
                      <>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>{article.source}</span>
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(article.publishedAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleViewArticle(article);
                      toggleArticleExpansion(article.id);
                    }}
                    className="flex-1"
                  >
                    {expandedArticles.has(article.id) ? 'Show Less' : 'Read More'}
                  </AnimatedButton>
                  
                  {isAdmin && (
                    <>
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEditArticle(article)}
                      >
                        Edit
                      </AnimatedButton>
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </AnimatedButton>
                    </>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {sortedArticles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              No articles found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {selectedCategory === 'all' 
                ? 'No news articles have been published yet.' 
                : `No articles found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};