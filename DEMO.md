# Demo Script - Real-time Queue Management System

This demo showcases the key features of the real-time queue management system.

## Setup Instructions

1. Start the development server:
```bash
npm run dev
```

2. Open multiple browser tabs/windows to `http://localhost:3000` to simulate multiple users

## Demo Scenarios

### Scenario 1: Basic Queue Management

**Steps to demonstrate:**

1. **Add queue items** (in Tab 1):
   - Enter "Alice" and click "Add to Queue"
   - Enter "Bob" and click "Add to Queue" 
   - Enter "Charlie" and click "Add to Queue"

2. **Observe real-time updates** (in Tab 2):
   - Notice all items appear instantly
   - See position numbers (#1, #2, #3)
   - First item (Alice) has blue border highlighting

3. **Remove an item** (in Tab 1):
   - Click "Remove" next to Bob (#2)
   - Watch Charlie move up to position #2 in both tabs

### Scenario 2: Timer Functionality

**Steps to demonstrate:**

1. **Start timer for first item** (in Tab 1):
   - Set timer duration to 10 seconds
   - Click "Start Timer" on Alice (#1)
   - Notice "Currently Serving" section appears

2. **Real-time timer display** (in both tabs):
   - Watch countdown timer: "⏱️ 0:10", "⏱️ 0:09", etc.
   - See progress bar filling up
   - Alice gets orange border (currently serving)

3. **Timer expiration**:
   - Wait for timer to reach 0:00
   - Alice automatically disappears from queue
   - Next person (Charlie) moves to #1

### Scenario 3: Timer Management

**Steps to demonstrate:**

1. **Add new items and start timer**:
   - Add "David" and "Emma" to queue
   - Start 15-second timer for David (#1)

2. **Stop timer before expiration** (in Tab 2):
   - Click "Stop Timer" while countdown is active
   - Timer disappears and David stays in queue
   - "Currently Serving" section disappears

3. **Try starting timer on non-first item**:
   - Try clicking a "Start Timer" button (there won't be one)
   - Only first item in queue can have timer started

### Scenario 4: Connection Status

**Steps to demonstrate:**

1. **Check connection indicator**:
   - Top-right shows "🟢 Connected"
   - All updates happen in real-time

2. **Simulate disconnect** (optional):
   - Close dev server briefly
   - Notice "🔴 Disconnected" status
   - Restart server and see reconnection

### Scenario 5: Mobile Responsiveness

**Steps to demonstrate:**

1. **Open on mobile device or resize browser**:
   - Layout adapts to smaller screens
   - Form elements stack vertically
   - Queue items remain fully functional

## Key Features Highlighted

✅ **Real-time synchronization** - All changes visible across all connected users instantly
✅ **Queue management** - Add/remove items with position tracking
✅ **Timer functionality** - Start countdown timers for first queue item
✅ **Auto-removal** - Items automatically removed when timer expires
✅ **Visual feedback** - Clear indication of queue position and timer status
✅ **Error handling** - Graceful error messages for invalid operations
✅ **Connection status** - Visual indicator of connection state
✅ **Responsive design** - Works on desktop and mobile devices

## Technical Highlights

- **Socket.IO** provides real-time bidirectional communication
- **TypeScript** ensures type safety throughout the application
- **React hooks** manage state and Socket.IO integration
- **CSS-in-JS** provides responsive and modern styling
- **Next.js** handles both frontend and API routes

## Demo Tips

1. **Use multiple browser tabs** to best demonstrate real-time features
2. **Set short timer durations** (5-15 seconds) for quick demos
3. **Add several queue items** to show position management
4. **Try various operations** from different tabs to show synchronization
5. **Show the "Currently Serving" feature** by starting timers

## Common Demo Questions & Answers

**Q: What happens if multiple users try to start a timer?**
A: Only the first item in queue can have a timer. Error message shown for others.

**Q: Can items be removed while timer is running?**
A: Yes, any item can be removed at any time, including timed items.

**Q: What's the maximum queue size?**
A: No limit imposed - queue can grow as needed.

**Q: Does the timer persist if user refreshes?**
A: No, timers are in-memory only. This is a demo limitation.

**Q: Can timer duration be changed after starting?**
A: No, but timer can be stopped and restarted with new duration.