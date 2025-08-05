import { AIModel, AITrainingData, AIResponse } from '../types';
import { fileService } from './fileService';
import { v4 as uuidv4 } from 'uuid';

class AIService {
  private model: AIModel | null = null;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    let model = await fileService.getAIModel();

    if (!model) {
      // Create default AI model
      model = {
        id: uuidv4(),
        name: 'AI Assistant',
        description: 'AI Assistant for RWS platform administration',
        trainingData: this.getDefaultTrainingData(),
        responses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      await fileService.saveAIModel(model);
    }

    this.model = model;
  }

  private getDefaultTrainingData(): AITrainingData[] {
    return [
      {
        id: uuidv4(),
        prompt: 'show me most active warriors',
        response: 'Here are the most active warriors based on their platform engagement and contributions.',
        category: 'analytics',
        addedBy: 'system',
        addedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        prompt: 'approve all pending song uploads',
        response: 'I\'ll approve all pending song uploads. Processing requests now...',
        category: 'moderation',
        addedBy: 'system',
        addedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        prompt: 'help me write a warning to spammers',
        response: 'Here\'s a professional warning message: "Warriors, please maintain respectful communication. Spam and inappropriate content violate our community guidelines and may result in account restrictions."',
        category: 'communication',
        addedBy: 'system',
        addedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        prompt: 'generate weekly activity report',
        response: 'I\'ll compile a comprehensive weekly activity report including user engagement, content submissions, and platform statistics.',
        category: 'reporting',
        addedBy: 'system',
        addedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        prompt: 'create announcement for new feature',
        response: 'I\'ll help you create an engaging announcement for the new feature, highlighting its benefits and encouraging warrior participation.',
        category: 'communication',
        addedBy: 'system',
        addedAt: new Date().toISOString()
      }
    ];
  }

  public async processCommand(prompt: string, userId: string): Promise<string> {
    if (!this.model) {
      await this.initializeModel();
    }

    const lowerPrompt = prompt.toLowerCase();

    const matchingTraining = this.model!.trainingData.find(data =>
      lowerPrompt.includes(data.prompt.toLowerCase()) ||
      data.prompt.toLowerCase().includes(lowerPrompt)
    );

    let response = '';

    if (matchingTraining) {
      response = matchingTraining.response;
    } else {
      if (lowerPrompt.includes('active') && lowerPrompt.includes('warrior')) {
        response = 'I can help you analyze warrior activity. Would you like me to show engagement metrics, message counts, or form submissions?';
      } else if (lowerPrompt.includes('approve') || lowerPrompt.includes('pending')) {
        response = 'I can help you manage pending approvals. Specify what you\'d like to approve: songs, groups, events, or forms.';
      } else if (lowerPrompt.includes('ban') || lowerPrompt.includes('warning')) {
        response = 'I can help you with moderation actions. Please specify the user or provide more details about the situation.';
      } else if (lowerPrompt.includes('report') || lowerPrompt.includes('analytics')) {
        response = 'I can generate various reports: user activity, content statistics, engagement metrics, or custom analytics.';
      } else if (lowerPrompt.includes('announcement') || lowerPrompt.includes('message')) {
        response = 'I can help you craft announcements and messages. What type of communication do you need assistance with?';
      } else {
        response = 'I\'m here to help you manage the RWS platform. I can assist with user management, content moderation, analytics, and communication. What would you like me to help you with?';
      }
    }

    const aiResponse: AIResponse = {
      id: uuidv4(),
      prompt,
      response,
      confidence: matchingTraining ? 0.9 : 0.6,
      timestamp: new Date().toISOString(),
      userId
    };

    if (this.model) {
      this.model.responses.push(aiResponse);
      this.model.updatedAt = new Date().toISOString();
      await fileService.saveAIModel(this.model);
    }

    return response;
  }

  public async trainModel(prompt: string, response: string, category: string, userId: string): Promise<void> {
    if (!this.model) {
      await this.initializeModel();
    }

    const trainingData: AITrainingData = {
      id: uuidv4(),
      prompt: prompt.toLowerCase(),
      response,
      category,
      addedBy: userId,
      addedAt: new Date().toISOString()
    };

    this.model!.trainingData.push(trainingData);
    this.model!.updatedAt = new Date().toISOString();

    await fileService.saveAIModel(this.model!);
  }

  public async getTrainingData(): Promise<AITrainingData[]> {
    if (!this.model) {
      await this.initializeModel();
    }
    return this.model?.trainingData || [];
  }

  public async getResponseHistory(): Promise<AIResponse[]> {
    if (!this.model) {
      await this.initializeModel();
    }
    return this.model?.responses || [];
  }
}

export const aiService = new AIService();
