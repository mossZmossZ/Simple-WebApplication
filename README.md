# Real-Time Interactive Web Application

A simple, interactive web application built with Next.js and Tailwind CSS that demonstrates real-time functionality. Users can interact with the application and see live updates across multiple sessions.

## Features

- 🎯 **Live Counter**: Increment, decrement, or reset a counter that updates in real-time for all users
- 💬 **Live Chat**: Send messages and see them appear instantly for everyone
- 🗳️ **Live Voting**: Vote on options and watch the results update in real-time with visual progress bars

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Server-Sent Events (SSE)** - Real-time updates

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How It Works

The application uses Server-Sent Events (SSE) to push real-time updates to all connected clients. When a user performs an action (increment counter, send chat message, vote), it:

1. Sends a request to the API route
2. Updates the in-memory store
3. Broadcasts the update to all connected clients via SSE
4. All clients receive and display the update instantly

## Usage Tips

- Open the application in multiple browser tabs or windows to see real-time synchronization
- Share the URL with friends to test multi-user interactions
- The chat keeps the last 50 messages
- Each user can vote once per session in the voting section

## Project Structure

```
├── app/
│   ├── api/realtime/route.ts  # API endpoint for actions and SSE
│   ├── globals.css            # Global styles with Tailwind
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page with tabs
├── components/
│   ├── LiveCounter.tsx        # Counter component
│   ├── LiveChat.tsx           # Chat component
│   └── LiveVotes.tsx          # Voting component
└── lib/
    └── realtime-store.ts      # In-memory store for real-time data
```

## Notes

- This uses an in-memory store, so data resets when the server restarts
- For production use, consider integrating with Redis, a database, or a real-time service like Pusher or Socket.io
- The application is fully responsive and works on mobile devices

## License

MIT
