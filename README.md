# Real-time Queue Management System

A real-time queue management system built with Next.js, TypeScript, and Server-Sent Events (SSE). This application allows multiple users to collaboratively manage a queue with real-time updates across all connected clients. **Optimized for Vercel deployment!**

## Features

- **Real-time Updates**: All queue changes are instantly synchronized across all connected users
- **Add Queue Items**: Add new items to the queue with a custom name
- **Remove Queue Items**: Remove any item from the queue at any time
- **Timer Functionality**: Start a countdown timer for the first item in the queue
- **Auto-removal**: Items are automatically removed when their timer expires
- **Currently Serving**: Visual indication of which item is currently being served
- **Responsive Design**: Works on desktop and mobile devices
- **Connection Status**: Visual indicator of connection status

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Real-time Communication**: Server-Sent Events (SSE)
- **Styling**: CSS-in-JS with styled-jsx
- **State Management**: React hooks with SSE integration
- **Deployment**: Optimized for Vercel serverless functions

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd commitq
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Usage

### Adding Items to Queue

1. Enter a name in the "Enter queue name..." input field
2. Click "Add to Queue" or press Enter
3. The item will appear in the queue and be visible to all connected users in real-time

### Managing Queue Items

- **View Queue**: All queue items are displayed with their position number and timestamp
- **Remove Items**: Click the "Remove" button next to any queue item
- **First in Line**: The first item in the queue is highlighted with a blue border

### Timer Functionality

1. **Start Timer**: Click "Start Timer" on the first item in the queue
2. **Set Duration**: Adjust the timer duration (5-300 seconds) using the input field
3. **Timer Display**: Active timers show remaining time and a progress bar
4. **Auto-removal**: Items are automatically removed when the timer expires
5. **Stop Timer**: Click "Stop Timer" to cancel an active timer

### Real-time Features

- All actions are immediately synchronized across all connected browsers
- Connection status is displayed in the top-right corner
- Error messages are shown for invalid operations
- Queue updates happen instantly without page refresh

## API Structure

### API Structure

#### HTTP API Endpoints:
- `POST /api/events` - Send actions to the server
  - `queue:add` - Add a new item to the queue
  - `queue:remove` - Remove an item from the queue
  - `queue:start-timer` - Start a timer for the first queue item
  - `queue:stop-timer` - Stop an active timer
  - `queue:get-state` - Request current queue state

#### Server-Sent Events:
- `GET /api/events` - Subscribe to real-time updates
  - `queue:updated` - Queue state has been updated
  - `queue:item-added` - New item was added to the queue
  - `queue:item-removed` - Item was removed from the queue
  - `queue:timer-started` - Timer was started for an item
  - `queue:timer-expired` - Timer has expired for an item

## File Structure

```
src/
├── hooks/
│   └── useSSE.ts            # Server-Sent Events connection and queue management
├── pages/
│   ├── api/
│   │   └── sse.ts           # SSE server implementation with HTTP actions
│   ├── _app.tsx             # Next.js app configuration
│   ├── _document.tsx        # Next.js document configuration
│   └── index.tsx            # Main queue management interface
└── types/
    └── queue.ts             # TypeScript type definitions
```

## Key Components

### useRealtime Hook
Custom React hook that manages:
- Server-Sent Events connection
- Queue state management
- Real-time event handling
- Error handling

### SSE Server
- Handles real-time communication via Server-Sent Events
- Manages in-memory queue state
- Implements timer functionality
- Broadcasts updates to all clients
- **Vercel Compatible**: Works with serverless functions

### Queue Interface
- Responsive UI for queue management
- Real-time timer display with progress bars
- Visual indicators for queue status
- Mobile-friendly design

## Configuration

### Timer Settings
- Default timer duration: 30 seconds
- Minimum duration: 5 seconds
- Maximum duration: 300 seconds (5 minutes)
- Timer resolution: 1 second

### Queue Limitations
- Maximum queue name length: 50 characters
- No limit on queue size
- Timers only available for first queue item

## Development

### Running in Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000` with hot reloading enabled.

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Vercel Deployment

This application is specifically optimized for Vercel deployment:

1. **Deploy to Vercel**:
```bash
npm install -g vercel
vercel --prod
```

2. **Environment**: No additional environment variables needed
3. **Serverless Functions**: SSE endpoint works with Vercel's serverless architecture
4. **Real-time**: Uses Server-Sent Events instead of WebSockets for Vercel compatibility

## Troubleshooting

### Connection Issues
- Ensure the development server is running
- Check browser console for SSE connection errors
- Verify firewall settings aren't blocking connections
- **Vercel**: SSE works better than WebSockets on Vercel's platform

### Timer Not Working
- Only the first item in queue can have a timer
- Ensure the item hasn't been removed from the queue
- Check that timer duration is within valid range (5-300 seconds)

### Real-time Updates Not Working
- Check connection status indicator in the top-right corner
- Refresh the page to re-establish SSE connection
- **Vercel**: SSE automatically reconnects on connection loss
- Verify the `/api/sse` endpoint is accessible
- Connection automatically retries every 3 seconds on failure

## License

This project is open source and available under the [MIT License](LICENSE).