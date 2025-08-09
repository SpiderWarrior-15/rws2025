interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';
  private model = 'gpt-4-turbo-preview'; // Using latest available model

  private constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async generateResponse(
    prompt: string, 
    context: string = '',
    systemPrompt: string = 'You are a helpful AI assistant for the Royal Warriors Squad platform.'
  ): Promise<string> {
    if (!this.apiKey) {
      // Fallback to local AI simulation
      return this.simulateAIResponse(prompt, context);
    }

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt }
      ];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.simulateAIResponse(prompt, context);
    }
  }

  private simulateAIResponse(prompt: string, context: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Alan Walker knowledge base
    if (lowerPrompt.includes('alan walker') || lowerPrompt.includes('faded') || lowerPrompt.includes('alone')) {
      const alanWalkerResponses = [
        "Alan Walker is a Norwegian DJ and record producer known for his electronic music. His breakthrough single 'Faded' became a global hit in 2015.",
        "Alan Walker's signature style includes melodic electronic beats and often features mysterious, hooded imagery. His music often explores themes of unity and finding one's way.",
        "Some of Alan Walker's most popular tracks include 'Faded', 'Alone', 'Sing Me to Sleep', 'Darkside', and 'On My Way'. Each track has its own unique story and meaning.",
        "Alan Walker often collaborates with various artists and his music videos feature stunning visuals and storytelling elements that connect with his fanbase worldwide."
      ];
      return alanWalkerResponses[Math.floor(Math.random() * alanWalkerResponses.length)];
    }

    // Platform help
    if (lowerPrompt.includes('help') || lowerPrompt.includes('how to') || lowerPrompt.includes('guide')) {
      return "I'm here to help you navigate the Royal Warriors Squad platform! You can upload music, solve puzzles, join events, connect with friends, and explore Alan Walker's universe. What specific feature would you like help with?";
    }

    // Upload help
    if (lowerPrompt.includes('upload') || lowerPrompt.includes('music') || lowerPrompt.includes('file')) {
      return "To upload music or videos, go to the Alan Walkers section and click 'Upload Track'. You can drag and drop files or click to browse. Supported formats include MP3, WAV, OGG, MP4, MOV, and WEBM. All uploads require admin approval.";
    }

    // Puzzle help
    if (lowerPrompt.includes('puzzle') || lowerPrompt.includes('solve') || lowerPrompt.includes('brain')) {
      return "Visit the Puzzles section to challenge your mind! Solve weekly puzzles to earn XP and climb the leaderboard. Puzzles range from easy (5 points) to super hard (20 points). Your progress is tracked automatically.";
    }

    // Friend system help
    if (lowerPrompt.includes('friend') || lowerPrompt.includes('connect') || lowerPrompt.includes('warrior')) {
      return "Use the Friends system to connect with fellow warriors! Search for users, send friend requests, and build your network. You can access the friend system from your profile menu or the Friends page.";
    }

    // Events help
    if (lowerPrompt.includes('event') || lowerPrompt.includes('join') || lowerPrompt.includes('participate')) {
      return "Check out the Events section to join community gatherings! You can RSVP to events, view details, and participate in special activities. Events are a great way to earn XP and connect with other warriors.";
    }

    // Default response
    return "Welcome to the Royal Warriors Squad! I'm your AI assistant, ready to help you explore the platform, learn about Alan Walker, and connect with fellow warriors. What would you like to know?";
  }

  public async generateFormSuggestions(formType: string): Promise<string[]> {
    const suggestions: Record<string, string[]> = {
      'event': [
        'Event Registration Form',
        'Workshop Signup',
        'Competition Entry',
        'Meetup RSVP'
      ],
      'survey': [
        'Community Feedback Survey',
        'Music Preferences Poll',
        'Platform Improvement Ideas',
        'Warrior Experience Survey'
      ],
      'feedback': [
        'Bug Report Form',
        'Feature Request',
        'General Feedback',
        'Support Request'
      ],
      'registration': [
        'New Member Registration',
        'Event Volunteer Signup',
        'Beta Tester Application',
        'Community Leader Application'
      ]
    };

    return suggestions[formType] || ['Custom Form'];
  }

  public async enhanceFormDescription(title: string, category: string): Promise<string> {
    const prompt = `Create a professional description for a form titled "${title}" in the ${category} category for a music community platform called Royal Warriors Squad.`;
    
    try {
      return await this.generateResponse(prompt, '', 'You are a helpful assistant that creates professional form descriptions.');
    } catch (error) {
      return `A ${category} form for the Royal Warriors Squad community. Please fill out all required fields.`;
    }
  }

  public async generatePuzzle(difficulty: 'easy' | 'medium' | 'hard' | 'super_hard'): Promise<{ question: string; answer: string }> {
    const prompt = `Generate a ${difficulty} puzzle suitable for a music and technology community. Return only the question and answer in JSON format: {"question": "...", "answer": "..."}`;
    
    try {
      const response = await this.generateResponse(prompt, '', 'You are a puzzle creator for a gaming community.');
      const parsed = JSON.parse(response);
      return {
        question: parsed.question || 'What has keys but no locks?',
        answer: parsed.answer || 'keyboard'
      };
    } catch (error) {
      // Fallback puzzles
      const fallbackPuzzles = {
        easy: { question: 'What has keys but no locks?', answer: 'keyboard' },
        medium: { question: 'I speak without a mouth and hear without ears. What am I?', answer: 'echo' },
        hard: { question: 'What comes once in a minute, twice in a moment, but never in a thousand years?', answer: 'm' },
        super_hard: { question: 'What English word has three consecutive double letters?', answer: 'bookkeeper' }
      };
      return fallbackPuzzles[difficulty];
    }
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const openaiService = OpenAIService.getInstance();