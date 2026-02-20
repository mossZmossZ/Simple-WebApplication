'use client';

import { useState, useEffect } from 'react';

interface CounterState {
  count: number;
  lastUpdated: number;
}

export default function LiveCounter() {
  // Use a stable initial value to avoid hydration mismatch with Date.now()
  const [counter, setCounter] = useState<CounterState>({ count: 0, lastUpdated: 0 });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to Server-Sent Events
    const eventSource = new EventSource('/api/realtime');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setCounter(data.counter);
      } catch (e) {
        console.error('Error parsing SSE data:', e);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleAction = async (action: string) => {
    await fetch('/api/realtime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {isConnected ? 'Live Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {counter.count}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Last updated: {formatTime(counter.lastUpdated)}
          </p>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => handleAction('decrement')}
            className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            ➖ Decrement
          </button>
          <button
            onClick={() => handleAction('reset')}
            className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            🔄 Reset
          </button>
          <button
            onClick={() => handleAction('increment')}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            ➕ Increment
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            💡 <strong>Tip:</strong> Open this page in multiple tabs or share with friends to see real-time updates!
          </p>
        </div>
      </div>
    </div>
  );
}
