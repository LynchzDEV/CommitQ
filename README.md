# Real-time Queue Management System

A real-time queue management system built with Next.js, TypeScript, and Socket.IO. This application allows multiple users to collaboratively manage a queue with real-time updates across all connected clients.

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
- **Real-time Communication**: Socket.IO
- **Styling**: CSS-in-JS with styled-jsx
- **State Management**: React hooks with Socket.IO integration

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

## Docker Deployment

This application can be containerized using Docker for easy deployment and scalability.

### Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

### Building the Docker Image

Build the Docker image using the provided Dockerfile:

```bash
docker build -t commitq .
```

### Running with Docker

Run the container:

```bash
docker run -p 3000:3000 commitq
```

The application will be available at `http://localhost:3000`.

### Using Docker Compose

For easier management, use the provided `docker-compose.yml`:

```bash
# Build and start the container
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop the container
docker-compose down
```

### Docker Features

- **Multi-stage build**: Optimized image size using multi-stage Dockerfile
- **Non-root user**: Runs as non-root user for security
- **Health checks**: Built-in health monitoring via `/api/health` endpoint
- **Production optimized**: Uses Next.js standalone output for minimal image size
- **Environment variables**: Configurable via Docker environment variables

### Environment Variables

The following environment variables can be configured:

- `NODE_ENV`: Set to `production` for production builds (default: production)
- `PORT`: Port number for the application (default: 3000)
- `HOSTNAME`: Hostname to bind to (default: 0.0.0.0)
- `NEXT_TELEMETRY_DISABLED`: Disable Next.js telemetry (default: 1)

Example with custom environment variables:

```bash
docker run -p 8080:8080 -e PORT=8080 -e NODE_ENV=production commitq
```

### Health Check

The Docker container includes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
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

### Socket.IO Events

#### Client to Server Events:
- `queue:add` - Add a new item to the queue
- `queue:remove` - Remove an item from the queue
- `queue:start-timer` - Start a timer for the first queue item
- `queue:stop-timer` - Stop an active timer
- `queue:get-state` - Request current queue state

#### Server to Client Events:
- `queue:updated` - Queue state has been updated
- `queue:item-added` - New item was added to the queue
- `queue:item-removed` - Item was removed from the queue
- `queue:timer-started` - Timer was started for an item
- `queue:timer-expired` - Timer has expired for an item
- `queue:error` - Error occurred during operation

## File Structure

```
src/
├── hooks/
│   └── useSocket.ts          # Socket.IO connection and queue management
├── pages/
│   ├── api/
│   │   └── socket.ts         # Socket.IO server implementation
│   ├── _app.tsx             # Next.js app configuration
│   ├── _document.tsx        # Next.js document configuration
│   └── index.tsx            # Main queue management interface
└── types/
    └── queue.ts             # TypeScript type definitions
```

## Key Components

### useSocket Hook
Custom React hook that manages:
- Socket.IO connection
- Queue state management
- Real-time event handling
- Error handling

### Socket.IO Server
- Handles real-time communication
- Manages in-memory queue state
- Implements timer functionality
- Broadcasts updates to all clients

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

## Troubleshooting

### Connection Issues
- Ensure the development server is running
- Check browser console for WebSocket connection errors
- Verify firewall settings aren't blocking connections

### Timer Not Working
- Only the first item in queue can have a timer
- Ensure the item hasn't been removed from the queue
- Check that timer duration is within valid range (5-300 seconds)

### Real-time Updates Not Working
- Check connection status indicator in the top-right corner
- Refresh the page to re-establish connection
- Verify Socket.IO server is running properly

## License

This project is open source and available under the [MIT License](LICENSE).