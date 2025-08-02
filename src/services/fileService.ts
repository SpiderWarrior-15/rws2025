import { User, Message, Chat, CustomForm, FormSubmission, Event, Puzzle, Quiz, SongUpload, Activity, ApprovalRequest, AIModel } from '../types';

// File-based storage service (simulating backend with localStorage)
class FileService {
  private getStorageKey(filename: string): string {
    return `rws-file-${filename}`;
  }

  // Generic file operations
  public async readFile<T>(filename: string, defaultValue: T[] = []): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.getStorageKey(filename));
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return defaultValue;
    }
  }

  public async writeFile<T>(filename: string, data: T[]): Promise<void> {
    try {
      localStorage.setItem(this.getStorageKey(filename), JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
    }
  }

  public async appendToFile<T>(filename: string, item: T): Promise<void> {
    const data = await this.readFile<T>(filename);
    data.push(item);
    await this.writeFile(filename, data);
  }

  public async updateInFile<T extends { id: string }>(filename: string, id: string, updates: Partial<T>): Promise<void> {
    const data = await this.readFile<T>(filename);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      await this.writeFile(filename, data);
    }
  }

  public async deleteFromFile<T extends { id: string }>(filename: string, id: string): Promise<void> {
    const data = await this.readFile<T>(filename);
    const filtered = data.filter(item => item.id !== id);
    await this.writeFile(filename, filtered);
  }

  // Specific file operations
  public async getUsers(): Promise<User[]> {
    return this.readFile<User>('users.json', []);
  }

  public async saveUser(user: User): Promise<void> {
    await this.appendToFile('users.json', user);
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await this.updateInFile('users.json', id, updates);
  }

  public async getMessages(): Promise<Message[]> {
    return this.readFile<Message>('messages.json', []);
  }

  public async saveMessage(message: Message): Promise<void> {
    await this.appendToFile('messages.json', message);
  }

  public async getChats(): Promise<Chat[]> {
    return this.readFile<Chat>('chat.json', []);
  }

  public async saveChat(chat: Chat): Promise<void> {
    await this.appendToFile('chat.json', chat);
  }

  public async updateChat(id: string, updates: Partial<Chat>): Promise<void> {
    await this.updateInFile('chat.json', id, updates);
  }

  public async getForms(): Promise<CustomForm[]> {
    return this.readFile<CustomForm>('forms.json', []);
  }

  public async saveForm(form: CustomForm): Promise<void> {
    await this.appendToFile('forms.json', form);
  }

  public async updateForm(id: string, updates: Partial<CustomForm>): Promise<void> {
    await this.updateInFile('forms.json', id, updates);
  }

  public async getFormSubmissions(): Promise<FormSubmission[]> {
    return this.readFile<FormSubmission>('form_submissions.json', []);
  }

  public async saveFormSubmission(submission: FormSubmission): Promise<void> {
    await this.appendToFile('form_submissions.json', submission);
  }

  public async getEvents(): Promise<Event[]> {
    return this.readFile<Event>('events.json', []);
  }

  public async saveEvent(event: Event): Promise<void> {
    await this.appendToFile('events.json', event);
  }

  public async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    await this.updateInFile('events.json', id, updates);
  }

  public async getPuzzles(): Promise<Puzzle[]> {
    return this.readFile<Puzzle>('puzzles.json', []);
  }

  public async savePuzzle(puzzle: Puzzle): Promise<void> {
    await this.appendToFile('puzzles.json', puzzle);
  }

  public async updatePuzzle(id: string, updates: Partial<Puzzle>): Promise<void> {
    await this.updateInFile('puzzles.json', id, updates);
  }

  public async getQuizzes(): Promise<Quiz[]> {
    return this.readFile<Quiz>('quizzes.json', []);
  }

  public async saveQuiz(quiz: Quiz): Promise<void> {
    await this.appendToFile('quizzes.json', quiz);
  }

  public async getSongUploads(): Promise<SongUpload[]> {
    return this.readFile<SongUpload>('uploads.json', []);
  }

  public async saveSongUpload(song: SongUpload): Promise<void> {
    await this.appendToFile('uploads.json', song);
  }

  public async updateSongUpload(id: string, updates: Partial<SongUpload>): Promise<void> {
    await this.updateInFile('uploads.json', id, updates);
  }

  public async getActivities(): Promise<Activity[]> {
    return this.readFile<Activity>('activities.json', []);
  }

  public async saveActivity(activity: Activity): Promise<void> {
    await this.appendToFile('activities.json', activity);
  }

  public async getApprovalRequests(): Promise<ApprovalRequest[]> {
    return this.readFile<ApprovalRequest>('approvals.json', []);
  }

  public async saveApprovalRequest(request: ApprovalRequest): Promise<void> {
    await this.appendToFile('approvals.json', request);
  }

  public async updateApprovalRequest(id: string, updates: Partial<ApprovalRequest>): Promise<void> {
    await this.updateInFile('approvals.json', id, updates);
  }

  public async getAIModel(): Promise<AIModel | null> {
    const models = await this.readFile<AIModel>('ai_model.json', []);
    return models[0] || null;
  }

  public async saveAIModel(model: AIModel): Promise<void> {
    await this.writeFile('ai_model.json', [model]);
  }
}

export const fileService = new FileService();