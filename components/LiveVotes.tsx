'use client';

import { useState, useEffect } from 'react';

interface VoteOption {
  id: string;
  label: string;
  votes: number;
}

export default function LiveVotes() {
  const [votes, setVotes] = useState<VoteOption[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Connect to Server-Sent Events
    const eventSource = new EventSource('/api/realtime');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setVotes(data.votes || []);
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

  const handleVote = async (optionId: string) => {
    if (!hasVoted) {
      await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'vote',
          optionId,
        }),
      });
      setHasVoted(true);
    }
  };

  const totalVotes = votes.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Live Voting</h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Total Votes: <span className="font-bold text-blue-600 dark:text-blue-400">{totalVotes}</span>
        </p>
      </div>

      <div className="space-y-4">
        {votes.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          return (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800 dark:text-white text-lg">
                  {option.label}
                </span>
                <span className="text-gray-600 dark:text-gray-300 font-bold">
                  {option.votes} votes ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="relative h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out flex items-center justify-end pr-4"
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 10 && (
                    <span className="text-white font-semibold text-sm">
                      {percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
                {percentage <= 10 && (
                  <div className="absolute inset-0 flex items-center justify-end pr-4">
                    <span className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={`w-full py-3 rounded-lg font-semibold transition-all transform ${
                  hasVoted
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {hasVoted ? '✓ Voted' : `Vote for ${option.label}`}
              </button>
            </div>
          );
        })}
      </div>

      {hasVoted && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <p className="text-green-800 dark:text-green-200 font-semibold">
            ✓ Thank you for voting! Watch the results update in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
