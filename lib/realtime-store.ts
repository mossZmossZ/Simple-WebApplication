import { getRedisClient } from './redis-client';

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

interface RealtimeState {
  counter: CounterState;
  chatMessages: ChatMessage[];
  votes: VoteOption[];
}

const DEFAULT_STATE: RealtimeState = {
  counter: { count: 0, lastUpdated: 0 },
  chatMessages: [],
  votes: [
    { id: '1', label: 'Option A', votes: 0 },
    { id: '2', label: 'Option B', votes: 0 },
    { id: '3', label: 'Option C', votes: 0 },
  ],
};

const STATE_KEY = 'realtime:state';

class RealtimeStore {
  private listeners: Set<() => void> = new Set();

  private async getStateInternal(): Promise<RealtimeState> {
    const client = await getRedisClient();
    const raw = await client.get(STATE_KEY);

    if (!raw) {
      await client.set(STATE_KEY, JSON.stringify(DEFAULT_STATE));
      return { ...DEFAULT_STATE, votes: [...DEFAULT_STATE.votes] };
    }

    try {
      const parsed = JSON.parse(raw) as RealtimeState;
      return {
        counter: parsed.counter ?? DEFAULT_STATE.counter,
        chatMessages: parsed.chatMessages ?? [],
        votes: parsed.votes && parsed.votes.length > 0 ? parsed.votes : [...DEFAULT_STATE.votes],
      };
    } catch {
      await client.set(STATE_KEY, JSON.stringify(DEFAULT_STATE));
      return { ...DEFAULT_STATE, votes: [...DEFAULT_STATE.votes] };
    }
  }

  private async saveState(state: RealtimeState): Promise<void> {
    const client = await getRedisClient();
    await client.set(STATE_KEY, JSON.stringify(state));
  }

  // Counter methods
  async getCounter(): Promise<CounterState> {
    const state = await this.getStateInternal();
    return state.counter;
  }

  async incrementCounter(): Promise<CounterState> {
    const state = await this.getStateInternal();
    state.counter = {
      count: state.counter.count + 1,
      lastUpdated: Date.now(),
    };
    await this.saveState(state);
    this.notifyListeners();
    return state.counter;
  }

  async decrementCounter(): Promise<CounterState> {
    const state = await this.getStateInternal();
    state.counter = {
      count: state.counter.count - 1,
      lastUpdated: Date.now(),
    };
    await this.saveState(state);
    this.notifyListeners();
    return state.counter;
  }

  async resetCounter(): Promise<CounterState> {
    const state = await this.getStateInternal();
    state.counter = { count: 0, lastUpdated: Date.now() };
    await this.saveState(state);
    this.notifyListeners();
    return state.counter;
  }

  // Chat methods
  async getChatMessages(): Promise<ChatMessage[]> {
    const state = await this.getStateInternal();
    return state.chatMessages;
  }

  async addChatMessage(username: string, message: string): Promise<ChatMessage> {
    const state = await this.getStateInternal();
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username,
      message,
      timestamp: Date.now(),
    };
    state.chatMessages.push(newMessage);
    // Keep only last 50 messages
    if (state.chatMessages.length > 50) {
      state.chatMessages = state.chatMessages.slice(-50);
    }
    await this.saveState(state);
    this.notifyListeners();
    return newMessage;
  }

  // Vote methods
  async getVotes(): Promise<VoteOption[]> {
    const state = await this.getStateInternal();
    return state.votes;
  }

  async addVote(optionId: string): Promise<VoteOption[]> {
    const state = await this.getStateInternal();
    const option = state.votes.find((v) => v.id === optionId);
    if (option) {
      option.votes += 1;
      await this.saveState(state);
      this.notifyListeners();
    }
    return state.votes;
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
  async getState(): Promise<RealtimeState> {
    return this.getStateInternal();
  }
}

// Singleton instance
export const realtimeStore = new RealtimeStore();

