import { NextRequest } from 'next/server';
import { realtimeStore } from '@/lib/realtime-store';

// Server-Sent Events endpoint for real-time updates (GET)
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        const state = await realtimeStore.getState();
        const data = JSON.stringify(state);
        // Proper SSE format: each message line starts with "data: "
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Send initial state
      await sendUpdate();

      // Subscribe to updates
      const unsubscribe = realtimeStore.subscribe(() => {
        sendUpdate().catch((err) => {
          console.error('Error sending SSE update', err);
        });
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
      await realtimeStore.incrementCounter();
    } else if (action === 'decrement') {
      await realtimeStore.decrementCounter();
    } else if (action === 'reset') {
      await realtimeStore.resetCounter();
    } else if (action === 'vote' && optionId) {
      await realtimeStore.addVote(optionId);
    } else if (action === 'chat' && username && message) {
      await realtimeStore.addChatMessage(username, message);
    }

    // Return current state
    const state = await realtimeStore.getState();
    return Response.json(state);
  } catch (error) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
