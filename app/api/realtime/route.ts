import { NextRequest } from 'next/server';
import { realtimeStore } from '@/lib/realtime-store';

// Server-Sent Events endpoint for real-time updates (GET)
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = () => {
        const state = realtimeStore.getState();
        const data = `data: ${JSON.stringify(state)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // Send initial state
      sendUpdate();

      // Subscribe to updates
      const unsubscribe = realtimeStore.subscribe(() => {
        sendUpdate();
      });

      // Keep connection alive with periodic pings
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'));
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Action endpoint for user interactions (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, optionId, username, message } = body;

    // Handle different actions
    if (action === 'increment') {
      realtimeStore.incrementCounter();
    } else if (action === 'decrement') {
      realtimeStore.decrementCounter();
    } else if (action === 'reset') {
      realtimeStore.resetCounter();
    } else if (action === 'vote' && optionId) {
      realtimeStore.addVote(optionId);
    } else if (action === 'chat' && username && message) {
      realtimeStore.addChatMessage(username, message);
    }

    // Return current state
    const state = realtimeStore.getState();
    return Response.json(state);
  } catch (error) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
