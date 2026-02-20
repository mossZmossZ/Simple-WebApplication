'use client';

import { useState, useEffect } from 'react';
import LiveCounter from '@/components/LiveCounter';
import LiveChat from '@/components/LiveChat';
import LiveVotes from '@/components/LiveVotes';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'counter' | 'chat' | 'votes'>('counter');

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
            🚀 Real-Time Interactive App
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Interact and watch live updates in real-time
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
            <button
              onClick={() => setActiveTab('counter')}
              className={`px-6 py-3 rounded-md font-semibold transition-all ${
                activeTab === 'counter'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Live Counter
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 rounded-md font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Live Chat
            </button>
            <button
              onClick={() => setActiveTab('votes')}
              className={`px-6 py-3 rounded-md font-semibold transition-all ${
                activeTab === 'votes'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Live Votes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'counter' && <LiveCounter />}
          {activeTab === 'chat' && <LiveChat />}
          {activeTab === 'votes' && <LiveVotes />}
        </div>
      </div>
    </main>
  );
}
