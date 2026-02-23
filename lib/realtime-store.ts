// Simple in-memory store for real-time data
// In production, you'd use Redis, a database, or a real-time service

interface CounterState {
  count: number;
  lastUpdated: number;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface VoteOption {
  id: string;
  label: string;
  votes: number;
}

class RealtimeStore {
  private counter: CounterState = { count: 0, lastUpdated: Date.now() };
  private chatMessages: ChatMessage[] = [];
  private votes: VoteOption[] = [
    { id: '1', label: 'Option A', votes: 0 },
    { id: '2', label: 'Option B', votes: 0 },
    { id: '3', label: 'Option C', votes: 0 },
  ];
  private listeners: Set<() => void> = new Set();

  // Counter methods
  getCounter(): CounterState {
    return this.counter;
  }

  incrementCounter(): CounterState {
    this.counter = {
      count: this.counter.count + 1,
      lastUpdated: Date.now(),
    };
    this.notifyListeners();
    return this.counter;
  }

  decrementCounter(): CounterState {
    this.counter = {
      count: this.counter.count - 1,
      lastUpdated: Date.now(),
    };
    this.notifyListeners();
    return this.counter;
  }

  resetCounter(): CounterState {
    this.counter = { count: 0, lastUpdated: Date.now() };
    this.notifyListeners();
    return this.counter;
  }

  // Chat methods
  getChatMessages(): ChatMessage[] {
    return this.chatMessages;
  }

  addChatMessage(username: string, message: string): ChatMessage {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username,
      message,
      timestamp: Date.now(),
    };
    this.chatMessages.push(newMessage);
    // Keep only last 50 messages
    if (this.chatMessages.length > 50) {
      this.chatMessages.shift();
    }
    this.notifyListeners();
    return newMessage;
  }

  // Vote methods
  getVotes(): VoteOption[] {
    return this.votes;
  }

  addVote(optionId: string): VoteOption[] {
    const option = this.votes.find((v) => v.id === optionId);
    if (option) {
      option.votes += 1;
      this.notifyListeners();
    }
    return this.votes;
  }

  // Listener management
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // Get all state for SSE
  getState() {
    return {
      counter: this.counter,
      chatMessages: this.chatMessages,
      votes: this.votes,
    };
  }
}

// Singleton instance
export const realtimeStore = new RealtimeStore();
