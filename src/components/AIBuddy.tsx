import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { useAIBuddy } from '../hooks/useAIBuddy';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Make sure you have this hook

interface AIMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  typing?: boolean;
}

export const AIBuddy: React.FC = () => {
  const { markIntroAsSeen } = useAIBuddy();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content:
        "👋 Hey there, mighty warrior! I'm your AI buddy here to help you navigate the Royal Warriors Squad. Ask me anything about the platform, get tips, or just chat!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [aiKnowledge] = useLocalStorage<any[]>('rws-ai-knowledge', []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Check custom knowledge base first
    const relevantKnowledge = aiKnowledge.find((k) =>
      message.includes(k.content.toLowerCase().substring(0, 20))
    );
    if (relevantKnowledge) {
      return `📚 ${relevantKnowledge.content}`;
    }

    // Filter out puzzle/quiz questions
    const puzzleKeywords = [
      'puzzle',
      'riddle',
      'quiz',
      'answer',
      'solution',
      'solve',
      'brain teaser',
      'question',
      'what am i',
      'guess',
    ];
    const containsPuzzleKeyword = puzzleKeywords.some((keyword) =>
      message.includes(keyword)
    );

    if (
      containsPuzzleKeyword &&
      (message.includes('what') || message.includes('how') || message.includes('solve'))
    ) {
      return "🚫 I'm designed to help with platform navigation and general questions, but I can't help with puzzles or quiz answers! That would spoil the fun and challenge. Try solving them yourself or ask fellow warriors for hints in the chat! 🧩";
    }

    // Creator information
    if (
      message.includes('creator') ||
      message.includes('faizy') ||
      message.includes('spider warrior') ||
      message.includes('who made') ||
      message.includes('who created')
    ) {
      return "🕷️ Royal Warriors Squad was created by Faizy, also known as Spider Warrior! He's the mastermind behind this amazing platform. If you need to contact him directly, you can reach him at spiderwarrior15@gmail.com. He's passionate about bringing warriors together and creating this incredible community! 👑";
    }

    if (message.includes('contact') || message.includes('email') || message.includes('reach')) {
      return "📧 Want to get in touch with our creator? You can contact Faizy (Spider Warrior) directly at spiderwarrior15@gmail.com. He's always happy to hear from fellow warriors and is open to feedback, suggestions, or just a friendly chat! 🕷️✨";
    }

    // Greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello there, mighty warrior! 🛡️ Welcome to the Royal Warriors Squad! I'm here to help you navigate this amazing platform created by Faizy (Spider Warrior). How can I assist you on your journey today?";
    }

    // About the platform
    if (message.includes('what is') || message.includes('about')) {
      return "Royal Warriors Squad is an elite community created by Faizy (Spider Warrior) where passion meets purpose! 👑 We're a brotherhood of creative minds, tech innovators, and passionate individuals united by our shared vision. You can participate in puzzles, chat with fellow warriors, attend events, and much more!";
    }

    // Puzzles
    if (message.includes('puzzle') || message.includes('brain')) {
      return "🧩 Our weekly puzzles are brain-bending challenges that test your wit! You can earn points based on difficulty: Easy (5pts), Medium (10pts), Hard (15pts), and Super Hard (20pts). The system even auto-generates new puzzles weekly! Check the Puzzles section to participate and climb the leaderboard!";
    }

    // Events
    if (message.includes('event') || message.includes('meet')) {
      return "🎉 We host amazing events where warriors unite! From gaming tournaments to tech workshops and annual meets. Check out the Events page to see what's coming up and RSVP to join the fun! Our creator Faizy often organizes special meetups too!";
    }

    // Chat
    if (message.includes('chat') || message.includes('talk')) {
      return "💬 Our chat system lets you connect with fellow warriors! Join public groups like 'General Discussion', 'Tech Warriors', or 'Gaming Squad'. You can also create your own groups and have real-time conversations with live updates!";
    }

    // Music
    if (message.includes('music') || message.includes('song')) {
      return "🎵 Warriors' Picks is our curated music collection! Discover tracks that fuel creativity and inspire greatness. These are songs chosen by our community to keep the warrior spirit alive! You can even watch YouTube videos directly on the platform!";
    }

    // Admin
    if (message.includes('admin') || message.includes('manage')) {
      return "⚔️ Commanders (admins) have special powers! They can manage warriors, create marking criteria, review puzzle answers, organize events, and customize the homepage. Faizy, our creator, has ultimate admin access to ensure everything runs smoothly!";
    }

    // Points/Scoring
    if (message.includes('point') || message.includes('score')) {
      return "🏆 You can earn points through various activities! Solve puzzles to get points based on difficulty, participate in events, and get marked by commanders for your contributions. The system tracks everything with live updates! Check the leaderboard to see how you rank!";
    }

    // Features
    if (message.includes('feature') || message.includes('what can')) {
      return "✨ RWS has amazing features! Auto-generating puzzles, live chat with real-time updates, event management, music streaming, user profiles with stats, admin panel for management, and so much more! Faizy has built this to be a complete warrior experience!";
    }

    // Help
    if (message.includes('help') || message.includes('how')) {
      return "🤝 I'm here to help! You can ask me about puzzles, events, chat features, music, scoring, our creator Faizy, or anything else about the platform. Just type your question and I'll do my best to guide you through this amazing warrior community!";
    }

    // News and updates
    if (
      message.includes('news') ||
      message.includes('update') ||
      message.includes('article')
    ) {
      return "📰 Check out our News section for the latest tech updates, AI advancements, and smartphone news! We have both manually curated articles and auto-generated tech news that updates regularly. You can filter by categories like Technology, AI, and Smartphones!";
    }

    // AI and technology questions
    if (
      message.includes('ai') ||
      message.includes('artificial intelligence') ||
      message.includes('technology')
    ) {
      return "🤖 I love talking about AI and technology! Our platform features the latest tech news, AI advancements, and discussions about emerging technologies. Check out our News section for cutting-edge articles, or join the Tech Warriors chat group to discuss with fellow tech enthusiasts!";
    }

    // Admin and moderation
    if (
      message.includes('admin') ||
      message.includes('report') ||
      message.includes('problem')
    ) {
      return "⚔️ If you need admin assistance or want to report an issue, you can contact our commanders through the Contact page or reach out to our creator Faizy directly at spiderwarrior15@gmail.com. For technical issues, our admin panel has debugging tools and error logs to help resolve problems quickly!";
    }

    // Fun responses
    if (message.includes('joke') || message.includes('funny')) {
      return "😄 Why don't warriors ever get lost? Because they always follow their code! 💻 Speaking of code, Faizy has written some amazing code for this platform. Have you checked out our tech discussions in the chat?";
    }

    if (message.includes('thank')) {
      return "🙏 You're very welcome, noble warrior! It's my honor to serve the Royal Warriors Squad created by Faizy. May your journey be filled with victories and legendary achievements! Remember, if you need anything special, you can always reach out to our creator at spiderwarrior15@gmail.com!";
    }

    // Default responses
    const defaultResponses = [
      "That's an interesting question! 🤔 While I'm still learning, I can help you with information about puzzles, events, chat features, our creator Faizy, and more. What would you like to know?",
      "I'm here to help you navigate the Royal Warriors Squad created by Faizy! ⚔️ Try asking me about our features like puzzles, events, or how to earn points!",
      "Great question! 💭 I can assist you with platform features, tips for earning points, info about our creator Spider Warrior, or just have a friendly chat. What's on your warrior mind?",
      "Hmm, let me think about that! 🧠 In the meantime, feel free to ask me about puzzles, events, chat groups, our amazing creator Faizy, or any other Royal Warriors Squad features!",
      "That's beyond my current knowledge, but I'm always eager to help! 🌟 Ask me about our community features, scoring system, how to contact Faizy, or how to get the most out of your warrior experience!",
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputMessage),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3 seconds delay
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleOpen = () => setIsOpen(!isOpen);
  const toggleMinimize = () => setIsMinimized(!isMinimized);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleOpen}
          className="group relative w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
          aria-label="Open AI Buddy chat"
        >
          <Bot className="w-8 h-8 text-white" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-3 h-3 text-white" />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Chat with AI Buddy
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <GlassCard
        className={`w-96 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[500px]'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-gray-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">AI Buddy</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isTyping ? 'Typing...' : 'Online • Created by Faizy'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMinimize}
              className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
              aria-label={isMinimized ? 'Maximize chat window' : 'Minimize chat window'}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-gray-500" />
              ) : (
                <Minimize2 className="w-4 h-4 text-gray-500" />
              )}
            </button>
            <button
              onClick={toggleOpen}
              className="p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-300"
              aria-label="Close chat window"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white/10 dark:bg-gray-800/50 text-gray-800 dark:text-white'
                    }`}
                  >
                    <p className="text-sm selectable">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 dark:bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 dark:border-gray-700/30">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-4 py-2 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm selectable"
                  placeholder="Ask me anything..."
                  disabled={isTyping}
                  aria-label="Type your message"
                />
                <AnimatedButton
                  variant="primary"
                  size="sm"
                  icon={Send}
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  Send
                </AnimatedButton>
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
};
